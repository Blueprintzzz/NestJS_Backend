import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CustomBookingStatus, OfferStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    CreateCustomBookingDto,
    CreateDriverOfferDto,
    CustomBookingQueryDto,
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
import { VehiclesService } from '../../vehicles/services/vehicles.service';

// Terminal statuses
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
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `CB-${date}-${rand}`;
}

@Injectable()
export class CustomBookingService {
    constructor(
        @Inject(CUSTOM_BOOKING_REPOSITORY)
        private readonly repo: ICustomBookingRepository,
        private readonly eventEmitter: EventEmitter2,
        private readonly vehiclesService: VehiclesService,
    ) { }

    // ─── Create ──────────────────────────────────────────────────────────────

    async create(dto: CreateCustomBookingDto, userId: string): Promise<CustomBookingEntity> {
        const bookingNumber = generateBookingNumber();
        const booking = await this.repo.create(dto, userId, bookingNumber);

        this.eventEmitter.emit(
            'custom-booking.created',
            new CustomBookingCreatedEvent(
                booking.id,
                booking.requestedVehicleType,
                booking.requestedModelId,
                booking.startDate,
                booking.endDate,
                booking.numberOfPeople,
                booking.pickupLocation,
                booking.dropoffLocation,
            ),
        );
        return booking;
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    async findForUser(
        userId: string,
        userRole: string,
        query: CustomBookingQueryDto,
    ): Promise<Pagination<CustomBookingEntity>> {
        if (userRole === 'ADMIN') return this.repo.findAll(query);
        return this.repo.findByUserId(userId, query);
    }

    async findById(
        id: string,
        callerId?: string,
        callerRole?: string,
    ): Promise<CustomBookingEntity> {
        const booking = await this.repo.findById(id);
        if (!booking) throw new NotFoundException(`CustomBooking ${id} not found`);

        // Access control for GET by id
        if (callerRole && callerId) {
            if (callerRole === 'TOURIST' && booking.userId !== callerId) {
                throw new ForbiddenException('You can only view your own bookings');
            }
            if (callerRole === 'DRIVER') {
                // Driver may see if they have an offer on it
                const offer = await this.repo.findOfferByDriverAndBooking(callerId, id);
                if (!offer) throw new ForbiddenException('You do not have an offer on this booking');
            }
        }
        return booking;
    }

    // ─── Status update ────────────────────────────────────────────────────────

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
            // Must be the driver whose offer was selected
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
            if (booking.userId !== callerId) {
                throw new ForbiddenException('You can only cancel your own booking');
            }
            const cancellableStatuses: CustomBookingStatus[] = [
                CustomBookingStatus.PENDING,
                CustomBookingStatus.OFFER_RECEIVED,
            ];
            if (!cancellableStatuses.includes(booking.status)) {
                throw new BadRequestException(`Cannot cancel a booking that is ${booking.status}`);
            }
        } else if (callerRole === 'ADMIN') {
            if (target !== CustomBookingStatus.CANCELLED) {
                throw new ForbiddenException('Admins may only cancel bookings via this endpoint');
            }
        } else {
            throw new ForbiddenException('Insufficient permissions');
        }

