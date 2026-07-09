import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../../drizzle/drizzle.service';
import { CreateExperienceDto, ExperienceQueryDto, UpdateExperienceDto } from '../../dto/experience.dto';
import { ExperienceEntity } from '../../entities/experience.entity';
import { IExperienceRepository, Pagination } from '../interfaces/experience.repository.interface';

@Injectable()
export class DrizzleExperienceRepository implements IExperienceRepository {
  constructor(private readonly drizzle: DrizzleService) {}
  create(_dto: CreateExperienceDto): Promise<ExperienceEntity> { throw new Error('Drizzle not implemented'); }
  findAll(_query: ExperienceQueryDto): Promise<Pagination<ExperienceEntity>> { throw new Error('Drizzle not implemented'); }
  findById(_id: string): Promise<ExperienceEntity | null> { throw new Error('Drizzle not implemented'); }
  findFeatured(): Promise<ExperienceEntity[]> { throw new Error('Drizzle not implemented'); }
  update(_id: string, _dto: UpdateExperienceDto): Promise<ExperienceEntity> { throw new Error('Drizzle not implemented'); }
  delete(_id: string): Promise<boolean> { throw new Error('Drizzle not implemented'); }
  setFeatured(_id: string): Promise<ExperienceEntity> { throw new Error('Drizzle not implemented'); }
}
