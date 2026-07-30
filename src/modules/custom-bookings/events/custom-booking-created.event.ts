import { VehicleType } from '@prisma/client';

export class CustomBookingCreatedEvent {
    constructor(
        public readonly customBookingId: string,
        public readonly requestedVehicleType: VehicleType,
        public readonly requestedModelId: string | null | undefined,
        public readonly startDate: Date,
        public readonly endDate: Date,
        public readonly numberOfPeople: number,
        public readonly pickupLocation: string,
        public readonly dropoffLocation: string,
    ) { }
}
