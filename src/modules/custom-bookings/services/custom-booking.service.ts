import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CustomBookingStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    CreateCustomBookingDto,
    CreateCustomBookingOfferDto,
    CustomBookingQueryDto,
    UpdateCustomBookingStatusDto,
} from '../dto/custom-booking.dto';
import {
    CustomBookingEntity,
    CustomBookingOfferEntity,
} from '../entities/custom-booking.entity';
import {
    ICustomBookingRepository,
    Pagination,
} from '../repositories/interfaces/custom-booking.repository.interface';
import { CUSTOM_BOOKING_REPOSITORY } from '../repositories/repository.provider';
import { CustomBookingCreatedEvent } from '../events/custom-booking-created.event';
import { CustomBookingOfferAcceptedEvent } from '../events/custom-booking-offer-accepted.event';

// Statuses that cannot be transitioned out of
const TERMINAL_STATUSES: CustomBookingStatus[] = [
    CustomBookingStatus.COMPLETED,
    CustomBookingStatus.CANCELLED,
];

// Which roles may request which target statuses
const DRIVER_ALLOWED_STATUSES: CustomBookingStatus[] = [
    CustomBookingStatus.IN_PROGRESS,
    CustomBookingStatus.COMPLETED,
];
const TOURIST_ALLOWED_STATUSES: CustomBookingStatus[] = [CustomBookingStatus.CANCELLED];
const ADMIN_ALLOWED_STATUSES: CustomBookingStatus[] = [CustomBookingStatus.CANCELLED];

@Injectable()
export class CustomBookingService {
    constructor(
        @Inject(CUSTOM_BOOKING_REPOSITORY)
        private readonly repo: ICustomBookingRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    // ─── Create ──────────────────────────────────────────────────────────────

    async create(
        dto: CreateCustomBookingDto,
        userId: string,
    ): Promise<CustomBookingEntity> {
        const booking = await this.repo.create(dto, userId);
        this.eventEmitter.emit(
            'custom-booking.created',
            new CustomBookingCreatedEvent(booking),
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

    async findById(id: string): Promise<CustomBookingEntity> {
        const booking = await this.repo.findById(id);
        if (!booking) throw new NotFoundException(`CustomBooking ${id} not found`);
        return booking;
    }

    // ─── Status update (role-aware) ──────────────────────────────────────────

    /**
     * Central status-update method. Validates:
     *
     * DRIVER → IN_PROGRESS | COMPLETED
     *   - Booking must be CONFIRMED or IN_PROGRESS respectively
     *   - Caller must be the driver whose offer was accepted
     *
     * TOURIST → CANCELLED
     *   - Caller must own the booking
     *   - Booking must not already be terminal
     *
     * ADMIN → CANCELLED
     *   - Any booking that is not already terminal
     */
    async updateStatus(
        id: string,
        dto: UpdateCustomBookingStatusDto,
        callerId: string,
        callerRole: string,
    ): Promise<CustomBookingEntity> {
        const booking = await this.findById(id);
        const { status: target } = dto;

        if (TERMINAL_STATUSES.includes(booking.status)) {
            throw new BadRequestException(
                `Cannot update a booking that is already ${booking.status}`,
            );
        }

        // ── DRIVER ──────────────────────────────────────────────────────────────
        if (callerRole === 'DRIVER') {
            if (!DRIVER_ALLOWED_STATUSES.includes(target)) {
                throw new ForbiddenException(
                    `Drivers may only set status to IN_PROGRESS or COMPLETED`,
                );
            }

            // Verify this driver's offer was the accepted one
            const acceptedOffer = await this.repo.findAcceptedOfferByBookingId(id);
            if (!acceptedOffer || acceptedOffer.driverId !== callerId) {
                throw new ForbiddenException(
                    'Only the driver whose offer was accepted can update this booking',
                );
            }

            // Enforce valid transition
            if (
                target === CustomBookingStatus.IN_PROGRESS &&
                booking.status !== CustomBookingStatus.CONFIRMED
            ) {
                throw new BadRequestException(
                    'Booking must be CONFIRMED before it can be set to IN_PROGRESS',
                );
            }
            if (
                target === CustomBookingStatus.COMPLETED &&
                booking.status !== CustomBookingStatus.IN_PROGRESS
            ) {
                throw new BadRequestException(
                    'Booking must be IN_PROGRESS before it can be set to COMPLETED',
                );
            }
        }

        // ── TOURIST ─────────────────────────────────────────────────────────────
        else if (callerRole === 'TOURIST') {
            if (!TOURIST_ALLOWED_STATUSES.includes(target)) {
                throw new ForbiddenException('Tourists may only cancel their own booking');
            }
            if (booking.userId !== callerId) {
                throw new ForbiddenException('You can only cancel your own booking');
            }
        }

        // ── ADMIN ────────────────────────────────────────────────────────────────
        else if (callerRole === 'ADMIN') {
            if (!ADMIN_ALLOWED_STATUSES.includes(target)) {
                throw new ForbiddenException('Admins may only cancel bookings via this endpoint');
            }
        }

        // Unknown role
        else {
            throw new ForbiddenException('Insufficient permissions');
        }

        return this.repo.updateStatus(id, target);
    }

    // ─── Offers ───────────────────────────────────────────────────────────────

    async createOffer(
        customBookingId: string,
        driverId: string,
        dto: CreateCustomBookingOfferDto,
    ): Promise<CustomBookingOfferEntity> {
        const booking = await this.findById(customBookingId);

        if (TERMINAL_STATUSES.includes(booking.status)) {
            throw new ForbiddenException('Cannot submit offer for a closed booking');
        }

        const offer = await this.repo.createOffer(customBookingId, driverId, dto);

        // Advance to OFFER_RECEIVED on first offer
        if (booking.status === CustomBookingStatus.PENDING) {
            await this.repo.updateStatus(
                customBookingId,
                CustomBookingStatus.OFFER_RECEIVED,
            );
        }

        return offer;
    }

    async getOffers(customBookingId: string): Promise<CustomBookingOfferEntity[]> {
        await this.findById(customBookingId);
        return this.repo.findOffersByBookingId(customBookingId);
    }

    async acceptOffer(
        customBookingId: string,
        offerId: string,
        userId: string,
    ): Promise<CustomBookingOfferEntity> {
        const booking = await this.findById(customBookingId);

        if (booking.userId !== userId) {
            throw new ForbiddenException('Only the booking owner can accept an offer');
        }

        const offer = await this.repo.findOfferById(offerId);
        if (!offer || offer.customBookingId !== customBookingId) {
            throw new NotFoundException(`Offer ${offerId} not found on this booking`);
        }

        const accepted = await this.repo.acceptOffer(offerId);
        this.eventEmitter.emit(
            'custom-booking.offer.accepted',
            new CustomBookingOfferAcceptedEvent(customBookingId, accepted),
        );
        return accepted;
    }
}
