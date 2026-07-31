import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomBookingStatus, VehicleType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    MinLength,
} from 'class-validator';

export class CreateCustomBookingDto {
    @ApiProperty()
    @IsString()
    @MinLength(3)
    title: string;

    @ApiProperty()
    @IsString()
    @MinLength(10)
    description: string;

    @ApiProperty({ example: '2026-10-01' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2026-10-07' })
    @IsDateString()
    endDate: string;

    @ApiProperty({ example: 3 })
    @IsInt()
    @Min(1)
    numberOfPeople: number;

    @ApiPropertyOptional({ example: 800.0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    budget?: number;

    @ApiProperty()
    @IsString()
    pickupLocation: string;

    @ApiProperty()
    @IsString()
    dropoffLocation: string;

    @ApiProperty({ enum: VehicleType })
    @IsEnum(VehicleType)
    requestedVehicleType: VehicleType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    requestedModelId?: string;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    destinations: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    requirements?: string;
}

export class UpdateCustomBookingDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(3)
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(1)
    numberOfPeople?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    budget?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    pickupLocation?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    dropoffLocation?: string;

    @ApiPropertyOptional({ enum: VehicleType })
    @IsOptional()
    @IsEnum(VehicleType)
    requestedVehicleType?: VehicleType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    requestedModelId?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    destinations?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    requirements?: string;
}

export class CreateDriverOfferDto {
    @ApiProperty()
    @IsUUID()
    vehicleId: string;

    @ApiProperty({ example: 650.0 })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    message?: string;

    @ApiPropertyOptional({ example: 'Within 2 days' })
    @IsOptional()
    @IsString()
    eta?: string;

    @ApiProperty({ example: '2026-09-15' })
    @IsDateString()
    validUntil: string;
}

export class UpdateCustomBookingStatusDto {
    @ApiProperty({ enum: CustomBookingStatus })
    @IsEnum(CustomBookingStatus)
    status: CustomBookingStatus;
}

export class CustomBookingQueryDto {
    @ApiPropertyOptional({ enum: CustomBookingStatus })
    @IsOptional()
    @IsEnum(CustomBookingStatus)
    status?: CustomBookingStatus;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit: number = 10;

    @ApiPropertyOptional({ description: 'Search by bookingNumber or title' })
    @IsOptional()
    @IsString()
    search?: string;
}
