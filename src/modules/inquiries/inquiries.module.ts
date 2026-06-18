import { Module } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InquiriesController } from './controllers/inquiries.controller';
import { InquiryCreatedListener, InquiryRespondedListener } from './listeners/inquiry.listeners';
import { inquiryRepositoryProvider } from './repositories/repository.provider';
import { InquiriesService } from './services/inquiries.service';

@Module({
  controllers: [InquiriesController],
  providers: [
    PrismaService,
    DrizzleService,
    inquiryRepositoryProvider,
    InquiriesService,
    InquiryCreatedListener,
    InquiryRespondedListener,
  ],
  exports: [InquiriesService],
})
export class InquiriesModule {}
