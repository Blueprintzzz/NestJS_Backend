export class CustomBookingConfirmedEvent {
    constructor(
        public readonly customBookingId: string,
        public readonly driverId: string,
        public readonly vehicleId: string,
        public readonly price: number,
    ) { }
}
