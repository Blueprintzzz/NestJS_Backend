import { VehicleType } from '@prisma/client';

export class VehicleModelEntity {
    id: string;
    name: string;
    type: VehicleType;
    createdAt: Date;
    updatedAt: Date;
}
