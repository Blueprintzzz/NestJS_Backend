import { BookingStatus, PaymentStatus } from '@prisma/client';
import { BookingPassengerEntity } from './booking-passenger.entity';
import { BookingPaymentEntity } from './booking-payment.entity';

export class BookingEntity {
  id: string;
  bookingNumber: string;
  userId: string;
  tourPackageId: string;
  vehicleId?: string | null;
  startDate: Date;
  endDate: Date;
  numberOfPassengers: number;
  totalCost: number;
  advancePayment?: number | null;
  remainingAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  specialRequests?: string | null;
  createdAt: Date;
  updatedAt: Date;
  passengers?: BookingPassengerEntity[];
  payments?: BookingPaymentEntity[];
}
