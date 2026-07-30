import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { CustomBookingController } from './controllers/custom-booking.controller';
import {
    CustomBookingConfirmedListener,
    CustomBookingCreatedListener,
    DriverOfferSubmittedListener,
} from './listeners/custom-booking.listeners';
import { customBookingRepositoryProvider } from './repositories/repository.provider';
import { CustomBookingService } from './services/custom-booking.service';

@Module({
    imports: [
        forwardRef(() => AuthModule),
        forwardRef(() => VehiclesModule),
    ],
    controllers: [CustomBookingController],
    providers: [
        PrismaService,
        customBookingRepositoryProvider,
        CustomBookingService,
        CustomBookingCreatedListener,
        DriverOfferSubmittedListener,
        CustomBookingConfirmedListener,
    ],
    exports: [CustomBookingService],
})
export class CustomBookingsModule { }
