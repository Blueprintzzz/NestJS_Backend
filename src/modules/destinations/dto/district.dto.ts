import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateDistrictDto {
  @ApiProperty() @IsString() @MinLength(2) name: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() weatherInfo: Record<string, any>;
  @ApiPropertyOptional() @IsString() @IsOptional() bestVisitingSeason?: string;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiPropertyOptional() @IsString() @IsOptional() coverImage?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() featured?: boolean;
}

export class UpdateDistrictDto {
  @ApiPropertyOptional() @IsString() @IsOptional() name?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsOptional() weatherInfo?: Record<string, any>;
  @ApiPropertyOptional() @IsString() @IsOptional() bestVisitingSeason?: string;
  @ApiPropertyOptional() @IsOptional() latitude?: number;
  @ApiPropertyOptional() @IsOptional() longitude?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() coverImage?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() featured?: boolean;
  @ApiPropertyOptional() @IsString() @IsOptional() status?: string;
}

export class DistrictQueryDto {
  @ApiPropertyOptional() @IsString() @IsOptional() search?: string;
  @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() page: number = 1;
  @ApiPropertyOptional({ default: 10 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() limit: number = 10;
}

export class GetDistrictDto {
  id: string;
  name: string;
  description: string;
  weatherInfo: any;
  bestVisitingSeason?: string | null;
  latitude: number;
  longitude: number;
  coverImage?: string | null;
  featured: boolean;
  status: string;
  attractions: any[];
  createdAt: Date;
  updatedAt: Date;
}
