import { AttractionQueryDto, CreateAttractionDto, UpdateAttractionDto } from '../../dto/attraction.dto';
import { AttractionEntity } from '../../entities/attraction.entity';

export interface Pagination<T> { data: T[]; total: number; page: number; limit: number; pages: number; }

export interface MapPoint { id: string; name: string; latitude: number; longitude: number; districtId?: string; category?: string; }

export interface IAttractionRepository {
  create(dto: CreateAttractionDto): Promise<AttractionEntity>;
  findAll(query: AttractionQueryDto): Promise<Pagination<AttractionEntity>>;
  findById(id: string): Promise<AttractionEntity | null>;
  findByDistrict(districtId: string): Promise<AttractionEntity[]>;
  findByCategory(category: string): Promise<AttractionEntity[]>;
  update(id: string, dto: UpdateAttractionDto): Promise<AttractionEntity>;
  delete(id: string): Promise<boolean>;
  getMapData(): Promise<MapPoint[]>;
}
