import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaUserRepository } from './prisma/prisma-user.repository';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export const userRepositoryProvider: Provider = {
    provide: USER_REPOSITORY,
    inject: [ConfigService, PrismaService],
    useFactory: (_config: ConfigService, prisma: PrismaService) =>
        // Drizzle adapter for users not implemented — prisma only
        new PrismaUserRepository(prisma),
};
