import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrizzleAttractionRepository } from './drizzle/drizzle-attraction.repository';
import { DrizzleCategoryRepository } from './drizzle/drizzle-category.repository';
import { DrizzleDistrictRepository } from './drizzle/drizzle-district.repository';
import { PrismaAttractionRepository } from './prisma/prisma-attraction.repository';
import { PrismaCategoryRepository } from './prisma/prisma-category.repository';
import { PrismaDistrictRepository } from './prisma/prisma-district.repository';

export const DISTRICT_REPOSITORY = 'DISTRICT_REPOSITORY';
export const ATTRACTION_REPOSITORY = 'ATTRACTION_REPOSITORY';
export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY';

export const districtRepositoryProvider: Provider = {
  provide: DISTRICT_REPOSITORY,
  inject: [ConfigService, PrismaService, DrizzleService],
  useFactory: (config: ConfigService, prisma: PrismaService, drizzle: DrizzleService) =>
    config.get<string>('app.ormAdapter') === 'drizzle'
      ? new DrizzleDistrictRepository(drizzle)
      : new PrismaDistrictRepository(prisma),
};

export const attractionRepositoryProvider: Provider = {
  provide: ATTRACTION_REPOSITORY,
  inject: [ConfigService, PrismaService, DrizzleService],
  useFactory: (config: ConfigService, prisma: PrismaService, drizzle: DrizzleService) =>
    config.get<string>('app.ormAdapter') === 'drizzle'
      ? new DrizzleAttractionRepository(drizzle)
      : new PrismaAttractionRepository(prisma),
};

export const categoryRepositoryProvider: Provider = {
  provide: CATEGORY_REPOSITORY,
  inject: [ConfigService, PrismaService, DrizzleService],
  useFactory: (config: ConfigService, prisma: PrismaService, drizzle: DrizzleService) =>
    config.get<string>('app.ormAdapter') === 'drizzle'
      ? new DrizzleCategoryRepository(drizzle)
      : new PrismaCategoryRepository(prisma),
};
