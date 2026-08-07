import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BookingStatus } from '@prisma/client';
import { BookingQueryDto } from '../dto/booking-query.dto';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { CreateBookingPassengerDto } from '../dto/create-booking-passenger.dto';
import { Pagination } from '../dto/booking-response.dto';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { BookingEntity } from '../entities/booking.entity';
import { BookingPassengerEntity } from '../entities/booking-passenger.entity';
import { BookingPaymentEntity } from '../entities/booking-payment.entity';
import { BookingCancelledEvent } from '../events/booking-cancelled.event';
import { BookingCreatedEvent } from '../events/booking-created.event';
import { PaymentRecordedEvent } from '../events/payment-recorded.event';
import { IBookingRepository } from '../repositories/interfaces/booking.repository.interface';
import { BOOKING_REPOSITORY } from '../repositories/repository.provider';

const IMMUTABLE_STATUSES: BookingStatus[] = [BookingStatus.COMPLETED, BookingStatus.CANCELLED];

@Injectable()
export class BookingService {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly repo: IBookingRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createBooking(dto: CreateBookingDto, userId: string): Promise<BookingEntity> {
    this.validateBookingDates(dto.startDate, dto.endDate);
    // totalCost placeholder — replace with real tour/vehicle pricing lookup
    const totalCost = dto.advancePayment ?? 0;
    const booking = await this.repo.create(dto, userId, totalCost);
    this.eventEmitter.emit('booking.created', new BookingCreatedEvent(booking));
    return booking;
  }

  async getBookingById(id: string): Promise<BookingEntity> {
    const booking = await this.repo.findById(id);
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  async getUserBookings(userId: string, query: BookingQueryDto): Promise<Pagination<BookingEntity>> {
    return this.repo.findByUserId(userId, query);
  }

  async getAllBookings(query: BookingQueryDto): Promise<Pagination<BookingEntity>> {
    return this.repo.findAll(query);
  }

  async updateBooking(id: string, dto: UpdateBookingDto): Promise<BookingEntity> {
    const booking = await this.getBookingById(id);
    this.assertMutable(booking);
    if (dto.startDate || dto.endDate) {
      this.validateBookingDates(dto.startDate ?? booking.startDate.toISOString(), dto.endDate ?? booking.endDate.toISOString());
    }
    return this.repo.update(id, dto);
  }

  async cancelBooking(id: string): Promise<BookingEntity> {
    const booking = await this.getBookingById(id);
    if (booking.status === BookingStatus.CANCELLED) throw new ConflictException('Booking is already cancelled');
    if (booking.status === BookingStatus.COMPLETED) throw new ConflictException('Cannot cancel a completed booking');
    const cancelled = await this.repo.cancel(id);
    this.eventEmitter.emit('booking.cancelled', new BookingCancelledEvent(cancelled));
    return cancelled;
  }

  async addPassenger(bookingId: string, dto: CreateBookingPassengerDto): Promise<BookingPassengerEntity> {
    await this.getBookingById(bookingId);
    return this.repo.addPassenger(bookingId, dto);
  }

  async removePassenger(passengerId: string): Promise<boolean> {
    return this.repo.removePassenger(passengerId);
  }

  async recordPayment(bookingId: string, dto: RecordPaymentDto): Promise<BookingPaymentEntity> {
    const booking = await this.getBookingById(bookingId);
    this.assertMutable(booking);
    if (dto.amount > booking.remainingAmount) {
      throw new BadRequestException(`Payment amount (${dto.amount}) exceeds remaining balance (${booking.remainingAmount})`);
    }
    const payment = await this.repo.recordPayment(bookingId, dto);
    this.eventEmitter.emit('booking.payment.recorded', new PaymentRecordedEvent(bookingId, payment));
    return payment;
  }

  async getPaymentHistory(bookingId: string): Promise<BookingPaymentEntity[]> {
    await this.getBookingById(bookingId);
    return this.repo.getPaymentHistory(bookingId);
  }

  async getDriverBookings(driverId: string, query: BookingQueryDto): Promise<Pagination<BookingEntity>> {
    return this.repo.findByDriverId(driverId, query);
  }

  validateBookingDates(startDate: string | Date, endDate: string | Date): void {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    if (start <= now) throw new BadRequestException('Start date must be in the future');
    if (end <= start) throw new BadRequestException('End date must be after start date');
  }

  private assertMutable(booking: BookingEntity): void {
    if (IMMUTABLE_STATUSES.includes(booking.status)) {
      throw new ConflictException(`Cannot modify a booking with status ${booking.status}`);
    }
  }
}
