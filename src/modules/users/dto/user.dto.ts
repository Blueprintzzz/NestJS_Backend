import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class UserQueryDto {
    @ApiPropertyOptional({ enum: UserRole })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ enum: UserStatus })
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    @Min(1)
    limit: number = 20;
}

export class UpdateUserStatusDto {
    @IsEnum(UserStatus)
    status: UserStatus;
}

export class CreateDriverProfileDto {
    @IsString()
    licenseNumber: string;

    @IsDateString()
    licenseExpiry: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    experience?: number;

    @IsOptional()
    @IsString()
    bio?: string;
}

export class UpdateDriverProfileDto {
    @IsOptional()
    @IsString()
    licenseNumber?: string;

    @IsOptional()
    @IsDateString()
    licenseExpiry?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    experience?: number;

    @IsOptional()
    @IsString()
    bio?: string;
}
