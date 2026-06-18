import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../../drizzle/drizzle.service';
import { CreateDistrictDto, DistrictQueryDto, UpdateDistrictDto } from '../../dto/district.dto';
import { DistrictEntity } from '../../entities/district.entity';
import { IDistrictRepository, Pagination } from '../interfaces/district.repository.interface';

@Injectable()
export class DrizzleDistrictRepository implements IDistrictRepository {
  constructor(private readonly drizzle: DrizzleService) {}
  create(_dto: CreateDistrictDto): Promise<DistrictEntity> { throw new Error('Drizzle not implemented'); }
  findAll(_query: DistrictQueryDto): Promise<Pagination<DistrictEntity>> { throw new Error('Drizzle not implemented'); }
  findById(_id: string): Promise<DistrictEntity | null> { throw new Error('Drizzle not implemented'); }
  findFeatured(_limit: number): Promise<DistrictEntity[]> { throw new Error('Drizzle not implemented'); }
  update(_id: string, _dto: UpdateDistrictDto): Promise<DistrictEntity> { throw new Error('Drizzle not implemented'); }
  setFeatured(_id: string, _featured: boolean): Promise<DistrictEntity> { throw new Error('Drizzle not implemented'); }
  delete(_id: string): Promise<boolean> { throw new Error('Drizzle not implemented'); }
}
