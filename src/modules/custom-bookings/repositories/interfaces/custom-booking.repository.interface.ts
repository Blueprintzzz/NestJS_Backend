import { CustomBookingStatus } from '@prisma/client';
import {
    CreateCustomBookingDto,
    CreateCustomBookingOfferDto,
    CustomBookingQueryDto,
} from '../../dto/custom-booking.dto';
import {
    CustomBookingEntity,
    CustomBookingOfferEntity,
} from '../../entities/custom-booking.entity';

export interface Pagination<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface ICustomBookingRepository {
    create(dto: CreateCustomBookingDto, userId: string): Promise<CustomBookingEntity>;
    findById(id: string): Promise<CustomBookingEntity | null>;
    findByUserId(userId: string, query: CustomBookingQueryDto): Promise<Pagination<CustomBookingEntity>>;
    findAll(query: CustomBookingQueryDto): Promise<Pagination<CustomBookingEntity>>;
    updateStatus(id: string, status: CustomBookingStatus): Promise<CustomBookingEntity>;
    delete(id: string): Promise<boolean>;

    // Offers
    createOffer(customBookingId: string, driverId: string, dto: CreateCustomBookingOfferDto): Promise<CustomBookingOfferEntity>;
    findOffersByBookingId(customBookingId: string): Promise<CustomBookingOfferEntity[]>;
    findOfferById(offerId: string): Promise<CustomBookingOfferEntity | null>;
    findAcceptedOfferByBookingId(customBookingId: string): Promise<CustomBookingOfferEntity | null>;
    acceptOffer(offerId: string): Promise<CustomBookingOfferEntity>;
}
