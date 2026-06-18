import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrizzlePackageRepository } from './drizzle/drizzle-package.repository';
import { PrismaPackageRepository } from './prisma/prisma-package.repository';

export const PACKAGE_REPOSITORY = 'PACKAGE_REPOSITORY';

export const packageRepositoryProvider: Provider = {
  provide: PACKAGE_REPOSITORY,
  inject: [ConfigService, PrismaService, DrizzleService],
  useFactory: (config: ConfigService, prisma: PrismaService, drizzle: DrizzleService) =>
    config.get<string>('app.ormAdapter') === 'drizzle'
      ? new DrizzlePackageRepository(drizzle)
      : new PrismaPackageRepository(prisma),
};
