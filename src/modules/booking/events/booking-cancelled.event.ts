import { BookingEntity } from '../entities/booking.entity';

export class BookingCancelledEvent {
  constructor(public readonly booking: BookingEntity) {}
}
