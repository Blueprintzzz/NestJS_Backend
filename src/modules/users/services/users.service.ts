import {
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { BookingQueryDto } from '../../booking/dto/booking-query.dto';
import { BookingService } from '../../booking/services/booking.service';
import { CreateDriverProfileDto, UpdateDriverProfileDto, UpdateUserStatusDto, UserQueryDto } from '../dto/user.dto';
import { DriverProfileEntity, SafeUserEntity, UserEntity } from '../entities/user.entity';
import { IUserRepository, Pagination } from '../repositories/interfaces/user.repository.interface';
import { USER_REPOSITORY } from '../repositories/repository.provider';

@Injectable()
export class UsersService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly repo: IUserRepository,
        private readonly bookingService: BookingService,
    ) { }

    async getAllUsers(query: UserQueryDto): Promise<Pagination<SafeUserEntity>> {
        const result = await this.repo.findAll(query);
        return {
            ...result,
            data: result.data.map(this.toSafe),
        };
    }

    async getUserById(id: string): Promise<SafeUserEntity> {
        const user = await this.repo.findById(id);
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return this.toSafe(user);
    }

    async updateUserStatus(id: string, dto: UpdateUserStatusDto): Promise<SafeUserEntity> {
        await this.getUserById(id);
        const user = await this.repo.updateStatus(id, dto.status);
        return this.toSafe(user);
    }

    async deleteUser(id: string): Promise<boolean> {
        await this.getUserById(id);
        return this.repo.delete(id);
    }

    async getUserBookings(id: string, query: BookingQueryDto) {
        await this.getUserById(id);
        return this.bookingService.getUserBookings(id, query);
    }

    async createDriverProfile(userId: string, dto: CreateDriverProfileDto): Promise<DriverProfileEntity> {
        await this.getUserById(userId);
        return this.repo.createDriverProfile(userId, dto);
    }

    async getDriverProfile(userId: string): Promise<DriverProfileEntity> {
        const profile = await this.repo.findDriverProfile(userId);
        if (!profile) throw new NotFoundException(`Driver profile for user ${userId} not found`);
        return profile;
    }

    async updateDriverProfile(userId: string, dto: UpdateDriverProfileDto): Promise<DriverProfileEntity> {
        await this.getDriverProfile(userId);
        return this.repo.updateDriverProfile(userId, dto);
    }

    // Internal helpers used by AuthService (not exposed in controller)
    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.repo.findByEmail(email);
    }

    async findById(id: string): Promise<UserEntity | null> {
        return this.repo.findById(id);
    }

    async updatePassword(id: string, hashedPassword: string): Promise<void> {
        await this.repo.updatePassword(id, hashedPassword);
    }

    async updateProfile(id: string, data: { firstName?: string; lastName?: string; phone?: string; avatar?: string }): Promise<SafeUserEntity> {
        const user = await this.repo.update(id, data);
        return this.toSafe(user);
    }

    async createUser(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        role?: any;
    }): Promise<UserEntity> {
        return this.repo.create(data);
    }

    async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
        return this.repo.createRefreshToken(userId, token, expiresAt);
    }

    async findRefreshToken(token: string) {
        return this.repo.findRefreshToken(token);
    }

    async deleteRefreshToken(token: string): Promise<void> {
        return this.repo.deleteRefreshToken(token);
    }

    async deleteAllRefreshTokens(userId: string): Promise<void> {
        return this.repo.deleteAllRefreshTokens(userId);
    }

    /**
     * Called before inserting a new refresh token.
     * 1. Deletes all expired tokens for the user.
     * 2. If the user still has >= 5 active tokens, deletes the oldest one.
     */
    async pruneRefreshTokensBeforeInsert(userId: string): Promise<void> {
        await this.repo.deleteExpiredRefreshTokens(userId);
        const active = await this.repo.countActiveRefreshTokens(userId);
        if (active >= 5) {
            await this.repo.deleteOldestRefreshToken(userId);
        }
    }

    async purgeAllExpiredRefreshTokens(): Promise<number> {
        return this.repo.deleteAllExpiredRefreshTokens();
    }

    private toSafe(user: UserEntity): SafeUserEntity {
        const { password: _password, ...safe } = user as any;
        return safe as SafeUserEntity;
    }
}
