export class DriverOfferSubmittedEvent {
    constructor(
        public readonly customBookingId: string,
        public readonly driverId: string,
        public readonly offerId: string,
        public readonly price: number,
    ) { }
}
