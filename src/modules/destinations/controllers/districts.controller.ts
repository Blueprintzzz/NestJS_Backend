import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateDistrictDto, DistrictQueryDto, UpdateDistrictDto } from '../dto/district.dto';
import { DistrictsService } from '../services/districts.service';

@ApiTags('districts')
@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) { }

  @Get()
  @ApiOperation({ summary: 'List all districts' })
  findAll(@Query() query: DistrictQueryDto) {
    return this.districtsService.getAllDistricts(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured districts' })
  getFeatured() {
    return this.districtsService.getFeaturedDistricts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get district by ID with attractions' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.districtsService.getDistrictById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create district (ADMIN only)' })
  create(@Body() dto: CreateDistrictDto) {
    return this.districtsService.createDistrict(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update district (ADMIN only)' })
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateDistrictDto) {
    return this.districtsService.updateDistrict(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete district (ADMIN only)' })
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.districtsService.deleteDistrict(id);
  }

  @Post(':id/featured')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle district featured status (ADMIN only)' })
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  setFeatured(@Param('id') id: string, @Body() body: { featured: boolean }) {
    return this.districtsService.setFeatured(id, body.featured);
  }
}
