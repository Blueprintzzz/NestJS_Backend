import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CustomBookingCreatedEvent } from '../events/custom-booking-created.event';
import { CustomBookingConfirmedEvent } from '../events/custom-booking-confirmed.event';
import { DriverOfferSubmittedEvent } from '../events/driver-offer-submitted.event';

@Injectable()
export class CustomBookingCreatedListener {
    private readonly logger = new Logger(CustomBookingCreatedListener.name);

    @OnEvent('custom-booking.created')
    handle(payload: CustomBookingCreatedEvent): void {
        this.logger.log(
            `[custom-booking.created] id=${payload.customBookingId} type=${payload.requestedVehicleType}`,
        );
        // TODO: notify available drivers via push notification
    }
}

@Injectable()
export class DriverOfferSubmittedListener {
    private readonly logger = new Logger(DriverOfferSubmittedListener.name);

    @OnEvent('driver-offer.submitted')
    handle(payload: DriverOfferSubmittedEvent): void {
        this.logger.log(
            `[driver-offer.submitted] bookingId=${payload.customBookingId} driverId=${payload.driverId} offerId=${payload.offerId} price=${payload.price}`,
        );
        // TODO: notify tourist of new offer
    }
}

@Injectable()
export class CustomBookingConfirmedListener {
    private readonly logger = new Logger(CustomBookingConfirmedListener.name);

    @OnEvent('custom-booking.confirmed')
    handle(payload: CustomBookingConfirmedEvent): void {
        this.logger.log(
            `[custom-booking.confirmed] bookingId=${payload.customBookingId} driverId=${payload.driverId} vehicleId=${payload.vehicleId}`,
        );
        // TODO: notify driver and tourist
    }
}
