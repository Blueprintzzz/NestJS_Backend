import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateDestinationDto, DestinationCategory, DestinationQueryDto, UpdateDestinationDto } from '../dto/destination.dto';
import { DestinationCreatedEvent, DestinationUpdatedEvent } from '../events/destination.events';
import { IDestinationRepository } from '../repositories/interfaces/destination.repository.interface';
import { DESTINATION_REPOSITORY } from '../repositories/repository.provider';

@Injectable()
export class DestinationsService {
  constructor(
    @Inject(DESTINATION_REPOSITORY)
    private readonly repo: IDestinationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  getAll(query: DestinationQueryDto) {
    return this.repo.findAll(query);
  }

  getFeatured() {
    return this.repo.findFeatured(6);
  }

  getByCategory(category: DestinationCategory, page: number, limit: number) {
    return this.repo.findByCategory(category, page, limit);
  }

  async getById(id: string) {
    const dest = await this.repo.findById(id);
    if (!dest) throw new NotFoundException(`Destination ${id} not found`);
    return dest;
  }

  async create(dto: CreateDestinationDto) {
    const dest = await this.repo.create(dto);
    this.eventEmitter.emit('destination.created', new DestinationCreatedEvent(dest));
    return dest;
  }

  async update(id: string, dto: UpdateDestinationDto) {
    await this.getById(id);
    const dest = await this.repo.update(id, dto);
    this.eventEmitter.emit('destination.updated', new DestinationUpdatedEvent(dest));
    return dest;
  }

  async delete(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
    return { deleted: true };
  }

  async setFeatured(id: string, featured: boolean) {
    await this.getById(id);
    return this.repo.setFeatured(id, featured);
  }

  getMapData() {
    return this.repo.getMapData();
  }
}
