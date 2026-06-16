import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateBookingPassengerDto } from './create-booking-passenger.dto';

export class CreateBookingDto {
  @ApiProperty()
  @IsUUID()
  tourPackageId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  numberOfPassengers: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  advancePayment?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  specialRequests?: string;

  @ApiProperty({ type: [CreateBookingPassengerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBookingPassengerDto)
  passengers: CreateBookingPassengerDto[];
}
