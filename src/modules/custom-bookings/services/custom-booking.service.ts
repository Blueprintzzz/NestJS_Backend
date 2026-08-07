import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { CustomBookingStatus, OfferStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import {
    CreateCustomBookingDto,
    CreateDriverOfferDto,
    CustomBookingQueryDto,
    UpdateCustomBookingDto,
    UpdateCustomBookingStatusDto,
} from '../dto/custom-booking.dto';
import { CustomBookingEntity, DriverOfferEntity } from '../entities/custom-booking.entity';
import {
    ICustomBookingRepository,
    Pagination,
} from '../repositories/interfaces/custom-booking.repository.interface';
import { CUSTOM_BOOKING_REPOSITORY } from '../repositories/repository.provider';
import { CustomBookingCreatedEvent } from '../events/custom-booking-created.event';
import { CustomBookingConfirmedEvent } from '../events/custom-booking-confirmed.event';
import { DriverOfferSubmittedEvent } from '../events/driver-offer-submitted.event';

const TERMINAL: CustomBookingStatus[] = [
    CustomBookingStatus.COMPLETED,
    CustomBookingStatus.CANCELLED,
];

const DRIVER_ALLOWED: CustomBookingStatus[] = [
    CustomBookingStatus.IN_PROGRESS,
    CustomBookingStatus.COMPLETED,
];

function generateBookingNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = Math.random().toString(36).toUpperCase().slice(2, 7);
    return `CPK-${date}-${suffix}`;
}

@Injectable()
export class CustomBookingService {
    constructor(
        @Inject(CUSTOM_BOOKING_REPOSITORY)
        private readonly repo: ICustomBookingRepository,
        private readonly eventEmitter: EventEmitter2,
        private readonly prisma: PrismaService,
    ) {}

    // ─── 1. Create ────────────────────────────────────────────────────────────

