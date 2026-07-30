import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
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
    CreateDriverOfferDto,
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
    @ApiOperation({ summary: 'Create custom booking request (TOURIST only)' })
    @ApiResponse({ status: 201 })
    create(@Body() dto: CreateCustomBookingDto, @CurrentUser() user: any) {
        return this.service.create(dto, user.id);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.TOURIST, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get bookings — TOURIST: own | ADMIN: all' })
    findAll(@Query() query: CustomBookingQueryDto, @CurrentUser() user: any) {
        return this.service.findForUser(user.id, user.role, query);
    }

    @Get(':id')
    @ApiParam({ name: 'id' })
    @ApiOperation({ summary: 'Get by ID — TOURIST: own | DRIVER: if has offer | ADMIN: any' })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.findById(id, user.id, user.role);
    }

    // ─── Offers ───────────────────────────────────────────────────────────────

    @Post(':id/offers')
    @ApiParam({ name: 'id' })
    @UseGuards(RolesGuard)
    @Roles(UserRole.DRIVER)
    @ApiOperation({ summary: 'Submit a price offer (DRIVER only)' })
    @ApiResponse({ status: 201 })
    createOffer(
        @Param('id') id: string,
        @Body() dto: CreateDriverOfferDto,
        @CurrentUser() user: any,
    ) {
        return this.service.createOffer(id, user.id, dto);
    }

    @Get(':id/offers')
    @ApiParam({ name: 'id' })
    @ApiOperation({ summary: 'Get offers — TOURIST/ADMIN: all | DRIVER: own offer only' })
    getOffers(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.getOffers(id, user.id, user.role);
    }

    @Post(':id/offers/:offerId/accept')
    @ApiParam({ name: 'id' })
    @ApiParam({ name: 'offerId' })
    @UseGuards(RolesGuard)
    @Roles(UserRole.TOURIST)
    @ApiOperation({ summary: 'Accept offer — reserves vehicle, confirms booking (TOURIST owner only)' })
    acceptOffer(
        @Param('id') id: string,
        @Param('offerId') offerId: string,
        @CurrentUser() user: any,
    ) {
        return this.service.acceptOffer(id, offerId, user.id);
    }

    @Post(':id/offers/:offerId/reject')
    @ApiParam({ name: 'id' })
    @ApiParam({ name: 'offerId' })
    @UseGuards(RolesGuard)
    @Roles(UserRole.TOURIST)
    @ApiOperation({ summary: 'Reject a single offer (TOURIST owner only)' })
    @HttpCode(HttpStatus.OK)
    rejectOffer(
        @Param('id') id: string,
        @Param('offerId') offerId: string,
        @CurrentUser() user: any,
    ) {
        return this.service.rejectOffer(id, offerId, user.id);
    }

    // ─── Status ───────────────────────────────────────────────────────────────

    @Patch(':id/status')
    @ApiParam({ name: 'id' })
    @UseGuards(RolesGuard)
    @Roles(UserRole.DRIVER, UserRole.TOURIST, UserRole.ADMIN)
    @ApiOperation({
        summary: 'Update status — DRIVER: IN_PROGRESS/COMPLETED | TOURIST: CANCELLED (own, PENDING/OFFER_RECEIVED) | ADMIN: CANCELLED (any)',
    })
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateCustomBookingStatusDto,
        @CurrentUser() user: any,
    ) {
        return this.service.updateStatus(id, dto, user.id, user.role);
    }
}
