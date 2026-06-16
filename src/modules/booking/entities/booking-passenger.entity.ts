export class BookingPassengerEntity {
  id: string;
  bookingId: string;
  passengerName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  passportNumber?: string | null;
  createdAt: Date;
}
