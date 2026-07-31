import { Injectable } from '@nestjs/common';
import { CustomBookingStatus, OfferStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    CreateCustomBookingDto,
    CreateDriverOfferDto,
    CustomBookingQueryDto,
    UpdateCustomBookingDto,
} from '../../dto/custom-booking.dto';
import { CustomBookingEntity, DriverOfferEntity } from '../../entities/custom-booking.entity';
import { ICustomBookingRepository, Pagination } from '../interfaces/custom-booking.repository.interface';

function toNumber(val: any): number | null {
    if (val == null) return null;
    return typeof val === 'object' ? parseFloat(val.toString()) : Number(val);
}

function mapOffer(raw: any): DriverOfferEntity {
    return {
        id: raw.id,
        customBookingId: raw.customBookingId,
        driverId: raw.driverId,
        driver: raw.driver,
        vehicleId: raw.vehicleId,
        vehicle: raw.vehicle,
        price: toNumber(raw.price) as number,
        message: raw.message,
        eta: raw.eta,
        status: raw.status,
        validUntil: raw.validUntil,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
    };
}

function mapBooking(raw: any): CustomBookingEntity {
    return {
        id: raw.id,
        bookingNumber: raw.bookingNumber,
        userId: raw.userId,
        user: raw.user,
        title: raw.title,
        description: raw.description,
        startDate: raw.startDate,
        endDate: raw.endDate,
        numberOfPeople: raw.numberOfPeople,
        budget: toNumber(raw.budget),
        pickupLocation: raw.pickupLocation,
        dropoffLocation: raw.dropoffLocation,
        requestedVehicleType: raw.requestedVehicleType,
        requestedModelId: raw.requestedModelId,
        requestedModel: raw.requestedModel,
        destinations: Array.isArray(raw.destinations) ? raw.destinations : [],
        requirements: raw.requirements,
        status: raw.status,
        selectedOfferId: raw.selectedOfferId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        offers: raw.offers ? raw.offers.map(mapOffer) : undefined,
        _count: raw._count,
    };
}

const OFFER_INCLUDE = {
    driver: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            driverProfile: { select: { rating: true, totalTrips: true, isVerified: true } },
        },
    },
    vehicle: {
        select: {
            id: true,
            type: true,
            capacity: true,
            pricePerDay: true,
            images: true,
            vehicleModel: { select: { name: true } },
        },
    },
};

const BOOKING_INCLUDE = {
    user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    requestedModel: { select: { id: true, name: true, type: true } },
    offers: { include: OFFER_INCLUDE },
};

const BOOKING_LIST_INCLUDE = {
    user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    requestedModel: { select: { id: true, name: true, type: true } },
    _count: { select: { offers: true } },
};

