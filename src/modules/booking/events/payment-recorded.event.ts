import { BookingPaymentEntity } from '../entities/booking-payment.entity';

export class PaymentRecordedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly payment: BookingPaymentEntity,
  ) {}
}
