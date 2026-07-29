import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaCustomBookingRepository } from './prisma/prisma-custom-booking.repository';

export const CUSTOM_BOOKING_REPOSITORY = 'CUSTOM_BOOKING_REPOSITORY';

export const customBookingRepositoryProvider: Provider = {
    provide: CUSTOM_BOOKING_REPOSITORY,
    inject: [ConfigService, PrismaService],
    useFactory: (_config: ConfigService, prisma: PrismaService) =>
        new PrismaCustomBookingRepository(prisma),
};
