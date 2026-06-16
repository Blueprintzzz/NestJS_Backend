import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BookingCancelledEvent } from '../events/booking-cancelled.event';

@Injectable()
export class BookingCancelledListener {
  @OnEvent('booking.cancelled')
  handle(payload: BookingCancelledEvent): void {
    console.log(`[booking.cancelled] bookingNumber=${payload.booking.bookingNumber}`);
    // TODO: send cancellation email
  }
}
