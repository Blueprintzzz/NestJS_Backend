import { Module } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ExampleController } from './controllers/example.controller';
import { ExampleCreatedListener } from './listeners/example-created.listener';
import { exampleRepositoryProvider } from './repositories/repository.provider';
import { ExampleService } from './services/example.service';

@Module({
  controllers: [ExampleController],
  providers: [
    PrismaService,
    DrizzleService,
    exampleRepositoryProvider,
    ExampleService,
    ExampleCreatedListener,
  ],
})
export class ExampleModule {}
