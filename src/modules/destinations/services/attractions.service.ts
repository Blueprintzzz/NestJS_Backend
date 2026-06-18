import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AttractionQueryDto, CreateAttractionDto, UpdateAttractionDto } from '../dto/attraction.dto';
import { AttractionEntity } from '../entities/attraction.entity';
import { AttractionCreatedEvent, AttractionUpdatedEvent } from '../events/destination.events';
import { IAttractionRepository, MapPoint, Pagination } from '../repositories/interfaces/attraction.repository.interface';
import { ATTRACTION_REPOSITORY } from '../repositories/repository.provider';

@Injectable()
export class AttractionsService {
  constructor(
    @Inject(ATTRACTION_REPOSITORY)
    private readonly repo: IAttractionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getAllAttractions(query: AttractionQueryDto): Promise<Pagination<AttractionEntity>> {
    return this.repo.findAll(query);
  }

  async getAttractionById(id: string): Promise<AttractionEntity> {
    const attraction = await this.repo.findById(id);
    if (!attraction) throw new NotFoundException(`Attraction ${id} not found`);
    return attraction;
  }

  async getAttractionsByDistrict(districtId: string): Promise<AttractionEntity[]> {
    return this.repo.findByDistrict(districtId);
  }

  async getAttractionsByCategory(category: string): Promise<AttractionEntity[]> {
    return this.repo.findByCategory(category);
  }

  async createAttraction(dto: CreateAttractionDto): Promise<AttractionEntity> {
    const attraction = await this.repo.create(dto);
    this.eventEmitter.emit('destination.attraction.created', new AttractionCreatedEvent(attraction));
    return attraction;
  }

  async updateAttraction(id: string, dto: UpdateAttractionDto): Promise<AttractionEntity> {
    await this.getAttractionById(id);
    const attraction = await this.repo.update(id, dto);
    this.eventEmitter.emit('destination.attraction.updated', new AttractionUpdatedEvent(attraction));
    return attraction;
  }

  async deleteAttraction(id: string): Promise<boolean> {
    await this.getAttractionById(id);
    return this.repo.delete(id);
  }

  async getMapData(): Promise<MapPoint[]> {
    return this.repo.getMapData();
  }
}
