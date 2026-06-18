import { Injectable } from '@nestjs/common';
import { VehicleType } from '@prisma/client';
import { DrizzleService } from '../../../../drizzle/drizzle.service';
import { CheckAvailabilityDto, CreateVehicleDto, UpdateVehicleDto, VehicleQueryDto } from '../../dto/vehicle.dto';
import { VehicleAvailabilityEntity, VehicleEntity } from '../../entities/vehicle.entity';
import { IVehicleRepository, Pagination } from '../interfaces/vehicle.repository.interface';

@Injectable()
export class DrizzleVehicleRepository implements IVehicleRepository {
  constructor(private readonly drizzle: DrizzleService) {}
  create(_dto: CreateVehicleDto): Promise<VehicleEntity> { throw new Error('Drizzle not implemented'); }
  findById(_id: string): Promise<VehicleEntity | null> { throw new Error('Drizzle not implemented'); }
  findAll(_query: VehicleQueryDto): Promise<Pagination<VehicleEntity>> { throw new Error('Drizzle not implemented'); }
  findByType(_type: VehicleType, _query: VehicleQueryDto): Promise<Pagination<VehicleEntity>> { throw new Error('Drizzle not implemented'); }
  update(_id: string, _dto: UpdateVehicleDto): Promise<VehicleEntity> { throw new Error('Drizzle not implemented'); }
  delete(_id: string): Promise<boolean> { throw new Error('Drizzle not implemented'); }
  getAvailableVehicles(_startDate: Date, _endDate: Date, _type?: VehicleType, _minCapacity?: number): Promise<VehicleEntity[]> { throw new Error('Drizzle not implemented'); }
  reserveVehicle(_vehicleId: string, _bookingId: string, _startDate: Date, _endDate: Date): Promise<void> { throw new Error('Drizzle not implemented'); }
  releaseVehicle(_bookingId: string): Promise<void> { throw new Error('Drizzle not implemented'); }
  getAvailabilityCalendar(_vehicleId: string, _days: number): Promise<VehicleAvailabilityEntity[]> { throw new Error('Drizzle not implemented'); }
}
