import { Module } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { PrismaService } from '../../prisma/prisma.service';
import { VehiclesController } from './controllers/vehicles.controller';
import { VehicleReleasedListener, VehicleReservedListener } from './listeners/vehicle.listeners';
import { vehicleRepositoryProvider } from './repositories/repository.provider';
import { VehiclesService } from './services/vehicles.service';

@Module({
  controllers: [VehiclesController],
  providers: [
    PrismaService,
    DrizzleService,
    vehicleRepositoryProvider,
    VehiclesService,
    VehicleReservedListener,
    VehicleReleasedListener,
  ],
  exports: [VehiclesService],
})
export class VehiclesModule {}
