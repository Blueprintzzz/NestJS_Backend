import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BookingCancelledEvent } from '../events/booking-cancelled.event';

@Injectable()
export class BookingCancelledListener {
  @OnEvent('booking.cancelled')
  handle(payload: BookingCancelledEvent): void {
    const bookingNumber = payload.booking.bookingNumber.replace(/[\r\n]/g, '');
    console.log(`[booking.cancelled] bookingNumber=${bookingNumber}`);
    // TODO: send cancellation email
  }
}
