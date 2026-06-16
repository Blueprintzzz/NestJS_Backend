import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class CreateBookingPassengerDto {
  @ApiProperty()
  @IsString()
  passengerName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\+?[\d\s\-()]{7,15}$/, { message: 'Invalid phone number' })
  phone: string;

  @ApiProperty()
  @IsDateString()
  dateOfBirth: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  passportNumber?: string;
}
