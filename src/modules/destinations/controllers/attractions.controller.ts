import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AttractionQueryDto, CreateAttractionDto, UpdateAttractionDto } from '../dto/attraction.dto';
import { AttractionsService } from '../services/attractions.service';

@ApiTags('attractions')
@Controller('attractions')
export class AttractionsController {
  constructor(private readonly attractionsService: AttractionsService) { }

  @Get()
  @ApiOperation({ summary: 'List attractions with filters' })
  findAll(@Query() query: AttractionQueryDto) {
    return this.attractionsService.getAllAttractions(query);
  }

  @Get('district/:districtId')
  @ApiOperation({ summary: 'Get attractions by district' })
  @ApiParam({ name: 'districtId' })
  findByDistrict(@Param('districtId') districtId: string) {
    return this.attractionsService.getAttractionsByDistrict(districtId);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get attractions by category' })
  @ApiParam({ name: 'category' })
  findByCategory(@Param('category') category: string) {
    return this.attractionsService.getAttractionsByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attraction by ID' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.attractionsService.getAttractionById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create attraction (ADMIN only)' })
  create(@Body() dto: CreateAttractionDto) {
    return this.attractionsService.createAttraction(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attraction (ADMIN only)' })
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateAttractionDto) {
    return this.attractionsService.updateAttraction(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete attraction (ADMIN only)' })
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.attractionsService.deleteAttraction(id);
  }
}
