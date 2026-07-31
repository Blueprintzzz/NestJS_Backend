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
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
    CreateCustomBookingDto,
    CreateDriverOfferDto,
    CustomBookingQueryDto,
    UpdateCustomBookingDto,
    UpdateCustomBookingStatusDto,
} from '../dto/custom-booking.dto';
import { CustomBookingService } from '../services/custom-booking.service';

@ApiTags('custom-bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('custom-bookings')
export class CustomBookingController {
    constructor(private readonly service: CustomBookingService) {}

    // ─── 1. Create ────────────────────────────────────────────────────────────

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.TOURIST, UserRole.ADMIN)
    @ApiOperation({ summary: 'Tourist/Admin creates a custom booking request' })
    create(@Body() dto: CreateCustomBookingDto, @CurrentUser() user: any) {
        return this.service.create(dto, user.id);
    }

    // ─── 2. Admin: list all ───────────────────────────────────────────────────

    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Admin: list all custom bookings with filters' })
    findAll(@Query() query: CustomBookingQueryDto) {
        return this.service.findAll(query);
    }

    // ─── 3. Tourist: my bookings — MUST be before /:id ────────────────────────

    @Get('my')
    @ApiOperation({ summary: 'Tourist: list own custom bookings' })
    findMine(@Query() query: CustomBookingQueryDto, @CurrentUser() user: any) {
        return this.service.findMine(user.id, query);
    }

    // ─── 4. Get by ID ─────────────────────────────────────────────────────────

    @Get(':id')
    @ApiParam({ name: 'id' })
    @ApiOperation({ summary: 'Get booking detail — owner, admin, or offering driver' })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.findById(id, user.id, user.role);
    }

    // ─── 5. Admin: update status ──────────────────────────────────────────────

    @Patch(':id/status')
    @ApiParam({ name: 'id' })
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Admin: update booking status' })
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateCustomBookingStatusDto,
        @CurrentUser() user: any,
    ) {
        return this.service.updateStatus(id, dto, user.id, user.role);
    }

    // ─── 6. Tourist: update booking ───────────────────────────────────────────

    @Patch(':id')
    @ApiParam({ name: 'id' })
    @ApiOperation({ summary: 'Tourist: update own PENDING booking' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateCustomBookingDto,
        @CurrentUser() user: any,
    ) {
        return this.service.update(id, dto, user.id);
    }

    // ─── 7. Delete / cancel ───────────────────────────────────────────────────

    @Delete(':id')
    @ApiParam({ name: 'id' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Tourist: cancel PENDING booking | Admin: hard delete or soft cancel' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.remove(id, user.id, user.role);
    }

    // ─── 8. Driver: submit offer ──────────────────────────────────────────────

    @Post(':id/offers')
    @ApiParam({ name: 'id' })
    @UseGuards(RolesGuard)
    @Roles(UserRole.DRIVER)
    @ApiOperation({ summary: 'Driver: submit a price offer' })
    createOffer(
        @Param('id') id: string,
        @Body() dto: CreateDriverOfferDto,
        @CurrentUser() user: any,
    ) {
        return this.service.createOffer(id, user.id, dto);
    }

    // ─── 9. List offers ───────────────────────────────────────────────────────

    @Get(':id/offers')
    @ApiParam({ name: 'id' })
    @ApiOperation({ summary: 'Admin or booking owner: list offers' })
    getOffers(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.getOffers(id, user.id, user.role);
    }

    // ─── 10. Accept offer ─────────────────────────────────────────────────────

    @Post(':id/offers/:offerId/accept')
    @ApiParam({ name: 'id' })
    @ApiParam({ name: 'offerId' })
    @UseGuards(RolesGuard)
    @Roles(UserRole.TOURIST)
    @ApiOperation({ summary: 'Tourist: accept an offer — confirms booking' })
    acceptOffer(
        @Param('id') id: string,
        @Param('offerId') offerId: string,
        @CurrentUser() user: any,
    ) {
        return this.service.acceptOffer(id, offerId, user.id);
    }

    // ─── 11. Reject offer ─────────────────────────────────────────────────────

    @Post(':id/offers/:offerId/reject')
    @ApiParam({ name: 'id' })
    @ApiParam({ name: 'offerId' })
    @UseGuards(RolesGuard)
    @Roles(UserRole.TOURIST)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Tourist: reject a single offer' })
    rejectOffer(
        @Param('id') id: string,
        @Param('offerId') offerId: string,
        @CurrentUser() user: any,
    ) {
        return this.service.rejectOffer(id, offerId, user.id);
    }
}
