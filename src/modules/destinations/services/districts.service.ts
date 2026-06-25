import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateDistrictDto, DistrictQueryDto, UpdateDistrictDto } from '../dto/district.dto';
import { DistrictEntity } from '../entities/district.entity';
import { DistrictCreatedEvent, DistrictUpdatedEvent } from '../events/destination.events';
import { IDistrictRepository, Pagination } from '../repositories/interfaces/district.repository.interface';
import { DISTRICT_REPOSITORY } from '../repositories/repository.provider';

@Injectable()
export class DistrictsService {
  constructor(
    @Inject(DISTRICT_REPOSITORY)
    private readonly repo: IDistrictRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getAllDistricts(query: DistrictQueryDto): Promise<Pagination<DistrictEntity>> {
    return this.repo.findAll(query);
  }

  async getDistrictById(id: string): Promise<DistrictEntity> {
    const district = await this.repo.findById(id);
    if (!district) throw new NotFoundException(`District ${id} not found`);
    return district;
  }

  async getFeaturedDistricts(): Promise<DistrictEntity[]> {
    return this.repo.findFeatured(25);
  }

  async createDistrict(dto: CreateDistrictDto): Promise<DistrictEntity> {
    const district = await this.repo.create(dto);
    this.eventEmitter.emit('destination.district.created', new DistrictCreatedEvent(district));
    return district;
  }

  async updateDistrict(id: string, dto: UpdateDistrictDto): Promise<DistrictEntity> {
    await this.getDistrictById(id);
    const district = await this.repo.update(id, dto);
    this.eventEmitter.emit('destination.district.updated', new DistrictUpdatedEvent(district));
    return district;
  }

  async deleteDistrict(id: string): Promise<boolean> {
    await this.getDistrictById(id);
    return this.repo.delete(id);
  }

  async setFeatured(id: string, featured: boolean): Promise<DistrictEntity> {
    await this.getDistrictById(id);
    return this.repo.setFeatured(id, featured);
  }
}
