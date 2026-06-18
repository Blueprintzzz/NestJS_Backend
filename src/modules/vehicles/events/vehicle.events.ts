import { VehicleEntity } from '../entities/vehicle.entity';

export class VehicleReservedEvent {
  constructor(public readonly vehicleId: string, public readonly bookingId: string) {}
}

export class VehicleReleasedEvent {
  constructor(public readonly bookingId: string) {}
}
