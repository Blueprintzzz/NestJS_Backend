import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../../drizzle/drizzle.service';
import { CreateCategoryDto } from '../../dto/category.dto';
import { CategoryEntity } from '../../entities/category.entity';
import { ICategoryRepository } from '../interfaces/category.repository.interface';

@Injectable()
export class DrizzleCategoryRepository implements ICategoryRepository {
  constructor(private readonly drizzle: DrizzleService) {}
  create(_dto: CreateCategoryDto): Promise<CategoryEntity> { throw new Error('Drizzle not implemented'); }
  findAll(): Promise<CategoryEntity[]> { throw new Error('Drizzle not implemented'); }
  findByName(_name: string): Promise<CategoryEntity | null> { throw new Error('Drizzle not implemented'); }
  getFeatured(): Promise<CategoryEntity[]> { throw new Error('Drizzle not implemented'); }
}
