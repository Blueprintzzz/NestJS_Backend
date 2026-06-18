import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PackageCategory } from '@prisma/client';
import { AddInclusionDto, AddItineraryDto, CreateTourPackageDto } from '../dto/create-package.dto';
import { PackageQueryDto } from '../dto/package-query.dto';
import { UpdateTourPackageDto } from '../dto/update-package.dto';
import { PackageCreatedEvent, PackageDeletedEvent, PackageUpdatedEvent } from '../events/package.events';
import { IPackageRepository, Pagination } from '../repositories/interfaces/package.repository.interface';
import { PACKAGE_REPOSITORY } from '../repositories/repository.provider';
import { PackageInclusionEntity, PackageItineraryEntity, TourPackageEntity } from '../entities/package.entity';

@Injectable()
export class PackagesService {
  constructor(
    @Inject(PACKAGE_REPOSITORY) private readonly repo: IPackageRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createPackage(dto: CreateTourPackageDto, adminId: string): Promise<TourPackageEntity> {
    if (dto.basePrice <= 0) throw new BadRequestException('Price must be greater than 0');
    if (dto.duration < 1) throw new BadRequestException('Duration must be at least 1 day');
    if (dto.maxCapacity < 1) throw new BadRequestException('Capacity must be at least 1');
    const pkg = await this.repo.create(dto, adminId);
    this.eventEmitter.emit('package.created', new PackageCreatedEvent(pkg));
    return pkg;
  }

  async getPackageById(id: string): Promise<TourPackageEntity> {
    const pkg = await this.repo.findById(id);
    if (!pkg) throw new NotFoundException(`Package ${id} not found`);
    return pkg;
  }

  async getAllPackages(query: PackageQueryDto): Promise<Pagination<TourPackageEntity>> {
    return this.repo.findAll(query);
  }

  async getPackagesByCategory(category: PackageCategory, query: PackageQueryDto): Promise<Pagination<TourPackageEntity>> {
    return this.repo.findByCategory(category, query);
  }

  async getFeaturedPackages(): Promise<TourPackageEntity[]> {
    return this.repo.findFeatured();
  }

  async updatePackage(id: string, dto: UpdateTourPackageDto): Promise<TourPackageEntity> {
    await this.getPackageById(id);
    if (dto.basePrice !== undefined && dto.basePrice <= 0) throw new BadRequestException('Price must be greater than 0');
    const pkg = await this.repo.update(id, dto);
    this.eventEmitter.emit('package.updated', new PackageUpdatedEvent(pkg));
    return pkg;
  }

  async deletePackage(id: string): Promise<boolean> {
    await this.getPackageById(id);
    await this.repo.delete(id);
    this.eventEmitter.emit('package.deleted', new PackageDeletedEvent(id));
    return true;
  }

  async markFeatured(id: string): Promise<TourPackageEntity> {
    await this.getPackageById(id);
    return this.repo.setFeatured(id, true);
  }

  async deactivatePackage(id: string): Promise<TourPackageEntity> {
    await this.getPackageById(id);
    return this.repo.setStatus(id, 'INACTIVE');
  }

  async addItinerary(packageId: string, dto: AddItineraryDto): Promise<PackageItineraryEntity> {
    await this.getPackageById(packageId);
    return this.repo.addItinerary(packageId, dto);
  }

  async updateItinerary(packageId: string, day: number, dto: Partial<AddItineraryDto>): Promise<PackageItineraryEntity> {
    await this.getPackageById(packageId);
    return this.repo.updateItinerary(packageId, day, dto);
  }

  async addInclusion(packageId: string, dto: AddInclusionDto): Promise<PackageInclusionEntity> {
    await this.getPackageById(packageId);
    return this.repo.addInclusion(packageId, dto);
  }

  async calculateEstimatedCost(packageId: string, vehiclePricePerDay: number, numDays: number): Promise<number> {
    const pkg = await this.getPackageById(packageId);
    return pkg.basePrice + vehiclePricePerDay * numDays;
  }
}
