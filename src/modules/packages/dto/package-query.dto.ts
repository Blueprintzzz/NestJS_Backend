import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { PackageCategory } from '@prisma/client';

export class PackageQueryDto {
  @ApiPropertyOptional({ enum: PackageCategory }) @IsEnum(PackageCategory) @IsOptional() category?: PackageCategory;
  @ApiPropertyOptional() @Type(() => Number) @IsNumber() @IsOptional() minPrice?: number;
  @ApiPropertyOptional() @Type(() => Number) @IsNumber() @IsOptional() maxPrice?: number;
  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional() minDuration?: number;
  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional() maxDuration?: number;
  @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() page: number = 1;
  @ApiPropertyOptional({ default: 10 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() limit: number = 10;
}