@Injectable()
export class PrismaCustomBookingRepository implements ICustomBookingRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateCustomBookingDto, userId: string, bookingNumber: string): Promise<CustomBookingEntity> {
        const booking = await this.prisma.customBooking.create({
            data: {
                bookingNumber,
                userId,
                title: dto.title,
                description: dto.description,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                numberOfPeople: dto.numberOfPeople,
                budget: dto.budget,
                pickupLocation: dto.pickupLocation,
                dropoffLocation: dto.dropoffLocation,
                requestedVehicleType: dto.requestedVehicleType,
                requestedModelId: dto.requestedModelId,
                destinations: dto.destinations ?? [],
                requirements: dto.requirements,
            },
            include: BOOKING_INCLUDE,
        });
        return mapBooking(booking);
    }

    async findById(id: string): Promise<CustomBookingEntity | null> {
        const booking = await this.prisma.customBooking.findUnique({
            where: { id },
            include: BOOKING_INCLUDE,
        });
        return booking ? mapBooking(booking) : null;
    }

    async findByUserId(userId: string, query: CustomBookingQueryDto): Promise<Pagination<CustomBookingEntity>> {
        const where: any = { userId };
        if (query.status) where.status = query.status;
        return this.paginate(where, query, BOOKING_INCLUDE);
    }

    async findAll(query: CustomBookingQueryDto): Promise<Pagination<CustomBookingEntity>> {
        const where: any = {};
        if (query.status) where.status = query.status;
        if (query.search) {
            where.OR = [
                { bookingNumber: { contains: query.search, mode: 'insensitive' } },
                { title: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        return this.paginate(where, query, BOOKING_LIST_INCLUDE);
    }

    async update(id: string, dto: UpdateCustomBookingDto): Promise<CustomBookingEntity> {
        const data: any = {};
        if (dto.title !== undefined) data.title = dto.title;
        if (dto.description !== undefined) data.description = dto.description;
        if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
        if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
        if (dto.numberOfPeople !== undefined) data.numberOfPeople = dto.numberOfPeople;
        if (dto.budget !== undefined) data.budget = dto.budget;
        if (dto.pickupLocation !== undefined) data.pickupLocation = dto.pickupLocation;
        if (dto.dropoffLocation !== undefined) data.dropoffLocation = dto.dropoffLocation;
        if (dto.requestedVehicleType !== undefined) data.requestedVehicleType = dto.requestedVehicleType;
        if (dto.requestedModelId !== undefined) data.requestedModelId = dto.requestedModelId;
        if (dto.destinations !== undefined) data.destinations = dto.destinations;
        if (dto.requirements !== undefined) data.requirements = dto.requirements;

        const booking = await this.prisma.customBooking.update({
            where: { id },
            data,
            include: BOOKING_INCLUDE,
        });
        return mapBooking(booking);
    }

    async updateStatus(id: string, status: CustomBookingStatus): Promise<CustomBookingEntity> {
        const booking = await this.prisma.customBooking.update({
            where: { id },
            data: { status },
            include: BOOKING_INCLUDE,
        });
        return mapBooking(booking);
    }

    async setSelectedOffer(id: string, offerId: string): Promise<CustomBookingEntity> {
        const booking = await this.prisma.customBooking.update({
            where: { id },
            data: { selectedOfferId: offerId, status: CustomBookingStatus.CONFIRMED },
            include: BOOKING_INCLUDE,
        });
        return mapBooking(booking);
    }

    async delete(id: string): Promise<boolean> {
        await this.prisma.customBooking.delete({ where: { id } });
        return true;
    }

    async createOffer(customBookingId: string, driverId: string, dto: CreateDriverOfferDto): Promise<DriverOfferEntity> {
        const offer = await this.prisma.driverOffer.create({
            data: {
                customBookingId,
                driverId,
                vehicleId: dto.vehicleId,
                price: dto.price,
                message: dto.message,
                eta: dto.eta,
                validUntil: new Date(dto.validUntil),
            },
            include: OFFER_INCLUDE,
        });
        return mapOffer(offer);
    }

    async findOffersByBookingId(customBookingId: string): Promise<DriverOfferEntity[]> {
        const offers = await this.prisma.driverOffer.findMany({
            where: { customBookingId },
            orderBy: { createdAt: 'asc' },
            include: OFFER_INCLUDE,
        });
        return offers.map(mapOffer);
    }

    async findOfferById(offerId: string): Promise<DriverOfferEntity | null> {
        const offer = await this.prisma.driverOffer.findUnique({
            where: { id: offerId },
            include: OFFER_INCLUDE,
        });
        return offer ? mapOffer(offer) : null;
    }

    async findOfferByDriverAndBooking(driverId: string, customBookingId: string): Promise<DriverOfferEntity | null> {
        const offer = await this.prisma.driverOffer.findFirst({
            where: { driverId, customBookingId },
            include: OFFER_INCLUDE,
        });
        return offer ? mapOffer(offer) : null;
    }

    async findActivePendingOfferByDriverAndBooking(driverId: string, customBookingId: string): Promise<DriverOfferEntity | null> {
        const offer = await this.prisma.driverOffer.findFirst({
            where: { driverId, customBookingId, status: OfferStatus.PENDING },
            include: OFFER_INCLUDE,
        });
        return offer ? mapOffer(offer) : null;
    }

    async findAcceptedOfferByBookingId(customBookingId: string): Promise<DriverOfferEntity | null> {
        const offer = await this.prisma.driverOffer.findFirst({
            where: { customBookingId, status: OfferStatus.ACCEPTED },
            include: OFFER_INCLUDE,
        });
        return offer ? mapOffer(offer) : null;
    }

    async updateOfferStatus(offerId: string, status: OfferStatus): Promise<DriverOfferEntity> {
        const offer = await this.prisma.driverOffer.update({
            where: { id: offerId },
            data: { status },
            include: OFFER_INCLUDE,
        });
        return mapOffer(offer);
    }

    async rejectAllOtherOffers(customBookingId: string, acceptedOfferId: string): Promise<void> {
        await this.prisma.driverOffer.updateMany({
            where: { customBookingId, id: { not: acceptedOfferId }, status: OfferStatus.PENDING },
            data: { status: OfferStatus.REJECTED },
        });
    }

    private async paginate(where: any, query: CustomBookingQueryDto, include: any): Promise<Pagination<CustomBookingEntity>> {
        const skip = (query.page - 1) * query.limit;
        const [total, rows] = await Promise.all([
            this.prisma.customBooking.count({ where }),
            this.prisma.customBooking.findMany({
                where,
                skip,
                take: query.limit,
                orderBy: { createdAt: 'desc' },
                include,
            }),
        ]);
        return {
            data: rows.map(mapBooking),
            total,
            page: query.page,
            limit: query.limit,
            pages: Math.ceil(total / query.limit),
        };
    }
}
