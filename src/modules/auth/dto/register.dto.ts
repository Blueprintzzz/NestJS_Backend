import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'jane@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Password123!', minLength: 8 })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ example: 'Jane' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiPropertyOptional({ example: '+94771234567' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        enum: UserRole,
        enumName: 'UserRole',
        description: 'TOURIST or DRIVER only. ADMIN cannot self-register.',
        default: UserRole.TOURIST,
    })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}
