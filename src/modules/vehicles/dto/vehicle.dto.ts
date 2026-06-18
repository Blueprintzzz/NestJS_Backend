import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from 'class-validator';
import { VehicleType } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty() @IsString() @MinLength(2) name: string;
  @ApiProperty({ enum: VehicleType }) @IsEnum(VehicleType) type: VehicleType;
  @ApiProperty() @IsInt() @Min(1) capacity: number;
  @ApiProperty() @IsNumber() @IsPositive() pricePerDay: number;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsString({ each: true }) @IsOptional() images: string[] = [];
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsString({ each: true }) @IsOptional() features: string[] = [];
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiProperty() @IsString() registrationNumber: string;
}

export class UpdateVehicleDto {
  @ApiPropertyOptional() @IsString() @IsOptional() name?: string;
  @ApiPropertyOptional({ enum: VehicleType }) @IsEnum(VehicleType) @IsOptional() type?: VehicleType;
  @ApiPropertyOptional() @IsInt() @Min(1) @IsOptional() capacity?: number;
  @ApiPropertyOptional() @IsNumber() @IsPositive() @IsOptional() pricePerDay?: number;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() images?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() features?: string[];
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
}

export class VehicleQueryDto {
  @ApiPropertyOptional({ enum: VehicleType }) @IsEnum(VehicleType) @IsOptional() type?: VehicleType;
  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional() minCapacity?: number;
  @ApiPropertyOptional() @Type(() => Number) @IsNumber() @IsOptional() maxPrice?: number;
  @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() page: number = 1;
  @ApiPropertyOptional({ default: 10 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() limit: number = 10;
}

export class CheckAvailabilityDto {
  @ApiProperty() @IsDateString() startDate: string;
  @ApiProperty() @IsDateString() endDate: string;
  @ApiPropertyOptional({ enum: VehicleType }) @IsEnum(VehicleType) @IsOptional() vehicleType?: VehicleType;
}
