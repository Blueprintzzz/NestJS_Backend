import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomBookingStatus } from '@prisma/client';
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
    Min,
    MinLength,
} from 'class-validator';

export class CreateCustomBookingDto {
    @ApiProperty({ example: 'Custom hill country trip' })
    @IsString()
    @MinLength(3)
    title: string;

    @ApiProperty({ example: 'Looking for a private tour covering Ella and Nuwara Eliya.' })
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

    @ApiPropertyOptional({ example: 800.00 })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    budget?: number;

    @ApiPropertyOptional({ type: [String], example: ['Ella', 'Nuwara Eliya'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    destinations?: string[];

    @ApiPropertyOptional({ example: 'Prefer eco-friendly accommodations.' })
    @IsOptional()
    @IsString()
    requirements?: string;
}

export class CreateCustomBookingOfferDto {
    @ApiProperty({ example: 650.00 })
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiProperty({ example: 'I can provide a comfortable SUV with hotel pickups and all transfers.' })
    @IsString()
    @MinLength(10)
    description: string;

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
