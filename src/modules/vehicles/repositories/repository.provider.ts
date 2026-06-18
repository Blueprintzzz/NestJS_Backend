import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrizzleVehicleRepository } from './drizzle/drizzle-vehicle.repository';
import { PrismaVehicleRepository } from './prisma/prisma-vehicle.repository';

export const VEHICLE_REPOSITORY = 'VEHICLE_REPOSITORY';

export const vehicleRepositoryProvider: Provider = {
  provide: VEHICLE_REPOSITORY,
  inject: [ConfigService, PrismaService, DrizzleService],
  useFactory: (config: ConfigService, prisma: PrismaService, drizzle: DrizzleService) =>
    config.get<string>('app.ormAdapter') === 'drizzle'
      ? new DrizzleVehicleRepository(drizzle)
      : new PrismaVehicleRepository(prisma),
};
