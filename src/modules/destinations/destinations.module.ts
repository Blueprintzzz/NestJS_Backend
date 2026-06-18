import { Module } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AttractionsController } from './controllers/attractions.controller';
import { CategoriesController } from './controllers/categories.controller';
import { DistrictsController } from './controllers/districts.controller';
import { MapController } from './controllers/map.controller';
import { DestinationListener } from './listeners/destination.listeners';
import { attractionRepositoryProvider, categoryRepositoryProvider, districtRepositoryProvider } from './repositories/repository.provider';
import { AttractionsService } from './services/attractions.service';
import { CategoriesService } from './services/categories.service';
import { DistrictsService } from './services/districts.service';

@Module({
  controllers: [DistrictsController, AttractionsController, CategoriesController, MapController],
  providers: [
    PrismaService,
    DrizzleService,
    districtRepositoryProvider,
    attractionRepositoryProvider,
    categoryRepositoryProvider,
    DistrictsService,
    AttractionsService,
    CategoriesService,
    DestinationListener,
  ],
  exports: [DistrictsService, AttractionsService, CategoriesService],
})
export class DestinationsModule {}
