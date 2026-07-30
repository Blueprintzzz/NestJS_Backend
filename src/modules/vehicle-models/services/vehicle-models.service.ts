import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { VehicleType } from '@prisma/client';
import { CreateVehicleModelDto, UpdateVehicleModelDto, VehicleModelQueryDto } from '../dto/vehicle-model.dto';
import { VehicleModelEntity } from '../entities/vehicle-model.entity';
import { IVehicleModelRepository } from '../repositories/interfaces/vehicle-model.repository.interface';
import { VEHICLE_MODEL_REPOSITORY } from '../repositories/repository.provider';

@Injectable()
export class VehicleModelsService {
    constructor(
        @Inject(VEHICLE_MODEL_REPOSITORY)
        private readonly repo: IVehicleModelRepository,
    ) { }

    async getAll(query: VehicleModelQueryDto): Promise<VehicleModelEntity[]> {
        return this.repo.findAll(query.type);
    }

    async getByType(type: VehicleType): Promise<VehicleModelEntity[]> {
        return this.repo.findByType(type);
    }

    async getById(id: string): Promise<VehicleModelEntity> {
        const model = await this.repo.findById(id);
        if (!model) throw new NotFoundException(`VehicleModel ${id} not found`);
        return model;
    }

    async create(dto: CreateVehicleModelDto): Promise<VehicleModelEntity> {
        return this.repo.create(dto);
    }

    async update(id: string, dto: UpdateVehicleModelDto): Promise<VehicleModelEntity> {
        await this.getById(id);
        return this.repo.update(id, dto);
    }

    async delete(id: string): Promise<boolean> {
        await this.getById(id);
        return this.repo.delete(id);
    }
}
