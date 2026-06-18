import { Module } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PackagesController } from './controllers/packages.controller';
import { PackageCreatedListener, PackageDeletedListener, PackageUpdatedListener } from './listeners/package.listeners';
import { packageRepositoryProvider } from './repositories/repository.provider';
import { PackagesService } from './services/packages.service';

@Module({
  controllers: [PackagesController],
  providers: [
    PrismaService,
    DrizzleService,
    packageRepositoryProvider,
    PackagesService,
    PackageCreatedListener,
    PackageUpdatedListener,
    PackageDeletedListener,
  ],
  exports: [PackagesService],
})
export class PackagesModule {}
