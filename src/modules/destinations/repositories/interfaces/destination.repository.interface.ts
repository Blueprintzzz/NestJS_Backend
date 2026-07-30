import { CreateDestinationDto, DestinationQueryDto, UpdateDestinationDto } from '../../dto/destination.dto';
import { DestinationEntity } from '../../entities/destination.entity';

export interface Pagination<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface IDestinationRepository {
  create(dto: CreateDestinationDto): Promise<DestinationEntity>;
  findAll(query: DestinationQueryDto): Promise<Pagination<DestinationEntity>>;
  findById(id: string): Promise<DestinationEntity | null>;
  findFeatured(limit: number): Promise<DestinationEntity[]>;
  findByCategory(category: string, page: number, limit: number): Promise<Pagination<DestinationEntity>>;
  update(id: string, dto: UpdateDestinationDto): Promise<DestinationEntity>;
  delete(id: string): Promise<boolean>;
  setFeatured(id: string, featured: boolean): Promise<DestinationEntity>;
  getMapData(): Promise<Pick<DestinationEntity, 'id' | 'name' | 'category' | 'latitude' | 'longitude' | 'featured'>[]>;
}
