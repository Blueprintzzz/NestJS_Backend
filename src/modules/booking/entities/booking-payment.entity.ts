import { PaymentMethod, PaymentTransactionStatus } from '@prisma/client';

export class BookingPaymentEntity {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  transactionId?: string | null;
  status: PaymentTransactionStatus;
  createdAt: Date;
}
