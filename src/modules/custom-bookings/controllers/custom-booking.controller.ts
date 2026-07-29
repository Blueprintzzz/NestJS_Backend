import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
    CreateCustomBookingDto,
    CreateCustomBookingOfferDto,
    CustomBookingQueryDto,
    UpdateCustomBookingStatusDto,
} from '../dto/custom-booking.dto';
import { CustomBookingService } from '../services/custom-booking.service';

@ApiTags('custom-bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('custom-bookings')
export class CustomBookingController {
    constructor(private readonly service: CustomBookingService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.TOURIST)
    @ApiOperation({ summary: 'Create a custom booking request (TOURIST only)' })
    @ApiResponse({ status: 201 })
    create(@Body() dto: CreateCustomBookingDto, @CurrentUser() user: any) {
        return this.service.create(dto, user.id);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.TOURIST, UserRole.ADMIN)
    @ApiOperation({ summary: "Get own custom bookings (TOURIST) or all (ADMIN)" })
    findAll(@Query() query: CustomBookingQueryDto, @CurrentUser() user: any) {
        return this.service.findForUser(user.id, user.role, query);
    }

    @Get(':id')
    @ApiParam({ name: 'id' })
    @ApiOperation({ summary: 'Get custom booking by ID' })
    findOne(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Post(':id/offers')
    @ApiParam({ name: 'id' })
    @UseGuards(RolesGuard)
    @Roles(UserRole.DRIVER)
    @ApiOperation({ summary: 'Submit a price offer (DRIVER only)' })
    @ApiResponse({ status: 201 })
    createOffer(
        @Param('id') id: string,
        @Body() dto: CreateCustomBookingOfferDto,
        @CurrentUser() user: any,
    ) {
        return this.service.createOffer(id, user.id, dto);
    }

    @Get(':id/offers')
    @ApiParam({ name: 'id' })
    @ApiOperation({ summary: 'Get all offers for a custom booking' })
    getOffers(@Param('id') id: string) {
        return this.service.getOffers(id);
    }

    @Post(':id/offers/:offerId/accept')
    @ApiParam({ name: 'id' })
    @ApiParam({ name: 'offerId' })
    @UseGuards(RolesGuard)
    @Roles(UserRole.TOURIST)
    @ApiOperation({ summary: 'Accept a driver offer (TOURIST — owner only)' })
    acceptOffer(
        @Param('id') id: string,
        @Param('offerId') offerId: string,
        @CurrentUser() user: any,
    ) {
        return this.service.acceptOffer(id, offerId, user.id);
    }

    @Patch(':id/status')
    @ApiParam({ name: 'id' })
    @UseGuards(RolesGuard)
    @Roles(UserRole.DRIVER, UserRole.TOURIST, UserRole.ADMIN)
    @ApiOperation({
        summary: 'Update booking status — DRIVER: IN_PROGRESS/COMPLETED | TOURIST: CANCELLED (own) | ADMIN: CANCELLED (any)',
    })
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateCustomBookingStatusDto,
        @CurrentUser() user: any,
    ) {
        return this.service.updateStatus(id, dto, user.id, user.role);
    }
}
