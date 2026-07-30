import { forwardRef, Module } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { DestinationsController } from './controllers/destinations.controller';
import { MapController } from './controllers/map.controller';
import { DestinationListener } from './listeners/destination.listeners';
import { destinationRepositoryProvider } from './repositories/repository.provider';
import { DestinationsService } from './services/destinations.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [DestinationsController, MapController],
  providers: [
    PrismaService,
    DrizzleService,
    destinationRepositoryProvider,
    DestinationsService,
    DestinationListener,
  ],
  exports: [DestinationsService],
})
export class DestinationsModule {}
