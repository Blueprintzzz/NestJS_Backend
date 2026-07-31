import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PackageCategory, UserRole } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AddInclusionDto, AddItineraryDto, CreateTourPackageDto } from '../dto/create-package.dto';
import { PackageQueryDto } from '../dto/package-query.dto';
import { UpdateTourPackageDto } from '../dto/update-package.dto';
import { PackagesService } from '../services/packages.service';

@ApiTags('packages')
@Controller('packages')
export class PackagesController {
  constructor(private readonly service: PackagesService) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create tour package (DRIVER or ADMIN)' })
  create(@Body() dto: CreateTourPackageDto, @CurrentUser() user: any) {
    return this.service.createPackage(dto, user.id);
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

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get own packages (DRIVER or ADMIN)' })
  getMyPackages(@CurrentUser() user: any, @Query() query: PackageQueryDto) {
    return this.service.getPackagesByAdmin(user.id, query);
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update package (DRIVER owner or ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateTourPackageDto) {
    return this.service.updatePackage(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete package (ADMIN only)' })
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark package as featured (ADMIN only)' })
  feature(@Param('id') id: string) {
    return this.service.markFeatured(id);
  }

  @Post(':id/deactivate')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate package (ADMIN only)' })
  deactivate(@Param('id') id: string) {
    return this.service.deactivatePackage(id);
  }
}
