import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { CustomBookingController } from './controllers/custom-booking.controller';
import {
    CustomBookingCreatedListener,
    CustomBookingOfferAcceptedListener,
} from './listeners/custom-booking.listeners';
import { customBookingRepositoryProvider } from './repositories/repository.provider';
import { CustomBookingService } from './services/custom-booking.service';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [CustomBookingController],
    providers: [
        PrismaService,
        customBookingRepositoryProvider,
        CustomBookingService,
        CustomBookingCreatedListener,
        CustomBookingOfferAcceptedListener,
    ],
    exports: [CustomBookingService],
})
export class CustomBookingsModule { }
