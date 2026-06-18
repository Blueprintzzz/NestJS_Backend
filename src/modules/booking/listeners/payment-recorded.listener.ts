import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentRecordedEvent } from '../events/payment-recorded.event';

@Injectable()
export class PaymentRecordedListener {
  @OnEvent('booking.payment.recorded')
  handle(payload: PaymentRecordedEvent): void {
    const bookingId = payload.bookingId.replace(/[\r\n]/g, '');
    console.log(`[booking.payment.recorded] bookingId=${bookingId} amount=${payload.payment.amount}`);
    // TODO: send payment receipt email
  }
}
