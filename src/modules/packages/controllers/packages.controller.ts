import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, Req,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PackageCategory } from '@prisma/client';
import { AddInclusionDto, AddItineraryDto, CreateTourPackageDto } from '../dto/create-package.dto';
import { PackageQueryDto } from '../dto/package-query.dto';
import { UpdateTourPackageDto } from '../dto/update-package.dto';
import { PackagesService } from '../services/packages.service';

@ApiTags('packages')
@Controller('packages')
export class PackagesController {
  constructor(private readonly service: PackagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create tour package (admin)' })
  create(@Body() dto: CreateTourPackageDto, @Req() req: any) {
    const adminId: string = req.user?.id ?? 'admin';
    return this.service.createPackage(dto, adminId);
  }

  @Get()
  @ApiOperation({ summary: 'List all packages with filters' })
  findAll(@Query() query: PackageQueryDto) {
    return this.service.getAllPackages(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured packages' })
  featured() {
    return this.service.getFeaturedPackages();
  }

  @Get('category/:category')
  @ApiParam({ name: 'category', enum: PackageCategory })
  @ApiOperation({ summary: 'Get packages by category' })
  byCategory(@Param('category') category: PackageCategory, @Query() query: PackageQueryDto) {
    return this.service.getPackagesByCategory(category, query);
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get package with itinerary & inclusions' })
  findOne(@Param('id') id: string) {
    return this.service.getPackageById(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update package (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateTourPackageDto) {
    return this.service.updatePackage(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete package (admin)' })
  remove(@Param('id') id: string) {
    return this.service.deletePackage(id);
  }

  @Post(':id/itinerary')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Add itinerary day' })
  addItinerary(@Param('id') id: string, @Body() dto: AddItineraryDto) {
    return this.service.addItinerary(id, dto);
  }

  @Patch(':id/itinerary/:day')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'day' })
  @ApiOperation({ summary: 'Update itinerary day' })
  updateItinerary(@Param('id') id: string, @Param('day') day: string, @Body() dto: AddItineraryDto) {
    return this.service.updateItinerary(id, parseInt(day), dto);
  }

  @Post(':id/inclusions')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Add inclusion' })
  addInclusion(@Param('id') id: string, @Body() dto: AddInclusionDto) {
    return this.service.addInclusion(id, dto);
  }

  @Post(':id/feature')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Mark package as featured (admin)' })
  feature(@Param('id') id: string) {
    return this.service.markFeatured(id);
  }

  @Post(':id/deactivate')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Deactivate package (admin)' })
  deactivate(@Param('id') id: string) {
    return this.service.deactivatePackage(id);
  }
}
