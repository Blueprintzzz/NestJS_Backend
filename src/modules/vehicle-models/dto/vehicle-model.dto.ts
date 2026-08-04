import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateVehicleModelDto {
    @ApiProperty({ example: 'Toyota HiAce' })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({ enum: VehicleType })
    @IsEnum(VehicleType)
    type: VehicleType;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    image?: string;
}

export class UpdateVehicleModelDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @ApiPropertyOptional({ enum: VehicleType })
    @IsOptional()
    @IsEnum(VehicleType)
    type?: VehicleType;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    image?: string;
}

export class VehicleModelQueryDto {
    @ApiPropertyOptional({ enum: VehicleType })
    @IsOptional()
    @IsEnum(VehicleType)
    type?: VehicleType;
}
