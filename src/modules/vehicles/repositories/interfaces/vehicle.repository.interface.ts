import {
  CheckAvailabilityDto,
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleQueryDto,
} from '../../dto/vehicle.dto';
import { VehicleAvailabilityEntity, VehicleEntity } from '../../entities/vehicle.entity';
import { VehicleType } from '@prisma/client';

export interface Pagination<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface IVehicleRepository {
  create(dto: CreateVehicleDto, driverId: string): Promise<VehicleEntity>;
  findById(id: string): Promise<VehicleEntity | null>;
  findAll(query: VehicleQueryDto): Promise<Pagination<VehicleEntity>>;
  findByType(type: VehicleType, query: VehicleQueryDto): Promise<Pagination<VehicleEntity>>;
  findByDriverId(driverId: string): Promise<VehicleEntity[]>;
  update(id: string, dto: UpdateVehicleDto): Promise<VehicleEntity>;
  delete(id: string): Promise<boolean>;
  getAvailableVehicles(
    startDate: Date,
    endDate: Date,
    type?: VehicleType,
    minCapacity?: number,
    modelId?: string,
  ): Promise<VehicleEntity[]>;
  reserveVehicle(vehicleId: string, bookingId: string, startDate: Date, endDate: Date): Promise<void>;
  releaseVehicle(bookingId: string): Promise<void>;
  getAvailabilityCalendar(vehicleId: string, days: number): Promise<VehicleAvailabilityEntity[]>;
}
