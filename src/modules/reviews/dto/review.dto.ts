import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty() @IsUUID() bookingId: string;
  @ApiProperty() @IsInt() @Min(1) @Max(5) rating: number;
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(200) title: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(2000) description: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsString({ each: true }) @IsOptional() images: string[] = [];
}

export class UpdateReviewDto {
  @ApiPropertyOptional() @IsInt() @Min(1) @Max(5) @IsOptional() rating?: number;
  @ApiPropertyOptional() @IsString() @MaxLength(200) @IsOptional() title?: string;
  @ApiPropertyOptional() @IsString() @MaxLength(2000) @IsOptional() description?: string;
}

export class ReviewQueryDto {
  @ApiPropertyOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) @IsOptional() rating?: number;
  @ApiPropertyOptional() @IsUUID() @IsOptional() bookingId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() status?: string;
  @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() page: number = 1;
  @ApiPropertyOptional({ default: 10 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() limit: number = 10;
}
