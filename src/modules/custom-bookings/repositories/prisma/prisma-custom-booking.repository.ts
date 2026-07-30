import { Injectable } from '@nestjs/common';
import { CustomBookingStatus, OfferStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    CreateCustomBookingDto,
    CreateDriverOfferDto,
    CustomBookingQueryDto,
} from '../../dto/custom-booking.dto';
import {
    CustomBookingEntity,
    DriverOfferEntity,
} from '../../entities/custom-booking.entity';
import {
    ICustomBookingRepository,
    Pagination,
} from '../interfaces/custom-booking.repository.interface';

function toNumber(val: any): number | null {
    if (val == null) return null;
    return typeof val === 'object' ? parseFloat(val.toString()) : Number(val);
}

function mapOffer(raw: any): DriverOfferEntity {
    return {
        id: raw.id,
        customBookingId: raw.customBookingId,
        driverId: raw.driverId,
        driverName: raw.driver ? `${raw.driver.firstName} ${raw.driver.lastName}` : undefined,
        vehicleId: raw.vehicleId,
        vehicleInfo: raw.vehicle ? `${raw.vehicle.vehicleModel?.name ?? ''} ${raw.vehicle.registrationNumber}`.trim() : undefined,
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
        destinations: Array.isArray(raw.destinations) ? raw.destinations : [],
        requirements: raw.requirements,
        status: raw.status,
        selectedOfferId: raw.selectedOfferId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        offers: raw.offers ? raw.offers.map(mapOffer) : undefined,
    };
}

const OFFER_INCLUDE = {
    driver: { select: { firstName: true, lastName: true } },
    vehicle: { select: { registrationNumber: true, vehicleModel: { select: { name: true } } } },
};

@Injectable()
export class PrismaCustomBookingRepository implements ICustomBookingRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(
        dto: CreateCustomBookingDto,
        userId: string,
        bookingNumber: string,
    ): Promise<CustomBookingEntity> {
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
            include: { offers: { include: OFFER_INCLUDE } },
        });
        return mapBooking(booking);
    }

    async findById(id: string): Promise<CustomBookingEntity | null> {
        const booking = await this.prisma.customBooking.findUnique({
            where: { id },
            include: { offers: { include: OFFER_INCLUDE } },
        });
        return booking ? mapBooking(booking) : null;
    }

    async findByUserId(
        userId: string,
        query: CustomBookingQueryDto,
    ): Promise<Pagination<CustomBookingEntity>> {
        const where: any = { userId };
        if (query.status) where.status = query.status;
        return this.paginate(where, query);
    }

    async findAll(query: CustomBookingQueryDto): Promise<Pagination<CustomBookingEntity>> {
        const where: any = {};
        if (query.status) where.status = query.status;
        return this.paginate(where, query);
    }

    async updateStatus(id: string, status: CustomBookingStatus): Promise<CustomBookingEntity> {
        const booking = await this.prisma.customBooking.update({
            where: { id },
            data: { status },
            include: { offers: { include: OFFER_INCLUDE } },
        });
        return mapBooking(booking);
    }

    async setSelectedOffer(id: string, offerId: string): Promise<CustomBookingEntity> {
        const booking = await this.prisma.customBooking.update({
            where: { id },
            data: { selectedOfferId: offerId, status: CustomBookingStatus.CONFIRMED },
            include: { offers: { include: OFFER_INCLUDE } },
        });
        return mapBooking(booking);
    }

    async delete(id: string): Promise<boolean> {
        await this.prisma.customBooking.delete({ where: { id } });
        return true;
    }

    async createOffer(
        customBookingId: string,
        driverId: string,
        dto: CreateDriverOfferDto,
    ): Promise<DriverOfferEntity> {
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

    async findOfferByDriverAndBooking(
        driverId: string,
        customBookingId: string,
    ): Promise<DriverOfferEntity | null> {
        const offer = await this.prisma.driverOffer.findFirst({
            where: { driverId, customBookingId },
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

    private async paginate(
        where: any,
        query: CustomBookingQueryDto,
    ): Promise<Pagination<CustomBookingEntity>> {
        const skip = (query.page - 1) * query.limit;
        const [total, rows] = await Promise.all([
            this.prisma.customBooking.count({ where }),
            this.prisma.customBooking.findMany({
                where,
                skip,
                take: query.limit,
                orderBy: { createdAt: 'desc' },
                include: { offers: { include: OFFER_INCLUDE } },
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
