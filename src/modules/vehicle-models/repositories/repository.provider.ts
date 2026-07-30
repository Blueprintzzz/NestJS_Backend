import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaVehicleModelRepository } from './prisma/prisma-vehicle-model.repository';

export const VEHICLE_MODEL_REPOSITORY = 'VEHICLE_MODEL_REPOSITORY';

export const vehicleModelRepositoryProvider: Provider = {
    provide: VEHICLE_MODEL_REPOSITORY,
    inject: [ConfigService, PrismaService],
    useFactory: (_config: ConfigService, prisma: PrismaService) =>
        new PrismaVehicleModelRepository(prisma),
};
