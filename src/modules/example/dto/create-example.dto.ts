import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExampleDto {
  @ApiProperty({ example: 'My first example' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'An optional description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
