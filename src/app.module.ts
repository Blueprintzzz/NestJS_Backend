import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import appConfig from './config/app.config';
import { PrismaService } from './prisma/prisma.service';
import { DrizzleService } from './drizzle/drizzle.service';
import { HealthController } from './health.controller';
import { ExampleModule } from './modules/example/example.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
    }),
    ExampleModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService, DrizzleService],
  exports: [PrismaService, DrizzleService],
})
export class AppModule {}
