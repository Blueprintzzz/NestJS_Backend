import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsOptional, IsPhoneNumber, IsString, IsUUID, Min, MinLength } from 'class-validator';
import { InquiryCategory, InquiryPriority, InquiryStatus } from '@prisma/client';

export class CreateInquiryDto {
  @ApiProperty() @IsString() @MinLength(2) name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() phone: string;
  @ApiProperty() @IsString() @MinLength(3) subject: string;
  @ApiProperty() @IsString() @MinLength(10) message: string;
  @ApiProperty({ enum: InquiryCategory }) @IsEnum(InquiryCategory) category: InquiryCategory;
}

export class UpdateInquiryStatusDto {
  @ApiPropertyOptional({ enum: InquiryStatus }) @IsEnum(InquiryStatus) @IsOptional() status?: InquiryStatus;
  @ApiPropertyOptional({ enum: InquiryPriority }) @IsEnum(InquiryPriority) @IsOptional() priority?: InquiryPriority;
  @ApiPropertyOptional() @IsUUID() @IsOptional() assignedToAdminId?: string;
}

export class RespondInquiryDto {
  @ApiProperty() @IsString() @MinLength(5) response: string;
}

export class InquiryQueryDto {
  @ApiPropertyOptional({ enum: InquiryStatus }) @IsEnum(InquiryStatus) @IsOptional() status?: InquiryStatus;
  @ApiPropertyOptional({ enum: InquiryPriority }) @IsEnum(InquiryPriority) @IsOptional() priority?: InquiryPriority;
  @ApiPropertyOptional({ enum: InquiryCategory }) @IsEnum(InquiryCategory) @IsOptional() category?: InquiryCategory;
  @ApiPropertyOptional() @IsUUID() @IsOptional() assignedToAdminId?: string;
  @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() page: number = 1;
  @ApiPropertyOptional({ default: 10 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() limit: number = 10;
}
