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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { BookingQueryDto } from '../dto/booking-query.dto';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { CreateBookingPassengerDto } from '../dto/create-booking-passenger.dto';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { BookingService } from '../services/booking.service';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post()
  @Roles(UserRole.TOURIST)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new booking (TOURIST only)' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: any) {
    return this.bookingService.createBooking(dto, user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'List all bookings (ADMIN only)' })
  findAll(@Query() query: BookingQueryDto) {
    return this.bookingService.getAllBookings(query);
  }

  @Get('user')
  @Roles(UserRole.TOURIST, UserRole.DRIVER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Get current user's bookings (TOURIST or DRIVER)" })
  findUserBookings(@Query() query: BookingQueryDto, @CurrentUser() user: any) {
    return this.bookingService.getUserBookings(user.id, query);
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get booking by ID' })
  findOne(@Param('id') id: string) {
    return this.bookingService.getBookingById(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update booking (owner or ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingService.updateBooking(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete booking — PENDING only (ADMIN)' })
  async remove(@Param('id') id: string) {
    await this.bookingService.getBookingById(id);
    return this.bookingService['repo'].delete(id);
  }

  @Post(':id/cancel')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Cancel booking (owner or ADMIN)' })
  cancel(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id);
  }

  @Post(':id/passengers')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Add passenger to booking' })
  addPassenger(@Param('id') id: string, @Body() dto: CreateBookingPassengerDto) {
    return this.bookingService.addPassenger(id, dto);
  }

  @Delete(':id/passengers/:passengerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'passengerId' })
  @ApiOperation({ summary: 'Remove passenger from booking' })
  removePassenger(@Param('passengerId') passengerId: string) {
    return this.bookingService.removePassenger(passengerId);
  }

  @Post(':id/payments')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Record payment for booking' })
  recordPayment(@Param('id') id: string, @Body() dto: RecordPaymentDto) {
    return this.bookingService.recordPayment(id, dto);
  }

  @Get(':id/payments')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get payment history for booking' })
  getPayments(@Param('id') id: string) {
    return this.bookingService.getPaymentHistory(id);
  }
}
