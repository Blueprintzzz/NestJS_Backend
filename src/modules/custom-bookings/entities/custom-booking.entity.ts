import { CustomBookingStatus } from '@prisma/client';

export class CustomBookingOfferEntity {
    id: string;
    customBookingId: string;
    driverId: string;
    price: number;
    description: string;
    validUntil: Date;
    isAccepted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class CustomBookingEntity {
    id: string;
    userId: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    numberOfPeople: number;
    budget?: number | null;
    destinations: string[];
    requirements?: string | null;
    status: CustomBookingStatus;
    createdAt: Date;
    updatedAt: Date;
    offers?: CustomBookingOfferEntity[];
}
