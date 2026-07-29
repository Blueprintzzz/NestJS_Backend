import { UserRole, UserStatus } from '@prisma/client';
import { CreateDriverProfileDto, UpdateDriverProfileDto, UserQueryDto } from '../../dto/user.dto';
import { DriverProfileEntity, UserEntity } from '../../entities/user.entity';

export interface Pagination<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface CreateUserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
}

export interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
}

export interface IUserRepository {
    create(data: CreateUserData): Promise<UserEntity>;
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findAll(query: UserQueryDto): Promise<Pagination<UserEntity>>;
    update(id: string, data: UpdateUserData): Promise<UserEntity>;
    updateStatus(id: string, status: UserStatus): Promise<UserEntity>;
    updatePassword(id: string, hashedPassword: string): Promise<UserEntity>;
    delete(id: string): Promise<boolean>;
    createDriverProfile(userId: string, dto: CreateDriverProfileDto): Promise<DriverProfileEntity>;
    findDriverProfile(userId: string): Promise<DriverProfileEntity | null>;
    updateDriverProfile(userId: string, dto: UpdateDriverProfileDto): Promise<DriverProfileEntity>;

    // RefreshToken operations
    createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void>;
    findRefreshToken(token: string): Promise<{ id: string; userId: string; expiresAt: Date } | null>;
    deleteRefreshToken(token: string): Promise<void>;
    deleteAllRefreshTokens(userId: string): Promise<void>;
    deleteExpiredRefreshTokens(userId: string): Promise<void>;
    countActiveRefreshTokens(userId: string): Promise<number>;
    deleteOldestRefreshToken(userId: string): Promise<void>;
    deleteAllExpiredRefreshTokens(): Promise<number>;
}
