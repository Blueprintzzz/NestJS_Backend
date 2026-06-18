import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { VehicleReleasedEvent, VehicleReservedEvent } from '../events/vehicle.events';

@Injectable()
export class VehicleReservedListener {
  @OnEvent('vehicle.reserved')
  handle(payload: VehicleReservedEvent): void {
    console.log(`[vehicle.reserved] vehicleId=${payload.vehicleId} bookingId=${payload.bookingId}`);
  }
}

@Injectable()
export class VehicleReleasedListener {
  @OnEvent('vehicle.released')
  handle(payload: VehicleReleasedEvent): void {
    console.log(`[vehicle.released] bookingId=${payload.bookingId}`);
  }
}
