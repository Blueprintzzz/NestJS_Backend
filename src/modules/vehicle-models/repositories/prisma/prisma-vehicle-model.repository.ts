import { Injectable } from '@nestjs/common';
import { VehicleType } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateVehicleModelDto, UpdateVehicleModelDto } from '../../dto/vehicle-model.dto';
import { VehicleModelEntity } from '../../entities/vehicle-model.entity';
import { IVehicleModelRepository } from '../interfaces/vehicle-model.repository.interface';

function mapModel(raw: any): VehicleModelEntity {
    return {
        id: raw.id,
        name: raw.name,
        type: raw.type,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
    };
}

@Injectable()
export class PrismaVehicleModelRepository implements IVehicleModelRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateVehicleModelDto): Promise<VehicleModelEntity> {
        const model = await this.prisma.vehicleModel.create({ data: dto });
        return mapModel(model);
    }

    async findAll(type?: VehicleType): Promise<VehicleModelEntity[]> {
        const where = type ? { type } : {};
        const models = await this.prisma.vehicleModel.findMany({
            where,
            orderBy: [{ type: 'asc' }, { name: 'asc' }],
        });
        return models.map(mapModel);
    }

    async findByType(type: VehicleType): Promise<VehicleModelEntity[]> {
        const models = await this.prisma.vehicleModel.findMany({
            where: { type },
            orderBy: { name: 'asc' },
        });
        return models.map(mapModel);
    }

    async findById(id: string): Promise<VehicleModelEntity | null> {
        const model = await this.prisma.vehicleModel.findUnique({ where: { id } });
        return model ? mapModel(model) : null;
    }

    async update(id: string, dto: UpdateVehicleModelDto): Promise<VehicleModelEntity> {
        const model = await this.prisma.vehicleModel.update({ where: { id }, data: dto });
        return mapModel(model);
    }

    async delete(id: string): Promise<boolean> {
        await this.prisma.vehicleModel.delete({ where: { id } });
        return true;
    }
}