        return this.repo.updateStatus(id, target);
    }

    // ─── Offers ───────────────────────────────────────────────────────────────

    async createOffer(
        customBookingId: string,
        driverId: string,
        dto: CreateDriverOfferDto,
    ): Promise<DriverOfferEntity> {
        const booking = await this.repo.findById(customBookingId);
        if (!booking) throw new NotFoundException(`CustomBooking ${customBookingId} not found`);

        if (TERMINAL.includes(booking.status)) {
            throw new ForbiddenException('Cannot offer on a closed booking');
        }
        if (
            booking.status !== CustomBookingStatus.PENDING &&
            booking.status !== CustomBookingStatus.OFFER_RECEIVED
        ) {
            throw new BadRequestException('Booking is no longer accepting offers');
        }

        // Vehicle must belong to this driver
        const vehicle = await this.vehiclesService.getVehicleById(dto.vehicleId);
        if (vehicle.driverId !== driverId) {
            throw new ForbiddenException('You can only offer your own vehicles');
        }
        if (vehicle.status !== 'ACTIVE') {
            throw new BadRequestException('Vehicle is not active');
        }

        // Driver must not have already submitted an offer
        const existing = await this.repo.findOfferByDriverAndBooking(driverId, customBookingId);
        if (existing) {
            throw new ConflictException('You have already submitted an offer for this booking');
        }

        // Vehicle must be available for the booking dates
        const available = await this.vehiclesService.getAvailableForCustomBooking(
            booking.startDate,
            booking.endDate,
            booking.requestedVehicleType,
        );
        const isAvailable = available.some((v) => v.id === dto.vehicleId);
        if (!isAvailable) {
            throw new BadRequestException('Vehicle is not available for the requested dates');
        }

        const offer = await this.repo.createOffer(customBookingId, driverId, dto);

        // Advance booking to OFFER_RECEIVED on first offer
        if (booking.status === CustomBookingStatus.PENDING) {
            await this.repo.updateStatus(customBookingId, CustomBookingStatus.OFFER_RECEIVED);
        }

        this.eventEmitter.emit(
            'driver-offer.submitted',
            new DriverOfferSubmittedEvent(customBookingId, driverId, offer.id, offer.price),
        );
        return offer;
    }

    async getOffers(
        customBookingId: string,
        callerId: string,
        callerRole: string,
    ): Promise<DriverOfferEntity[]> {
        const booking = await this.repo.findById(customBookingId);
        if (!booking) throw new NotFoundException(`CustomBooking ${customBookingId} not found`);

        if (callerRole === 'DRIVER') {
            const offer = await this.repo.findOfferByDriverAndBooking(callerId, customBookingId);
            return offer ? [offer] : [];
        }
        return this.repo.findOffersByBookingId(customBookingId);
    }

    async acceptOffer(
        customBookingId: string,
        offerId: string,
        userId: string,
    ): Promise<DriverOfferEntity> {
        const booking = await this.repo.findById(customBookingId);
        if (!booking) throw new NotFoundException(`CustomBooking ${customBookingId} not found`);

        if (booking.userId !== userId) {
            throw new ForbiddenException('Only the booking owner can accept an offer');
        }
        if (booking.status !== CustomBookingStatus.OFFER_RECEIVED) {
            throw new BadRequestException('Booking must be in OFFER_RECEIVED state to accept an offer');
        }

        const offer = await this.repo.findOfferById(offerId);
        if (!offer || offer.customBookingId !== customBookingId) {
            throw new NotFoundException(`Offer ${offerId} not found on this booking`);
        }
        if (offer.status !== OfferStatus.PENDING) {
            throw new BadRequestException('Only PENDING offers can be accepted');
        }

        // Accept this offer, reject the rest, set selectedOfferId, set CONFIRMED
        await this.repo.updateOfferStatus(offerId, OfferStatus.ACCEPTED);
        await this.repo.rejectAllOtherOffers(customBookingId, offerId);
        await this.repo.setSelectedOffer(customBookingId, offerId);

        // Reserve vehicle availability
        await this.vehiclesService.reserveVehicle(
            offer.vehicleId,
            customBookingId,
            booking.startDate.toISOString(),
            booking.endDate.toISOString(),
        );

        this.eventEmitter.emit(
            'custom-booking.confirmed',
            new CustomBookingConfirmedEvent(customBookingId, offer.driverId, offer.vehicleId, offer.price),
        );

        return (await this.repo.findOfferById(offerId))!;
    }

    async rejectOffer(
        customBookingId: string,
        offerId: string,
        userId: string,
    ): Promise<DriverOfferEntity> {
        const booking = await this.repo.findById(customBookingId);
        if (!booking) throw new NotFoundException(`CustomBooking ${customBookingId} not found`);

        if (booking.userId !== userId) {
            throw new ForbiddenException('Only the booking owner can reject an offer');
        }

        const offer = await this.repo.findOfferById(offerId);
        if (!offer || offer.customBookingId !== customBookingId) {
            throw new NotFoundException(`Offer ${offerId} not found on this booking`);
        }
        if (offer.status !== OfferStatus.PENDING) {
            throw new BadRequestException('Only PENDING offers can be rejected');
        }

        return this.repo.updateOfferStatus(offerId, OfferStatus.REJECTED);
    }
}
