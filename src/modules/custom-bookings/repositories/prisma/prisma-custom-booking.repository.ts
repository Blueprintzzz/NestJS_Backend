import { Injectable } from '@nestjs/common';
import { CustomBookingStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    CreateCustomBookingDto,
    CreateCustomBookingOfferDto,
    CustomBookingQueryDto,
} from '../../dto/custom-booking.dto';
import {
    CustomBookingEntity,
    CustomBookingOfferEntity,
} from '../../entities/custom-booking.entity';
import {
    ICustomBookingRepository,
    Pagination,
} from '../interfaces/custom-booking.repository.interface';

function toNumber(val: any): number | null {
    if (val == null) return null;
    return typeof val === 'object' ? parseFloat(val.toString()) : Number(val);
}

function mapOffer(raw: any): CustomBookingOfferEntity {
    return {
        id: raw.id,
        customBookingId: raw.customBookingId,
        driverId: raw.driverId,
        price: toNumber(raw.price) as number,
        description: raw.description,
        validUntil: raw.validUntil,
        isAccepted: raw.isAccepted,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
    };
}

function mapBooking(raw: any): CustomBookingEntity {
    return {
        id: raw.id,
        userId: raw.userId,
        title: raw.title,
        description: raw.description,
        startDate: raw.startDate,
        endDate: raw.endDate,
        numberOfPeople: raw.numberOfPeople,
        budget: toNumber(raw.budget),
        destinations: Array.isArray(raw.destinations) ? raw.destinations : [],
        requirements: raw.requirements,
        status: raw.status,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        offers: raw.offers ? raw.offers.map(mapOffer) : undefined,
    };
}

@Injectable()
export class PrismaCustomBookingRepository implements ICustomBookingRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateCustomBookingDto, userId: string): Promise<CustomBookingEntity> {
        const booking = await this.prisma.customBooking.create({
            data: {
                userId,
                title: dto.title,
                description: dto.description,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                numberOfPeople: dto.numberOfPeople,
                budget: dto.budget,
                destinations: dto.destinations ?? [],
                requirements: dto.requirements,
            },
            include: { offers: true },
        });
        return mapBooking(booking);
    }

    async findById(id: string): Promise<CustomBookingEntity | null> {
        const booking = await this.prisma.customBooking.findUnique({
            where: { id },
            include: { offers: true },
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
            include: { offers: true },
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
        dto: CreateCustomBookingOfferDto,
    ): Promise<CustomBookingOfferEntity> {
        const offer = await this.prisma.customBookingOffer.create({
            data: {
                customBookingId,
                driverId,
                price: dto.price,
                description: dto.description,
                validUntil: new Date(dto.validUntil),
            },
        });
        return mapOffer(offer);
    }

    async findOffersByBookingId(customBookingId: string): Promise<CustomBookingOfferEntity[]> {
        const offers = await this.prisma.customBookingOffer.findMany({
            where: { customBookingId },
            orderBy: { createdAt: 'asc' },
        });
        return offers.map(mapOffer);
    }

    async findOfferById(offerId: string): Promise<CustomBookingOfferEntity | null> {
        const offer = await this.prisma.customBookingOffer.findUnique({ where: { id: offerId } });
        return offer ? mapOffer(offer) : null;
    }

    async findAcceptedOfferByBookingId(customBookingId: string): Promise<CustomBookingOfferEntity | null> {
        const offer = await this.prisma.customBookingOffer.findFirst({
            where: { customBookingId, isAccepted: true },
        });
        return offer ? mapOffer(offer) : null;
    }

    async acceptOffer(offerId: string): Promise<CustomBookingOfferEntity> {
        const offer = await this.prisma.customBookingOffer.update({
            where: { id: offerId },
            data: { isAccepted: true },
        });
        // Update parent booking status to CONFIRMED when an offer is accepted
        await this.prisma.customBooking.update({
            where: { id: offer.customBookingId },
            data: { status: CustomBookingStatus.CONFIRMED },
        });
        return mapOffer(offer);
    }

    private async paginate(where: any, query: CustomBookingQueryDto): Promise<Pagination<CustomBookingEntity>> {
        const skip = (query.page - 1) * query.limit;
        const [total, rows] = await Promise.all([
            this.prisma.customBooking.count({ where }),
            this.prisma.customBooking.findMany({
                where,
                skip,
                take: query.limit,
                orderBy: { createdAt: 'desc' },
                include: { offers: true },
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
