import { forwardRef, Module } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { ExperiencesController } from './controllers/experiences.controller';
import { ExperienceListener } from './listeners/experience.listener';
import { experienceRepositoryProvider } from './repositories/repository.provider';
import { ExperiencesService } from './services/experiences.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [ExperiencesController],
  providers: [
    PrismaService,
    DrizzleService,
    experienceRepositoryProvider,
    ExperiencesService,
    ExperienceListener,
  ],
  exports: [ExperiencesService],
})
export class ExperiencesModule { }
