import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min } from 'class-validator';

export class UpdateBookingDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  numberOfPassengers?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  advancePayment?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  specialRequests?: string;
}
