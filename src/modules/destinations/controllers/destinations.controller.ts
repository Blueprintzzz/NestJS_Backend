import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateDestinationDto, DestinationCategory, DestinationQueryDto, UpdateDestinationDto } from '../dto/destination.dto';
import { DestinationsService } from '../services/destinations.service';

@ApiTags('destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly service: DestinationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all destinations (paginated, public)' })
  getAll(@Query() query: DestinationQueryDto) {
    return this.service.getAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured destinations (max 6)' })
  getFeatured() {
    return this.service.getFeatured();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get destinations by category (paginated)' })
  getByCategory(
    @Param('category') category: DestinationCategory,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.service.getByCategory(category, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get destination by id' })
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create destination (admin)' })
  create(@Body() dto: CreateDestinationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update destination (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateDestinationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete destination (admin)' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/feature')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle featured status (admin)' })
  setFeatured(@Param('id') id: string, @Body('featured') featured: boolean) {
    return this.service.setFeatured(id, featured);
  }
}
