import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../users/services/users.service';
import { SafeUserEntity, UserEntity } from '../../users/entities/user.entity';
import {
    CreateDriverProfileDto,
    UpdateDriverProfileDto,
} from '../../users/dto/user.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import {
    AuthResponseDto,
    ChangePasswordDto,
    UpdateProfileDto,
} from '../dto/auth-response.dto';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { UserLoggedInEvent } from '../events/user-logged-in.event';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_DAYS = 7;

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly eventEmitter: EventEmitter2,
        private readonly config: ConfigService,
    ) { }

    // ─── Register ────────────────────────────────────────────────────────────

    async register(dto: RegisterDto): Promise<AuthResponseDto> {
        if (dto.role === UserRole.ADMIN) {
            throw new ForbiddenException(
                'ADMIN accounts cannot be created via this endpoint',
            );
        }

        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) throw new ConflictException('Email already registered');

        const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

        const user = await this.usersService.createUser({
            email: dto.email,
            password: hashedPassword,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            role: dto.role ?? UserRole.TOURIST,
        });

        this.eventEmitter.emit(
            'auth.user.registered',
            new UserRegisteredEvent(user),
        );

        const { accessToken, refreshToken } = await this.generateTokenPair(user);
        return { accessToken, refreshToken, user: this.toSafe(user) };
    }

    // ─── Login ───────────────────────────────────────────────────────────────

    async login(dto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const passwordValid = await bcrypt.compare(dto.password, user.password!);
        if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

        if (user.status !== UserStatus.ACTIVE) {
            throw new ForbiddenException(
                `Account is ${user.status.toLowerCase()}`,
            );
        }

        this.eventEmitter.emit(
            'auth.user.logged_in',
            new UserLoggedInEvent(user),
        );

        const { accessToken, refreshToken } = await this.generateTokenPair(user);
        return { accessToken, refreshToken, user: this.toSafe(user) };
    }

    // ─── Refresh ─────────────────────────────────────────────────────────────

    async refresh(
        token: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const stored = await this.usersService.findRefreshToken(token);
        if (!stored) throw new UnauthorizedException('Invalid refresh token');

        if (stored.expiresAt < new Date()) {
            await this.usersService.deleteRefreshToken(token);
            throw new UnauthorizedException('Refresh token expired');
        }

        const user = await this.usersService.findById(stored.userId);
        if (!user || user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException('User not found or inactive');
        }

        await this.usersService.deleteRefreshToken(token);
        return this.generateTokenPair(user);
    }

    // ─── Logout ──────────────────────────────────────────────────────────────

    async logout(userId: string, refreshToken?: string): Promise<void> {
        if (refreshToken) {
            await this.usersService.deleteRefreshToken(refreshToken);
        } else {
            await this.usersService.deleteAllRefreshTokens(userId);
        }
    }

    // ─── Me ──────────────────────────────────────────────────────────────────

    async getMe(userId: string): Promise<SafeUserEntity> {
        const user = await this.usersService.findById(userId);
        if (!user) throw new UnauthorizedException();
        return this.toSafe(user);
    }

    async updateMe(
        userId: string,
        dto: UpdateProfileDto,
    ): Promise<SafeUserEntity> {
        return this.usersService.updateProfile(userId, dto);
    }

    async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
        const user = await this.usersService.findById(userId);
        if (!user) throw new UnauthorizedException();

        const valid = await bcrypt.compare(dto.currentPassword, user.password!);
        if (!valid) throw new BadRequestException('Current password is incorrect');

        const hashed = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
        await this.usersService.updatePassword(userId, hashed);
        await this.usersService.deleteAllRefreshTokens(userId);
    }

    // ─── Driver Profile ──────────────────────────────────────────────────────

    async createDriverProfile(userId: string, dto: CreateDriverProfileDto) {
        return this.usersService.createDriverProfile(userId, dto);
    }

    async getDriverProfile(userId: string) {
        return this.usersService.getDriverProfile(userId);
    }

    async updateDriverProfile(userId: string, dto: UpdateDriverProfileDto) {
        return this.usersService.updateDriverProfile(userId, dto);
    }

    // ─── Token Helpers ───────────────────────────────────────────────────────

    private async generateTokenPair(
        user: UserEntity,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = { sub: user.id, email: user.email, role: user.role };

        const jwtSecret =
            this.config.get<string>('JWT_SECRET') ?? 'change-me';
        const jwtRefreshSecret =
            this.config.get<string>('JWT_REFRESH_SECRET') ?? jwtSecret;
        const expiresIn =
            (this.config.get<string>('JWT_EXPIRES_IN') ?? ACCESS_TOKEN_TTL) as any;

        const accessToken = this.jwtService.sign(payload as any, {
            secret: jwtSecret,
            expiresIn,
        });

        const refreshToken = this.jwtService.sign(payload as any, {
            secret: jwtRefreshSecret,
            expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d` as any,
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

        await this.usersService.pruneRefreshTokensBeforeInsert(user.id);
        await this.usersService.createRefreshToken(user.id, refreshToken, expiresAt);

        return { accessToken, refreshToken };
    }

    private toSafe(user: UserEntity): SafeUserEntity {
        const { password: _password, ...safe } = user as any;
        return safe as SafeUserEntity;
    }
}
