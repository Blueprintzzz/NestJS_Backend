import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingModule } from '../booking/booking.module';
import { UsersController } from './controllers/users.controller';
import { userRepositoryProvider } from './repositories/repository.provider';
import { UsersService } from './services/users.service';

@Module({
    imports: [forwardRef(() => BookingModule)],
    controllers: [UsersController],
    providers: [
        PrismaService,
        userRepositoryProvider,
        UsersService,
    ],
    exports: [UsersService],
})
export class UsersModule { }
