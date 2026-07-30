import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsEnum, IsInt, IsNumber,
  IsOptional, IsString, Min, MinLength,
} from 'class-validator';

export enum DestinationCategory {
  TEMPLE = 'TEMPLE',
  BEACH = 'BEACH',
  MOUNTAIN = 'MOUNTAIN',
  WATERFALL = 'WATERFALL',
  HISTORIC = 'HISTORIC',
  WILDLIFE = 'WILDLIFE',
  CITY = 'CITY',
  NATURE = 'NATURE',
}

export class CreateDestinationDto {
  @ApiProperty() @IsString() @MinLength(2) name: string;
  @ApiProperty() @IsString() @MinLength(10) description: string;
  @ApiProperty({ enum: DestinationCategory }) @IsEnum(DestinationCategory) category: DestinationCategory;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsString({ each: true }) @IsOptional() images: string[] = [];
  @ApiPropertyOptional() @IsString() @IsOptional() coverImage?: string;
  @ApiProperty() @IsNumber() latitude: number;
  @ApiProperty() @IsNumber() longitude: number;
  @ApiPropertyOptional() @IsOptional() weatherInfo?: Record<string, any>;
  @ApiPropertyOptional() @IsString() @IsOptional() bestVisitingSeason?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() travelTips?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() estimatedVisitingTime?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() openingHours?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() entryFee?: number;
  @ApiPropertyOptional({ default: false }) @IsBoolean() @IsOptional() featured: boolean = false;
}

export class UpdateDestinationDto {
  @ApiPropertyOptional() @IsString() @MinLength(2) @IsOptional() name?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional({ enum: DestinationCategory }) @IsEnum(DestinationCategory) @IsOptional() category?: DestinationCategory;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsString({ each: true }) @IsOptional() images?: string[];
  @ApiPropertyOptional() @IsString() @IsOptional() coverImage?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() latitude?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() longitude?: number;
  @ApiPropertyOptional() @IsOptional() weatherInfo?: Record<string, any>;
  @ApiPropertyOptional() @IsString() @IsOptional() bestVisitingSeason?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() travelTips?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() estimatedVisitingTime?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() openingHours?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() entryFee?: number;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() featured?: boolean;
  @ApiPropertyOptional() @IsString() @IsOptional() status?: string;
}

export class DestinationQueryDto {
  @ApiPropertyOptional({ enum: DestinationCategory }) @IsEnum(DestinationCategory) @IsOptional() category?: DestinationCategory;
  @ApiPropertyOptional() @IsString() @IsOptional() search?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() @Type(() => Boolean) featured?: boolean;
  @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() page: number = 1;
  @ApiPropertyOptional({ default: 10 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() limit: number = 10;
}
