import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ExperienceCategory } from '../entities/experience.entity';

export class CreateExperienceDto {
  @ApiProperty() @IsString() @MinLength(2) name: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty({ enum: ExperienceCategory }) @IsEnum(ExperienceCategory) category: ExperienceCategory;
  @ApiProperty() @IsNumber() price: number;
  @ApiProperty() @IsString() duration: string;
  @ApiPropertyOptional() @IsString() @IsOptional() image?: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsString({ each: true }) @IsOptional() images?: string[];
  @ApiPropertyOptional() @IsString() @IsOptional() location?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() destinationId?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() featured?: boolean;
  @ApiPropertyOptional() @IsString() @IsOptional() status?: string;
}

export class UpdateExperienceDto {
  @ApiPropertyOptional() @IsString() @IsOptional() name?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional({ enum: ExperienceCategory }) @IsEnum(ExperienceCategory) @IsOptional() category?: ExperienceCategory;
  @ApiPropertyOptional() @IsNumber() @IsOptional() price?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() duration?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() image?: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsString({ each: true }) @IsOptional() images?: string[];
  @ApiPropertyOptional() @IsString() @IsOptional() location?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() destinationId?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() featured?: boolean;
  @ApiPropertyOptional() @IsString() @IsOptional() status?: string;
}

export class ExperienceQueryDto {
  @ApiPropertyOptional({ enum: ExperienceCategory }) @IsEnum(ExperienceCategory) @IsOptional() category?: ExperienceCategory;
  @ApiPropertyOptional() @IsString() @IsOptional() search?: string;
  @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() page: number = 1;
  @ApiPropertyOptional({ default: 10 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() limit: number = 10;
}
