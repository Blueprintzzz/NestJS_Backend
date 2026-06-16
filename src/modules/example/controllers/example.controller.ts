import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateExampleDto } from '../dto/create-example.dto';
import { ExampleEntity } from '../entities/example.entity';
import { ExampleService } from '../services/example.service';

@ApiTags('examples')
@Controller('examples')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new example record' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  create(@Body() createExampleDto: CreateExampleDto): Promise<ExampleEntity> {
    return this.exampleService.create(createExampleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all example records' })
  @ApiResponse({ status: 200, description: 'List of examples' })
  findAll(): Promise<ExampleEntity[]> {
    return this.exampleService.findAll();
  }
}
