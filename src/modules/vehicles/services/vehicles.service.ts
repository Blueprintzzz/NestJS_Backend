import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VehicleType } from '@prisma/client';
import { CheckAvailabilityDto, CreateVehicleDto, UpdateVehicleDto, VehicleQueryDto } from '../dto/vehicle.dto';
import { VehicleEntity } from '../entities/vehicle.entity';
import { VehicleReleasedEvent, VehicleReservedEvent } from '../events/vehicle.events';
import { IVehicleRepository, Pagination } from '../repositories/interfaces/vehicle.repository.interface';
import { VEHICLE_REPOSITORY } from '../repositories/repository.provider';

@Injectable()
export class VehiclesService {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly repo: IVehicleRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createVehicle(dto: CreateVehicleDto): Promise<VehicleEntity> {
    return this.repo.create(dto);
  }

  async getAllVehicles(query: VehicleQueryDto): Promise<Pagination<VehicleEntity>> {
    return this.repo.findAll(query);
  }

  async getVehicleById(id: string): Promise<VehicleEntity> {
    const vehicle = await this.repo.findById(id);
    if (!vehicle) throw new NotFoundException(`Vehicle ${id} not found`);
    return vehicle;
  }

  async updateVehicle(id: string, dto: UpdateVehicleDto): Promise<VehicleEntity> {
    await this.getVehicleById(id);
    return this.repo.update(id, dto);
  }

  async deleteVehicle(id: string): Promise<boolean> {
    await this.getVehicleById(id);
    return this.repo.delete(id);
  }

  async checkAvailability(dto: CheckAvailabilityDto): Promise<VehicleEntity[]> {
    return this.repo.getAvailableVehicles(
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.vehicleType,
    );
  }

  async getAvailabilityCalendar(id: string) {
    await this.getVehicleById(id);
    return this.repo.getAvailabilityCalendar(id, 30);
  }

  async reserveVehicle(vehicleId: string, bookingId: string, startDate: string, endDate: string): Promise<void> {
    await this.getVehicleById(vehicleId);
    await this.repo.reserveVehicle(vehicleId, bookingId, new Date(startDate), new Date(endDate));
    this.eventEmitter.emit('vehicle.reserved', new VehicleReservedEvent(vehicleId, bookingId));
  }

  async getVehiclesByType(type: VehicleType, query: VehicleQueryDto): Promise<Pagination<VehicleEntity>> {
    return this.repo.findByType(type, query);
  }

  async getRecommendations(numberOfTravelers: number, budget: number, tripDays: number): Promise<VehicleEntity[]> {
    const maxPrice = budget / tripDays;
    const all = await this.repo.getAvailableVehicles(
      new Date(),
      new Date(Date.now() + tripDays * 86400000),
    );
    return all
      .filter((v) => v.capacity >= numberOfTravelers && v.pricePerDay <= maxPrice)
      .slice(0, 5);
  }
}
