import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateExperienceDto, ExperienceQueryDto, UpdateExperienceDto } from '../dto/experience.dto';
import { ExperiencesService } from '../services/experiences.service';

@ApiTags('experiences')
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Get()
  @ApiOperation({ summary: 'List experiences with filters' })
  findAll(@Query() query: ExperienceQueryDto) {
    return this.experiencesService.getAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured experiences' })
  getFeatured() {
    return this.experiencesService.getFeatured();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get experience by ID' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.experiencesService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create experience (admin)' })
  create(@Body() dto: CreateExperienceDto) {
    return this.experiencesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update experience (admin)' })
  @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() dto: UpdateExperienceDto) {
    return this.experiencesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete experience (admin)' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.experiencesService.delete(id);
  }

  @Post(':id/feature')
  @ApiOperation({ summary: 'Set experience as featured (admin)' })
  @ApiParam({ name: 'id' })
  setFeatured(@Param('id') id: string) {
    return this.experiencesService.setFeatured(id);
  }
}
