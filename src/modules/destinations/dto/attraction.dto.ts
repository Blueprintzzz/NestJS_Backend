import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export enum AttractionCategoryEnum {
  TEMPLE = 'TEMPLE',
  BEACH = 'BEACH',
  MOUNTAIN = 'MOUNTAIN',
  WATERFALL = 'WATERFALL',
  HISTORIC = 'HISTORIC',
  WILDLIFE = 'WILDLIFE',
}

export class CreateAttractionDto {
  @ApiProperty() @IsString() @MinLength(2) name: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsString() districtId: string;
  @ApiProperty({ enum: AttractionCategoryEnum }) @IsEnum(AttractionCategoryEnum) category: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsString({ each: true }) @IsOptional() images: string[] = [];
  @ApiProperty() @IsString() travelTips: string;
  @ApiProperty() @IsString() estimatedVisitingTime: string;
  @ApiProperty() @IsNumber() latitude: number;
  @ApiProperty() @IsNumber() longitude: number;
  @ApiPropertyOptional() @IsString() @IsOptional() openingHours?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() entryFee?: number;
}

export class UpdateAttractionDto {
  @ApiPropertyOptional() @IsString() @IsOptional() name?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional({ enum: AttractionCategoryEnum }) @IsEnum(AttractionCategoryEnum) @IsOptional() category?: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() images?: string[];
  @ApiPropertyOptional() @IsString() @IsOptional() travelTips?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() estimatedVisitingTime?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() latitude?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() longitude?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() openingHours?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() entryFee?: number;
}

export class AttractionQueryDto {
  @ApiPropertyOptional() @IsString() @IsOptional() districtId?: string;
  @ApiPropertyOptional({ enum: AttractionCategoryEnum }) @IsEnum(AttractionCategoryEnum) @IsOptional() category?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() search?: string;
  @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() page: number = 1;
  @ApiPropertyOptional({ default: 10 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() limit: number = 10;
}
