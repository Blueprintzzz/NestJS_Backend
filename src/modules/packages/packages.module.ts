import { forwardRef, Module } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { PackagesController } from './controllers/packages.controller';
import { PackageCreatedListener, PackageDeletedListener, PackageUpdatedListener } from './listeners/package.listeners';
import { packageRepositoryProvider } from './repositories/repository.provider';
import { PackagesService } from './services/packages.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
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
export class PackagesModule { }
