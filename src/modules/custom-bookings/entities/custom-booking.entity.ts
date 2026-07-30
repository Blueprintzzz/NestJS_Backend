import { CustomBookingStatus, OfferStatus, VehicleType } from '@prisma/client';

export class DriverOfferEntity {
    id: string;
    customBookingId: string;
    driverId: string;
    driverName?: string;
    vehicleId: string;
    vehicleInfo?: string;
    price: number;
    message?: string | null;
    eta?: string | null;
    status: OfferStatus;
    validUntil: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class CustomBookingEntity {
    id: string;
    bookingNumber: string;
    userId: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    numberOfPeople: number;
    budget?: number | null;
    pickupLocation: string;
    dropoffLocation: string;
    requestedVehicleType: VehicleType;
    requestedModelId?: string | null;
    destinations: string[];
    requirements?: string | null;
    status: CustomBookingStatus;
    selectedOfferId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    offers?: DriverOfferEntity[];
}
