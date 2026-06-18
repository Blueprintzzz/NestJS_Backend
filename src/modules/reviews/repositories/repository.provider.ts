import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrizzleReviewRepository } from './drizzle/drizzle-review.repository';
import { PrismaReviewRepository } from './prisma/prisma-review.repository';

export const REVIEW_REPOSITORY = 'REVIEW_REPOSITORY';

export const reviewRepositoryProvider: Provider = {
  provide: REVIEW_REPOSITORY,
  inject: [ConfigService, PrismaService, DrizzleService],
  useFactory: (config: ConfigService, prisma: PrismaService, drizzle: DrizzleService) =>
    config.get<string>('app.ormAdapter') === 'drizzle'
      ? new DrizzleReviewRepository(drizzle)
      : new PrismaReviewRepository(prisma),
};
