import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole, VehicleType } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
  CheckAvailabilityDto,
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleQueryDto,
} from '../dto/vehicle.dto';
import { VehiclesService } from '../services/vehicles.service';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create vehicle — DRIVER: owns it automatically | ADMIN: may set driverId in body' })
  create(@Body() dto: CreateVehicleDto, @CurrentUser() user: any) {
    return this.vehiclesService.createVehicle(dto, user.id, user.role);
  }

  @Get()
  @ApiOperation({ summary: 'List vehicles — filters: type, vehicleModelId, driverId, minCapacity, maxPrice' })
  findAll(@Query() query: VehicleQueryDto) {
    return this.vehiclesService.getAllVehicles(query);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get vehicle recommendations' })
  getRecommendations(
    @Query('numberOfTravelers') numberOfTravelers: number,
    @Query('budget') budget: number,
    @Query('tripDays') tripDays: number,
  ) {
    return this.vehiclesService.getRecommendations(+numberOfTravelers, +budget, +tripDays);
  }

  @Get('driver/me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: "Get current driver's own vehicles" })
  getMyVehicles(@CurrentUser() user: any) {
    return this.vehiclesService.getMyVehicles(user.id);
  }

  @Get('driver/:driverId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'driverId' })
  @ApiOperation({ summary: "Get vehicles by driverId — DRIVER: own only | ADMIN: any" })
  getDriverVehicles(@Param('driverId') driverId: string, @CurrentUser() user: any) {
    return this.vehiclesService.getVehiclesByDriverId(driverId, user.id, user.role);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get vehicles by type' })
  @ApiParam({ name: 'type', enum: VehicleType })
  findByType(@Param('type') type: VehicleType, @Query() query: VehicleQueryDto) {
    return this.vehiclesService.getVehiclesByType(type, query);
  }

  @Post('check-availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check vehicle availability' })
  checkAvailability(@Body() dto: CheckAvailabilityDto) {
    return this.vehiclesService.checkAvailability(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.getVehicleById(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get availability calendar for vehicle' })
  @ApiParam({ name: 'id' })
  getAvailability(@Param('id') id: string) {
    return this.vehiclesService.getAvailabilityCalendar(id);
  }

  @Post(':id/reserve')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reserve vehicle (internal — requires JWT)' })
  @ApiParam({ name: 'id' })
  reserve(
    @Param('id') vehicleId: string,
    @Body() body: { bookingId: string; startDate: string; endDate: string },
  ) {
    return this.vehiclesService.reserveVehicle(vehicleId, body.bookingId, body.startDate, body.endDate);
  }

  @Patch(':id')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update vehicle (DRIVER owner or ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.updateVehicle(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete vehicle (ADMIN only)' })
  remove(@Param('id') id: string) {
    return this.vehiclesService.deleteVehicle(id);
  }
}