    async create(dto: CreateCustomBookingDto, userId: string): Promise<CustomBookingEntity> {
        if (dto.requestedModelId) {
            const model = await this.prisma.vehicleModel.findUnique({ where: { id: dto.requestedModelId } });
            if (!model) throw new NotFoundException(`VehicleModel ${dto.requestedModelId} not found`);
        }

        let booking: CustomBookingEntity | null = null;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                booking = await this.repo.create(dto, userId, generateBookingNumber());
                break;
            } catch (err: any) {
                if (err?.code === 'P2002' && attempt < 2) continue;
                throw err;
            }
        }

        this.eventEmitter.emit(
            'custom-booking.created',
            new CustomBookingCreatedEvent(
                booking!.id,
                booking!.requestedVehicleType,
                booking!.requestedModelId,
                booking!.startDate,
                booking!.endDate,
                booking!.numberOfPeople,
                booking!.pickupLocation,
                booking!.dropoffLocation,
            ),
        );
        return booking!;
    }

    // ─── 2. Admin list all ────────────────────────────────────────────────────

    async findAll(query: CustomBookingQueryDto): Promise<Pagination<CustomBookingEntity>> {
        return this.repo.findAll(query);
    }

    // ─── 3. Tourist: my bookings ──────────────────────────────────────────────

    async findMine(userId: string, query: CustomBookingQueryDto): Promise<Pagination<CustomBookingEntity>> {
        return this.repo.findByUserId(userId, query);
    }

    // ─── 4. Get by ID ─────────────────────────────────────────────────────────

    async findById(id: string, callerId: string, callerRole: string): Promise<CustomBookingEntity> {
        const booking = await this.repo.findById(id);
        if (!booking) throw new NotFoundException(`CustomBooking ${id} not found`);

        const isOwner = booking.userId === callerId;
        const isAdmin = callerRole === 'ADMIN';
        const isOfferingDriver =
            callerRole === 'DRIVER' &&
            Array.isArray(booking.offers) &&
            booking.offers.some((o) => o.driverId === callerId);

        if (!isOwner && !isAdmin && !isOfferingDriver) {
            throw new ForbiddenException();
        }
        return booking;
    }

    // ─── 5. Admin update status ───────────────────────────────────────────────

    async updateStatus(
        id: string,
        dto: UpdateCustomBookingStatusDto,
        callerId: string,
        callerRole: string,
    ): Promise<CustomBookingEntity> {
        const booking = await this.repo.findById(id);
        if (!booking) throw new NotFoundException(`CustomBooking ${id} not found`);
        const { status: target } = dto;

        if (TERMINAL.includes(booking.status)) {
            throw new BadRequestException(`Cannot update a booking already in ${booking.status} state`);
        }

        if (callerRole === 'DRIVER') {
            if (!DRIVER_ALLOWED.includes(target)) {
                throw new ForbiddenException('Drivers may only set IN_PROGRESS or COMPLETED');
            }
            const accepted = await this.repo.findAcceptedOfferByBookingId(id);
            if (!accepted || accepted.driverId !== callerId) {
                throw new ForbiddenException('Only the driver whose offer was accepted can update this booking');
            }
            if (target === CustomBookingStatus.IN_PROGRESS && booking.status !== CustomBookingStatus.CONFIRMED) {
                throw new BadRequestException('Booking must be CONFIRMED before IN_PROGRESS');
            }
            if (target === CustomBookingStatus.COMPLETED && booking.status !== CustomBookingStatus.IN_PROGRESS) {
                throw new BadRequestException('Booking must be IN_PROGRESS before COMPLETED');
            }
        } else if (callerRole === 'TOURIST') {
            if (target !== CustomBookingStatus.CANCELLED) {
                throw new ForbiddenException('Tourists may only cancel bookings');
            }
            if (booking.userId !== callerId) throw new ForbiddenException('You can only cancel your own booking');
            const cancellableStatuses: string[] = [CustomBookingStatus.PENDING, CustomBookingStatus.OFFER_RECEIVED];
            if (!cancellableStatuses.includes(booking.status)) {
                throw new BadRequestException(`Cannot cancel a booking that is ${booking.status}`);
            }
        } else if (callerRole !== 'ADMIN') {
            throw new ForbiddenException('Insufficient permissions');
        }

        return this.repo.updateStatus(id, target);
    }

    // ─── 6. Tourist update booking ────────────────────────────────────────────

    async update(id: string, dto: UpdateCustomBookingDto, userId: string): Promise<CustomBookingEntity> {
        const booking = await this.repo.findById(id);
        if (!booking) throw new NotFoundException(`CustomBooking ${id} not found`);
        if (booking.userId !== userId) throw new ForbiddenException();
        if (booking.status !== CustomBookingStatus.PENDING) {
            throw new ConflictException('Booking can only be updated while PENDING');
        }

        if (dto.requestedModelId) {
            const model = await this.prisma.vehicleModel.findUnique({ where: { id: dto.requestedModelId } });
            if (!model) throw new NotFoundException(`VehicleModel ${dto.requestedModelId} not found`);
        }

        return this.repo.update(id, dto);
    }

    // ─── 7. Delete / cancel ───────────────────────────────────────────────────

    async remove(id: string, userId: string, userRole: string): Promise<void> {
        const booking = await this.repo.findById(id);
        if (!booking) throw new NotFoundException(`CustomBooking ${id} not found`);

        if (userRole === 'TOURIST') {
            if (booking.userId !== userId) throw new ForbiddenException();
            if (booking.status !== CustomBookingStatus.PENDING) {
                throw new ConflictException('You can only cancel PENDING bookings');
            }
            await this.repo.updateStatus(id, CustomBookingStatus.CANCELLED);
        } else if (userRole === 'ADMIN') {
            const hasOffers = Array.isArray(booking.offers) && booking.offers.length > 0;
            if (hasOffers) {
                await this.repo.updateStatus(id, CustomBookingStatus.CANCELLED);
            } else {
                await this.repo.delete(id);
            }
        } else {
            throw new ForbiddenException();
        }
    }

    // ─── 8. Driver submits offer ──────────────────────────────────────────────

    async createOffer(customBookingId: string, driverId: string, dto: CreateDriverOfferDto): Promise<DriverOfferEntity> {
        const booking = await this.repo.findById(customBookingId);
        if (!booking) throw new NotFoundException(`CustomBooking ${customBookingId} not found`);

        const acceptingStatuses: string[] = [CustomBookingStatus.PENDING, CustomBookingStatus.OFFER_RECEIVED];
        if (!acceptingStatuses.includes(booking.status)) {
            throw new BadRequestException('This custom booking is no longer accepting offers');
        }

        const vehicle = await this.prisma.vehicle.findFirst({ where: { id: dto.vehicleId, driverId } });
        if (!vehicle) throw new ForbiddenException('Vehicle not found or does not belong to you');

        const existingOffer = await this.repo.findActivePendingOfferByDriverAndBooking(driverId, customBookingId);
        if (existingOffer) throw new ConflictException('You already have an active offer on this booking');

        if (new Date(dto.validUntil) <= new Date()) {
            throw new BadRequestException('validUntil must be a future date');
        }

        const offer = await this.repo.createOffer(customBookingId, driverId, dto);

        await this.prisma.customBooking.update({
            where: { id: customBookingId },
            data: { status: CustomBookingStatus.OFFER_RECEIVED },
        });

        this.eventEmitter.emit(
            'driver-offer.submitted',
            new DriverOfferSubmittedEvent(customBookingId, driverId, offer.id, offer.price),
        );
        return offer;
    }

    // ─── 9. List offers ───────────────────────────────────────────────────────

    async getOffers(customBookingId: string, callerId: string, callerRole: string): Promise<DriverOfferEntity[]> {
        const booking = await this.repo.findById(customBookingId);
        if (!booking) throw new NotFoundException(`CustomBooking ${customBookingId} not found`);

        const isAdmin = callerRole === 'ADMIN';
        const isOwner = booking.userId === callerId;
        if (!isAdmin && !isOwner) throw new ForbiddenException();

        return this.repo.findOffersByBookingId(customBookingId);
    }

    // ─── 10. Accept offer ─────────────────────────────────────────────────────

    async acceptOffer(customBookingId: string, offerId: string, userId: string): Promise<CustomBookingEntity> {
        const booking = await this.repo.findById(customBookingId);
        if (!booking) throw new NotFoundException(`CustomBooking ${customBookingId} not found`);
        if (booking.userId !== userId) throw new ForbiddenException('Only the booking owner can accept an offer');

        const offer = await this.repo.findOfferById(offerId);
        if (!offer || offer.customBookingId !== customBookingId) {
            throw new NotFoundException(`Offer ${offerId} not found on this booking`);
        }
        if (offer.status !== OfferStatus.PENDING) {
            throw new BadRequestException('Offer is no longer pending');
        }
        if (new Date(offer.validUntil) < new Date()) {
            throw new UnprocessableEntityException('Offer has expired');
        }

        await this.prisma.$transaction([
            this.prisma.driverOffer.update({ where: { id: offerId }, data: { status: 'ACCEPTED' } }),
            this.prisma.customBooking.update({
                where: { id: customBookingId },
                data: { selectedOfferId: offerId, status: 'CONFIRMED' },
            }),
            this.prisma.driverOffer.updateMany({
                where: { customBookingId, id: { not: offerId } },
                data: { status: 'REJECTED' },
            }),
        ]);

        this.eventEmitter.emit(
            'custom-booking.confirmed',
            new CustomBookingConfirmedEvent(customBookingId, offer.driverId, offer.vehicleId, offer.price),
        );

        return (await this.repo.findById(customBookingId))!;
    }

    // ─── 11. Reject offer ─────────────────────────────────────────────────────

    async rejectOffer(customBookingId: string, offerId: string, userId: string): Promise<DriverOfferEntity> {
        const booking = await this.repo.findById(customBookingId);
        if (!booking) throw new NotFoundException(`CustomBooking ${customBookingId} not found`);
        if (booking.userId !== userId) throw new ForbiddenException('Only the booking owner can reject an offer');

        const offer = await this.repo.findOfferById(offerId);
        if (!offer || offer.customBookingId !== customBookingId) {
            throw new NotFoundException(`Offer ${offerId} not found on this booking`);
        }
        if (offer.status !== OfferStatus.PENDING) {
            throw new BadRequestException('Only PENDING offers can be rejected');
        }

        return this.repo.updateOfferStatus(offerId, OfferStatus.REJECTED);
    }

    // ─── 12. Driver: available custom bookings ────────────────────────────────

    async getAvailableForDriver(driverId: string, query: any) {
        return this.repo.findAvailableForDriver(driverId, query);
    }

    // ─── 13. Driver: bookings where driver submitted an offer ─────────────────

    async getMyOffers(driverId: string, query: any) {
        return this.repo.findByDriverOffer(driverId, query);
    }
}
