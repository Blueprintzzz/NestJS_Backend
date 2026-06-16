import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BookingCreatedEvent } from '../events/booking-created.event';

@Injectable()
export class BookingCreatedListener {
  @OnEvent('booking.created')
  handle(payload: BookingCreatedEvent): void {
    console.log(`[booking.created] bookingNumber=${payload.booking.bookingNumber} userId=${payload.booking.userId}`);
    // TODO: send confirmation email
  }
}
