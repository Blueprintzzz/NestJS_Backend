import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../../drizzle/drizzle.service';
import { AttractionQueryDto, CreateAttractionDto, UpdateAttractionDto } from '../../dto/attraction.dto';
import { AttractionEntity } from '../../entities/attraction.entity';
import { IAttractionRepository, MapPoint, Pagination } from '../interfaces/attraction.repository.interface';

@Injectable()
export class DrizzleAttractionRepository implements IAttractionRepository {
  constructor(private readonly drizzle: DrizzleService) {}
  create(_dto: CreateAttractionDto): Promise<AttractionEntity> { throw new Error('Drizzle not implemented'); }
  findAll(_query: AttractionQueryDto): Promise<Pagination<AttractionEntity>> { throw new Error('Drizzle not implemented'); }
  findById(_id: string): Promise<AttractionEntity | null> { throw new Error('Drizzle not implemented'); }
  findByDistrict(_districtId: string): Promise<AttractionEntity[]> { throw new Error('Drizzle not implemented'); }
  findByCategory(_category: string): Promise<AttractionEntity[]> { throw new Error('Drizzle not implemented'); }
  update(_id: string, _dto: UpdateAttractionDto): Promise<AttractionEntity> { throw new Error('Drizzle not implemented'); }
  delete(_id: string): Promise<boolean> { throw new Error('Drizzle not implemented'); }
  getMapData(): Promise<MapPoint[]> { throw new Error('Drizzle not implemented'); }
}
