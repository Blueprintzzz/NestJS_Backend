import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrizzleInquiryRepository } from './drizzle/drizzle-inquiry.repository';
import { PrismaInquiryRepository } from './prisma/prisma-inquiry.repository';

export const INQUIRY_REPOSITORY = 'INQUIRY_REPOSITORY';

export const inquiryRepositoryProvider: Provider = {
  provide: INQUIRY_REPOSITORY,
  inject: [ConfigService, PrismaService, DrizzleService],
  useFactory: (config: ConfigService, prisma: PrismaService, drizzle: DrizzleService) =>
    config.get<string>('app.ormAdapter') === 'drizzle'
      ? new DrizzleInquiryRepository(drizzle)
      : new PrismaInquiryRepository(prisma),
};
