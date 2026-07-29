import { UserRole, UserStatus } from '@prisma/client';

export class DriverProfileEntity {
    id: string;
    userId: string;
    licenseNumber: string;
    licenseExpiry: Date;
    experience: number;
    bio?: string | null;
    rating?: number | null;
    totalTrips: number;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class UserEntity {
    id: string;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    role: UserRole;
    status: UserStatus;
    avatar?: string | null;
    createdAt: Date;
    updatedAt: Date;
    driverProfile?: DriverProfileEntity | null;
}

export class SafeUserEntity {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    role: UserRole;
    status: UserStatus;
    avatar?: string | null;
    createdAt: Date;
    updatedAt: Date;
    driverProfile?: DriverProfileEntity | null;
}
