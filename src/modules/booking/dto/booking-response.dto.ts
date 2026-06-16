import { BookingStatus, PaymentMethod, PaymentStatus, PaymentTransactionStatus } from '@prisma/client';

export class BookingPassengerResponseDto {
  id: string;
  bookingId: string;
  passengerName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  passportNumber?: string | null;
  createdAt: Date;
}

export class BookingPaymentResponseDto {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  transactionId?: string | null;
  status: PaymentTransactionStatus;
  createdAt: Date;
}

export class BookingResponseDto {
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
  passengers?: BookingPassengerResponseDto[];
  payments?: BookingPaymentResponseDto[];
}

export interface Pagination<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
