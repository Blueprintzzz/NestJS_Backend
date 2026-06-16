import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../../drizzle/drizzle.service';
import { BookingQueryDto } from '../../dto/booking-query.dto';
import { CreateBookingDto } from '../../dto/create-booking.dto';
import { CreateBookingPassengerDto } from '../../dto/create-booking-passenger.dto';
import { Pagination } from '../../dto/booking-response.dto';
import { RecordPaymentDto } from '../../dto/record-payment.dto';
import { UpdateBookingDto } from '../../dto/update-booking.dto';
import { BookingEntity } from '../../entities/booking.entity';
import { BookingPassengerEntity } from '../../entities/booking-passenger.entity';
import { BookingPaymentEntity } from '../../entities/booking-payment.entity';
import { IBookingRepository } from '../interfaces/booking.repository.interface';

@Injectable()
export class DrizzleBookingRepository implements IBookingRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  create(_dto: CreateBookingDto, _userId: string, _totalCost: number): Promise<BookingEntity> {
    throw new Error('Drizzle not implemented');
  }
  findById(_id: string): Promise<BookingEntity | null> {
    throw new Error('Drizzle not implemented');
  }
  findByBookingNumber(_bookingNumber: string): Promise<BookingEntity | null> {
    throw new Error('Drizzle not implemented');
  }
  findByUserId(_userId: string, _query: BookingQueryDto): Promise<Pagination<BookingEntity>> {
    throw new Error('Drizzle not implemented');
  }
  findAll(_query: BookingQueryDto): Promise<Pagination<BookingEntity>> {
    throw new Error('Drizzle not implemented');
  }
  update(_id: string, _dto: UpdateBookingDto): Promise<BookingEntity> {
    throw new Error('Drizzle not implemented');
  }
  cancel(_id: string): Promise<BookingEntity> {
    throw new Error('Drizzle not implemented');
  }
  delete(_id: string): Promise<boolean> {
    throw new Error('Drizzle not implemented');
  }
  addPassenger(_bookingId: string, _dto: CreateBookingPassengerDto): Promise<BookingPassengerEntity> {
    throw new Error('Drizzle not implemented');
  }
  removePassenger(_passengerId: string): Promise<boolean> {
    throw new Error('Drizzle not implemented');
  }
  recordPayment(_bookingId: string, _dto: RecordPaymentDto): Promise<BookingPaymentEntity> {
    throw new Error('Drizzle not implemented');
  }
  getPaymentHistory(_bookingId: string): Promise<BookingPaymentEntity[]> {
    throw new Error('Drizzle not implemented');
  }
}
