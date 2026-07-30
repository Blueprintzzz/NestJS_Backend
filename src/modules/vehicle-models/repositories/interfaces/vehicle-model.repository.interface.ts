import { VehicleType } from '@prisma/client';
import { CreateVehicleModelDto, UpdateVehicleModelDto } from '../../dto/vehicle-model.dto';
import { VehicleModelEntity } from '../../entities/vehicle-model.entity';

export interface IVehicleModelRepository {
    create(dto: CreateVehicleModelDto): Promise<VehicleModelEntity>;
    findAll(type?: VehicleType): Promise<VehicleModelEntity[]>;
    findByType(type: VehicleType): Promise<VehicleModelEntity[]>;
    findById(id: string): Promise<VehicleModelEntity | null>;
    update(id: string, dto: UpdateVehicleModelDto): Promise<VehicleModelEntity>;
    delete(id: string): Promise<boolean>;
}
