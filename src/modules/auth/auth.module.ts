import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { UserLoggedInListener } from './listeners/user-logged-in.listener';
import { UserRegisteredListener } from './listeners/user-registered.listener';
import { AuthService } from './services/auth.service';
import { TokenCleanupService } from './services/token-cleanup.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        UsersModule,
        ConfigModule,
        ScheduleModule.forRoot(),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET') ?? 'change-me',
                signOptions: {
                    expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '15m') as any,
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        TokenCleanupService,
        JwtStrategy,
        UserRegisteredListener,
        UserLoggedInListener,
    ],
    exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule { }
