import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BookingCreatedEvent } from '../events/booking-created.event';

@Injectable()
export class BookingCreatedListener {
  @OnEvent('booking.created')
  handle(payload: BookingCreatedEvent): void {
    const bookingNumber = payload.booking.bookingNumber.replace(/[\r\n]/g, '');
    const userId = payload.booking.userId.replace(/[\r\n]/g, '');
    console.log(`[booking.created] bookingNumber=${bookingNumber} userId=${userId}`);
    // TODO: send confirmation email
  }
}
