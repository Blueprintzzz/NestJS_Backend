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
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
    CreateVehicleModelDto,
    UpdateVehicleModelDto,
    VehicleModelQueryDto,
} from '../dto/vehicle-model.dto';
import { VehicleModelsService } from '../services/vehicle-models.service';

@ApiTags('vehicle-models')
@Controller('vehicle-models')
export class VehicleModelsController {
    constructor(private readonly service: VehicleModelsService) { }

    @Get()
    @ApiOperation({ summary: 'List all vehicle models, optionally filtered by type' })
    findAll(@Query() query: VehicleModelQueryDto) {
        return this.service.getAll(query);
    }

    @Get('type/:type')
    @ApiParam({ name: 'type', enum: VehicleType })
    @ApiOperation({ summary: 'Get all models for a vehicle type' })
    findByType(@Param('type') type: VehicleType) {
        return this.service.getByType(type);
    }

    @Get(':id')
    @ApiParam({ name: 'id' })
    @ApiOperation({ summary: 'Get vehicle model by ID' })
    findOne(@Param('id') id: string) {
        return this.service.getById(id);
    }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create vehicle model (ADMIN only)' })
    create(@Body() dto: CreateVehicleModelDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update vehicle model (ADMIN only)' })
    update(@Param('id') id: string, @Body() dto: UpdateVehicleModelDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete vehicle model (ADMIN only)' })
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}
