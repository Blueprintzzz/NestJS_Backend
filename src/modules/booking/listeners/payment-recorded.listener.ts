import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentRecordedEvent } from '../events/payment-recorded.event';

@Injectable()
export class PaymentRecordedListener {
  @OnEvent('booking.payment.recorded')
  handle(payload: PaymentRecordedEvent): void {
    console.log(`[booking.payment.recorded] bookingId=${payload.bookingId} amount=${payload.payment.amount}`);
    // TODO: send payment receipt email
  }
}
