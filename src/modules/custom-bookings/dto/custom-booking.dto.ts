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
    IsPositive,
    IsString,
    IsUUID,
    Min,
    MinLength,
} from 'class-validator';

export class CreateCustomBookingDto {
    @ApiProperty({ example: 'Hill Country Trip' })
    @IsString()
    @MinLength(3)
    title: string;

    @ApiProperty({ example: 'Looking for a private driver for a hill country tour.' })
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
    @IsPositive()
    budget?: number;

    @ApiProperty({ example: 'Colombo Fort' })
    @IsString()
    pickupLocation: string;

    @ApiProperty({ example: 'Ella' })
    @IsString()
    dropoffLocation: string;

    @ApiProperty({ enum: VehicleType })
    @IsEnum(VehicleType)
    requestedVehicleType: VehicleType;

    @ApiPropertyOptional({ description: 'Specific vehicle model ID (optional)' })
    @IsOptional()
    @IsUUID()
    requestedModelId?: string;

    @ApiPropertyOptional({ type: [String], example: ['Ella', 'Nuwara Eliya'] })
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
    @ApiProperty({ description: 'Vehicle ID that belongs to the driver' })
    @IsUUID()
    vehicleId: string;

    @ApiProperty({ example: 650.0 })
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiPropertyOptional({ example: 'I can provide a comfortable SUV with hotel pickups.' })
    @IsOptional()
    @IsString()
    message?: string;

    @ApiPropertyOptional({ example: '30 minutes' })
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
}
