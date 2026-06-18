import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import appConfig from './config/app.config';
import { PrismaService } from './prisma/prisma.service';
import { DrizzleService } from './drizzle/drizzle.service';
import { HealthController } from './health.controller';
import { ExampleModule } from './modules/example/example.module';
import { BookingModule } from './modules/booking/booking.module';
import { PackagesModule } from './modules/packages/packages.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { DestinationsModule } from './modules/destinations/destinations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
    }),
    ExampleModule,
    BookingModule,
    PackagesModule,
    ReviewsModule,
    InquiriesModule,
    VehiclesModule,
    DestinationsModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService, DrizzleService],
  exports: [PrismaService, DrizzleService],
})
export class AppModule {}
