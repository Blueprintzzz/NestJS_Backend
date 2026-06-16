import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrizzleExampleRepository } from './drizzle/drizzle-example.repository';
import { PrismaExampleRepository } from './prisma/prisma-example.repository';

export const EXAMPLE_REPOSITORY = 'EXAMPLE_REPOSITORY';

export const exampleRepositoryProvider: Provider = {
  provide: EXAMPLE_REPOSITORY,
  inject: [ConfigService, PrismaService, DrizzleService],
  useFactory: (
    config: ConfigService,
    prisma: PrismaService,
    drizzle: DrizzleService,
  ) => {
    return config.get<string>('app.ormAdapter') === 'drizzle'
      ? new DrizzleExampleRepository(drizzle)
      : new PrismaExampleRepository(prisma);
  },
};
