import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrizzleExperienceRepository } from './drizzle/drizzle-experience.repository';
import { PrismaExperienceRepository } from './prisma/prisma-experience.repository';

export const EXPERIENCE_REPOSITORY = 'EXPERIENCE_REPOSITORY';

export const experienceRepositoryProvider: Provider = {
  provide: EXPERIENCE_REPOSITORY,
  inject: [ConfigService, PrismaService, DrizzleService],
  useFactory: (config: ConfigService, prisma: PrismaService, drizzle: DrizzleService) =>
    config.get<string>('app.ormAdapter') === 'drizzle'
      ? new DrizzleExperienceRepository(drizzle)
      : new PrismaExperienceRepository(prisma),
};
