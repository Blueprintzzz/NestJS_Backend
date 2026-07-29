import { Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    CreateDriverProfileDto,
    UpdateDriverProfileDto,
    UserQueryDto,
} from '../../dto/user.dto';
import { DriverProfileEntity, UserEntity } from '../../entities/user.entity';
import {
    CreateUserData,
    IUserRepository,
    Pagination,
    UpdateUserData,
} from '../interfaces/user.repository.interface';

function toNumber(val: any): number | null {
    if (val == null) return null;
    return typeof val === 'object' ? parseFloat(val.toString()) : Number(val);
}

function mapUser(raw: any): UserEntity {
    return {
        id: raw.id,
        email: raw.email,
        password: raw.password,
        firstName: raw.firstName,
        lastName: raw.lastName,
        phone: raw.phone,
        role: raw.role,
        status: raw.status,
        avatar: raw.avatar,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        driverProfile: raw.driverProfile ? mapDriverProfile(raw.driverProfile) : undefined,
    };
}

function mapDriverProfile(raw: any): DriverProfileEntity {
    return {
        id: raw.id,
        userId: raw.userId,
        licenseNumber: raw.licenseNumber,
        licenseExpiry: raw.licenseExpiry,
        experience: raw.experience,
        bio: raw.bio,
        rating: toNumber(raw.rating),
        totalTrips: raw.totalTrips,
        isVerified: raw.isVerified,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
    };
}

@Injectable()
export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateUserData): Promise<UserEntity> {
        const user = await this.prisma.user.create({ data });
        return mapUser(user);
    }

    async findById(id: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { driverProfile: true },
        });
        return user ? mapUser(user) : null;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { driverProfile: true },
        });
        return user ? mapUser(user) : null;
    }

    async findAll(query: UserQueryDto): Promise<Pagination<UserEntity>> {
        const { page, limit, role, status, search } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (role) where.role = role;
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [total, rows] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { driverProfile: true },
            }),
        ]);

        return {
            data: rows.map(mapUser),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }

    async update(id: string, data: UpdateUserData): Promise<UserEntity> {
        const user = await this.prisma.user.update({
            where: { id },
            data,
            include: { driverProfile: true },
        });
        return mapUser(user);
    }

    async updateStatus(id: string, status: UserStatus): Promise<UserEntity> {
        const user = await this.prisma.user.update({
            where: { id },
            data: { status },
            include: { driverProfile: true },
        });
        return mapUser(user);
    }

    async updatePassword(id: string, hashedPassword: string): Promise<UserEntity> {
        const user = await this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
        return mapUser(user);
    }

    async delete(id: string): Promise<boolean> {
        await this.prisma.user.delete({ where: { id } });
        return true;
    }

    async createDriverProfile(userId: string, dto: CreateDriverProfileDto): Promise<DriverProfileEntity> {
        const profile = await this.prisma.driverProfile.create({
            data: {
                userId,
                licenseNumber: dto.licenseNumber,
                licenseExpiry: new Date(dto.licenseExpiry),
                experience: dto.experience ?? 0,
                bio: dto.bio,
            },
        });
        return mapDriverProfile(profile);
    }

    async findDriverProfile(userId: string): Promise<DriverProfileEntity | null> {
        const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
        return profile ? mapDriverProfile(profile) : null;
    }

    async updateDriverProfile(userId: string, dto: UpdateDriverProfileDto): Promise<DriverProfileEntity> {
        const data: any = {};
        if (dto.licenseNumber !== undefined) data.licenseNumber = dto.licenseNumber;
        if (dto.licenseExpiry !== undefined) data.licenseExpiry = new Date(dto.licenseExpiry);
        if (dto.experience !== undefined) data.experience = dto.experience;
        if (dto.bio !== undefined) data.bio = dto.bio;

        const profile = await this.prisma.driverProfile.update({
            where: { userId },
            data,
        });
        return mapDriverProfile(profile);
    }

    async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
        await this.prisma.refreshToken.create({ data: { userId, token, expiresAt } });
    }

    async findRefreshToken(token: string): Promise<{ id: string; userId: string; expiresAt: Date } | null> {
        const rt = await this.prisma.refreshToken.findUnique({ where: { token } });
        if (!rt) return null;
        return { id: rt.id, userId: rt.userId, expiresAt: rt.expiresAt };
    }

    async deleteRefreshToken(token: string): Promise<void> {
        await this.prisma.refreshToken.deleteMany({ where: { token } });
    }

    async deleteAllRefreshTokens(userId: string): Promise<void> {
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }

    async deleteExpiredRefreshTokens(userId: string): Promise<void> {
        await this.prisma.refreshToken.deleteMany({
            where: { userId, expiresAt: { lt: new Date() } },
        });
    }

    async countActiveRefreshTokens(userId: string): Promise<number> {
        return this.prisma.refreshToken.count({
            where: { userId, expiresAt: { gte: new Date() } },
        });
    }

    async deleteOldestRefreshToken(userId: string): Promise<void> {
        const oldest = await this.prisma.refreshToken.findFirst({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            select: { id: true },
        });
        if (oldest) {
            await this.prisma.refreshToken.delete({ where: { id: oldest.id } });
        }
    }

    async deleteAllExpiredRefreshTokens(): Promise<number> {
        const result = await this.prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
        return result.count;
    }
}
