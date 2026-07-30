import { ResourceStatus, VehicleType } from '@prisma/client';

export class VehicleAvailabilityEntity {
  id: string;
  vehicleId: string;
  date: Date;
  isAvailable: boolean;
  bookedByBookingId?: string | null;
}

export class VehicleEntity {
  id: string;
  driverId: string;
  vehicleModelId: string;
  vehicleModelName?: string;
  type: VehicleType;
  capacity: number;
  pricePerDay: number;
  images: string[];
  features: string[];
  status: ResourceStatus;
  description?: string | null;
  registrationNumber: string;
  createdAt: Date;
  updatedAt: Date;
  availability?: VehicleAvailabilityEntity[];
}
