import { Module } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingController } from './controllers/booking.controller';
import { BookingCancelledListener } from './listeners/booking-cancelled.listener';
import { BookingCreatedListener } from './listeners/booking-created.listener';
import { PaymentRecordedListener } from './listeners/payment-recorded.listener';
import { bookingRepositoryProvider } from './repositories/repository.provider';
import { BookingService } from './services/booking.service';

@Module({
  controllers: [BookingController],
  providers: [
    PrismaService,
    DrizzleService,
    bookingRepositoryProvider,
    BookingService,
    BookingCreatedListener,
    BookingCancelledListener,
    PaymentRecordedListener,
  ],
  exports: [BookingService],
})
export class BookingModule {}
