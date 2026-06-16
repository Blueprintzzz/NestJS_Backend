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
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookingQueryDto } from '../dto/booking-query.dto';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { CreateBookingPassengerDto } from '../dto/create-booking-passenger.dto';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { BookingService } from '../services/booking.service';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateBookingDto, @Req() req: any) {
    // Replace req.user?.id with actual JWT user extraction once auth is wired
    const userId: string = req.user?.id ?? 'anonymous';
    return this.bookingService.createBooking(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all bookings (admin)' })
  findAll(@Query() query: BookingQueryDto) {
    return this.bookingService.getAllBookings(query);
  }

  @Get('user')
  @ApiOperation({ summary: "Get current user's bookings" })
  findUserBookings(@Query() query: BookingQueryDto, @Req() req: any) {
    const userId: string = req.user?.id ?? 'anonymous';
    return this.bookingService.getUserBookings(userId, query);
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get booking by ID' })
  findOne(@Param('id') id: string) {
    return this.bookingService.getBookingById(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update booking' })
  update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingService.updateBooking(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete booking (PENDING only)' })
  async remove(@Param('id') id: string) {
    await this.bookingService.getBookingById(id);
    return this.bookingService['repo'].delete(id);
  }

  @Post(':id/cancel')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Cancel booking' })
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
