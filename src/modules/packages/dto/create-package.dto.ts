import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { PackageCategory } from '@prisma/client';

export class CreateTourPackageDto {
  @ApiProperty() @IsString() @MinLength(3) name: string;
  @ApiProperty() @IsString() @MinLength(10) description: string;
  @ApiProperty({ enum: PackageCategory }) @IsEnum(PackageCategory) category: PackageCategory;
  @ApiProperty() @IsInt() @Min(1) duration: number;
  @ApiProperty() @IsNumber() @IsPositive() basePrice: number;
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) highlights: string[];
  @ApiProperty() @IsString() bestSeason: string;
  @ApiProperty() @IsInt() @Min(1) maxCapacity: number;
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) images: string[];
}

export class AddItineraryDto {
  @ApiProperty() @IsInt() @Min(1) day: number;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsString() attractions: string;
}

export class AddInclusionDto {
  @ApiProperty() @IsString() inclusion: string;
  @ApiProperty() @IsString() type: string;
}
