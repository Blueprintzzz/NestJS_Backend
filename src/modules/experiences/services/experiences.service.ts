import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateExperienceDto, ExperienceQueryDto, UpdateExperienceDto } from '../dto/experience.dto';
import { ExperienceEntity } from '../entities/experience.entity';
import { ExperienceCreatedEvent, ExperienceUpdatedEvent } from '../events/experience.events';
import { IExperienceRepository, Pagination } from '../repositories/interfaces/experience.repository.interface';
import { EXPERIENCE_REPOSITORY } from '../repositories/repository.provider';

@Injectable()
export class ExperiencesService {
  constructor(
    @Inject(EXPERIENCE_REPOSITORY)
    private readonly repo: IExperienceRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getAll(query: ExperienceQueryDto): Promise<Pagination<ExperienceEntity>> {
    return this.repo.findAll(query);
  }

  async getFeatured(): Promise<ExperienceEntity[]> {
    return this.repo.findFeatured();
  }

  async getById(id: string): Promise<ExperienceEntity> {
    const experience = await this.repo.findById(id);
    if (!experience) throw new NotFoundException(`Experience ${id} not found`);
    return experience;
  }

  async create(dto: CreateExperienceDto): Promise<ExperienceEntity> {
    const experience = await this.repo.create(dto);
    this.eventEmitter.emit('experience.created', new ExperienceCreatedEvent(experience));
    return experience;
  }

  async update(id: string, dto: UpdateExperienceDto): Promise<ExperienceEntity> {
    await this.getById(id);
    const experience = await this.repo.update(id, dto);
    this.eventEmitter.emit('experience.updated', new ExperienceUpdatedEvent(experience));
    return experience;
  }

  async delete(id: string): Promise<boolean> {
    await this.getById(id);
    return this.repo.delete(id);
  }

  async setFeatured(id: string): Promise<ExperienceEntity> {
    await this.getById(id);
    return this.repo.setFeatured(id);
  }
}
