import { CustomBookingEntity } from '../entities/custom-booking.entity';

export class CustomBookingCreatedEvent {
    constructor(public readonly customBooking: CustomBookingEntity) { }
}
