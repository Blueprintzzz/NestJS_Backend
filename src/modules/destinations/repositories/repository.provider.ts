import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaDestinationRepository } from './prisma/prisma-destination.repository';

export const DESTINATION_REPOSITORY = 'DESTINATION_REPOSITORY';

export const destinationRepositoryProvider: Provider = {
  provide: DESTINATION_REPOSITORY,
  inject: [ConfigService, PrismaService, DrizzleService],
  useFactory: (_config: ConfigService, prisma: PrismaService, _drizzle: DrizzleService) =>
    new PrismaDestinationRepository(prisma),
};
