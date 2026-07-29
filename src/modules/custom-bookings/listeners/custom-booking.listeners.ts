import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CustomBookingCreatedEvent } from '../events/custom-booking-created.event';
import { CustomBookingOfferAcceptedEvent } from '../events/custom-booking-offer-accepted.event';

@Injectable()
export class CustomBookingCreatedListener {
    @OnEvent('custom-booking.created')
    handle(payload: CustomBookingCreatedEvent): void {
        const id = payload.customBooking.id.replace(/[\r\n]/g, '');
        console.log(`[custom-booking.created] id=${id}`);
        // TODO: notify available drivers
    }
}

@Injectable()
export class CustomBookingOfferAcceptedListener {
    @OnEvent('custom-booking.offer.accepted')
    handle(payload: CustomBookingOfferAcceptedEvent): void {
        const bookingId = payload.customBookingId.replace(/[\r\n]/g, '');
        const offerId = payload.offer.id.replace(/[\r\n]/g, '');
        console.log(`[custom-booking.offer.accepted] bookingId=${bookingId} offerId=${offerId}`);
        // TODO: notify driver and tourist
    }
}
