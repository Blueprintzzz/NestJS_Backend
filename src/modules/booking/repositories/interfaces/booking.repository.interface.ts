import { CreateBookingDto } from '../../dto/create-booking.dto';
import { CreateBookingPassengerDto } from '../../dto/create-booking-passenger.dto';
import { RecordPaymentDto } from '../../dto/record-payment.dto';
import { UpdateBookingDto } from '../../dto/update-booking.dto';
import { BookingQueryDto } from '../../dto/booking-query.dto';
import { Pagination } from '../../dto/booking-response.dto';
import { BookingEntity } from '../../entities/booking.entity';
import { BookingPassengerEntity } from '../../entities/booking-passenger.entity';
import { BookingPaymentEntity } from '../../entities/booking-payment.entity';

export interface IBookingRepository {
  create(dto: CreateBookingDto, userId: string, totalCost: number): Promise<BookingEntity>;
  findById(id: string): Promise<BookingEntity | null>;
  findByBookingNumber(bookingNumber: string): Promise<BookingEntity | null>;
  findByUserId(userId: string, query: BookingQueryDto): Promise<Pagination<BookingEntity>>;
  findAll(query: BookingQueryDto): Promise<Pagination<BookingEntity>>;
  update(id: string, dto: UpdateBookingDto): Promise<BookingEntity>;
  cancel(id: string): Promise<BookingEntity>;
  delete(id: string): Promise<boolean>;
  addPassenger(bookingId: string, dto: CreateBookingPassengerDto): Promise<BookingPassengerEntity>;
  removePassenger(passengerId: string): Promise<boolean>;
  recordPayment(bookingId: string, dto: RecordPaymentDto): Promise<BookingPaymentEntity>;
  getPaymentHistory(bookingId: string): Promise<BookingPaymentEntity[]>;
  findByDriverId(driverId: string, query: BookingQueryDto): Promise<Pagination<BookingEntity>>;
}
