import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateExperienceDto, ExperienceQueryDto, UpdateExperienceDto } from '../dto/experience.dto';
import { ExperiencesService } from '../services/experiences.service';

@ApiTags('experiences')
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) { }

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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create experience (ADMIN only)' })
  create(@Body() dto: CreateExperienceDto) {
    return this.experiencesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update experience (ADMIN only)' })
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateExperienceDto) {
    return this.experiencesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete experience (ADMIN only)' })
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.experiencesService.delete(id);
  }

  @Post(':id/feature')
  @ApiOperation({ summary: 'Set experience as featured (ADMIN only)' })
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  setFeatured(@Param('id') id: string) {
    return this.experiencesService.setFeatured(id);
  }
}
