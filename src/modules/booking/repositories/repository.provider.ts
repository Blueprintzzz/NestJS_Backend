import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrizzleBookingRepository } from './drizzle/drizzle-booking.repository';
import { PrismaBookingRepository } from './prisma/prisma-booking.repository';

export const BOOKING_REPOSITORY = 'BOOKING_REPOSITORY';

export const bookingRepositoryProvider: Provider = {
  provide: BOOKING_REPOSITORY,
  inject: [ConfigService, PrismaService, DrizzleService],
  useFactory: (config: ConfigService, prisma: PrismaService, drizzle: DrizzleService) =>
    config.get<string>('app.ormAdapter') === 'drizzle'
      ? new DrizzleBookingRepository(drizzle)
      : new PrismaBookingRepository(prisma),
};
