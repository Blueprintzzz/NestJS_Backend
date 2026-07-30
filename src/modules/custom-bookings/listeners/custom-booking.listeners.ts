import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CustomBookingCreatedEvent } from '../events/custom-booking-created.event';
import { CustomBookingConfirmedEvent } from '../events/custom-booking-confirmed.event';
import { DriverOfferSubmittedEvent } from '../events/driver-offer-submitted.event';
import { VehiclesService } from '../../vehicles/services/vehicles.service';

@Injectable()
export class CustomBookingCreatedListener {
    private readonly logger = new Logger(CustomBookingCreatedListener.name);

    constructor(private readonly vehiclesService: VehiclesService) { }

    @OnEvent('custom-booking.created')
    async handle(payload: CustomBookingCreatedEvent): Promise<void> {
        const id = payload.customBookingId.replace(/[\r\n]/g, '');
        this.logger.log(`[custom-booking.created] id=${id} type=${payload.requestedVehicleType}`);

        // Find available drivers to notify
        const vehicles = await this.vehiclesService.getAvailableForCustomBooking(
            payload.startDate,
            payload.endDate,
            payload.requestedVehicleType,
            payload.requestedModelId ?? undefined,
        );

        for (const v of vehicles) {
            this.logger.log(
                `[NOTIFY DRIVER] driverId=${v.driverId} customBookingId=${id} vehicleId=${v.id} type=${payload.requestedVehicleType}`,
            );
            // TODO: replace with real push notification when notification system is added
        }
    }
}

@Injectable()
export class DriverOfferSubmittedListener {
    private readonly logger = new Logger(DriverOfferSubmittedListener.name);

    @OnEvent('driver-offer.submitted')
    handle(payload: DriverOfferSubmittedEvent): void {
        const bookingId = payload.customBookingId.replace(/[\r\n]/g, '');
        this.logger.log(
            `[driver-offer.submitted] bookingId=${bookingId} driverId=${payload.driverId} offerId=${payload.offerId} price=${payload.price}`,
        );
        // TODO: notify tourist of new offer
    }
}

@Injectable()
export class CustomBookingConfirmedListener {
    private readonly logger = new Logger(CustomBookingConfirmedListener.name);

    @OnEvent('custom-booking.confirmed')
    handle(payload: CustomBookingConfirmedEvent): void {
        const bookingId = payload.customBookingId.replace(/[\r\n]/g, '');
        this.logger.log(
            `[custom-booking.confirmed] bookingId=${bookingId} driverId=${payload.driverId} vehicleId=${payload.vehicleId}`,
        );
        // TODO: notify driver that offer was accepted
        // TODO: notify tourist with confirmation details
    }
}
