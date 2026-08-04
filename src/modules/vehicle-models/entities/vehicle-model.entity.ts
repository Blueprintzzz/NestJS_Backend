import { VehicleType } from '@prisma/client';

export class VehicleModelEntity {
    id: string;
    name: string;
    type: VehicleType;
    icon?: string | null;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
