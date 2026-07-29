import { CustomBookingOfferEntity } from '../entities/custom-booking.entity';

export class CustomBookingOfferAcceptedEvent {
    constructor(
        public readonly customBookingId: string,
        public readonly offer: CustomBookingOfferEntity,
    ) { }
}
