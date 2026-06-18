import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty() @IsString() @MinLength(2) name: string;
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsString() @IsOptional() icon?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() color?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() featured?: boolean;
}

export class CategoryResponseDto {
  id: string;
  name: string;
  description: string;
  icon?: string | null;
  color?: string | null;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
