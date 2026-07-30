import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { VehicleModelsController } from './controllers/vehicle-models.controller';
import { vehicleModelRepositoryProvider } from './repositories/repository.provider';
import { VehicleModelsService } from './services/vehicle-models.service';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [VehicleModelsController],
    providers: [
        PrismaService,
        vehicleModelRepositoryProvider,
        VehicleModelsService,
    ],
    exports: [VehicleModelsService],
})
export class VehicleModelsModule { }
