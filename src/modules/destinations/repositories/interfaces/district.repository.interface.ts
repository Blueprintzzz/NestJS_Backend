import { CreateDistrictDto, DistrictQueryDto, UpdateDistrictDto } from '../../dto/district.dto';
import { DistrictEntity } from '../../entities/district.entity';

export interface Pagination<T> { data: T[]; total: number; page: number; limit: number; pages: number; }

export interface IDistrictRepository {
  create(dto: CreateDistrictDto): Promise<DistrictEntity>;
  findAll(query: DistrictQueryDto): Promise<Pagination<DistrictEntity>>;
  findById(id: string): Promise<DistrictEntity | null>;
  findFeatured(limit: number): Promise<DistrictEntity[]>;
  update(id: string, dto: UpdateDistrictDto): Promise<DistrictEntity>;
  setFeatured(id: string, featured: boolean): Promise<DistrictEntity>;
  delete(id: string): Promise<boolean>;
}
