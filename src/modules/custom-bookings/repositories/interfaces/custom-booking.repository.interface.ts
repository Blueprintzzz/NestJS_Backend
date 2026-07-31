import { CustomBookingStatus, OfferStatus } from '@prisma/client';
import {
    CreateCustomBookingDto,
    CreateDriverOfferDto,
    CustomBookingQueryDto,
    UpdateCustomBookingDto,
} from '../../dto/custom-booking.dto';
import { CustomBookingEntity, DriverOfferEntity } from '../../entities/custom-booking.entity';

export interface Pagination<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface ICustomBookingRepository {
    create(dto: CreateCustomBookingDto, userId: string, bookingNumber: string): Promise<CustomBookingEntity>;
    findById(id: string): Promise<CustomBookingEntity | null>;
    findByUserId(userId: string, query: CustomBookingQueryDto): Promise<Pagination<CustomBookingEntity>>;
    findAll(query: CustomBookingQueryDto): Promise<Pagination<CustomBookingEntity>>;
    update(id: string, dto: UpdateCustomBookingDto): Promise<CustomBookingEntity>;
    updateStatus(id: string, status: CustomBookingStatus): Promise<CustomBookingEntity>;
    setSelectedOffer(id: string, offerId: string): Promise<CustomBookingEntity>;
    delete(id: string): Promise<boolean>;

    createOffer(customBookingId: string, driverId: string, dto: CreateDriverOfferDto): Promise<DriverOfferEntity>;
    findOffersByBookingId(customBookingId: string): Promise<DriverOfferEntity[]>;
    findOfferById(offerId: string): Promise<DriverOfferEntity | null>;
    findOfferByDriverAndBooking(driverId: string, customBookingId: string): Promise<DriverOfferEntity | null>;
    findActivePendingOfferByDriverAndBooking(driverId: string, customBookingId: string): Promise<DriverOfferEntity | null>;
    findAcceptedOfferByBookingId(customBookingId: string): Promise<DriverOfferEntity | null>;
    updateOfferStatus(offerId: string, status: OfferStatus): Promise<DriverOfferEntity>;
    rejectAllOtherOffers(customBookingId: string, acceptedOfferId: string): Promise<void>;
}
