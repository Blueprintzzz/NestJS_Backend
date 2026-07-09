import { CreateExperienceDto, ExperienceQueryDto, UpdateExperienceDto } from '../../dto/experience.dto';
import { ExperienceEntity } from '../../entities/experience.entity';

export interface Pagination<T> { data: T[]; total: number; page: number; limit: number; pages: number; }

export interface IExperienceRepository {
  create(dto: CreateExperienceDto): Promise<ExperienceEntity>;
  findAll(query: ExperienceQueryDto): Promise<Pagination<ExperienceEntity>>;
  findById(id: string): Promise<ExperienceEntity | null>;
  findFeatured(): Promise<ExperienceEntity[]>;
  update(id: string, dto: UpdateExperienceDto): Promise<ExperienceEntity>;
  delete(id: string): Promise<boolean>;
  setFeatured(id: string): Promise<ExperienceEntity>;
}
