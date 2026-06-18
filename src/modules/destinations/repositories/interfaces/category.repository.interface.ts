import { CreateCategoryDto } from '../../dto/category.dto';
import { CategoryEntity } from '../../entities/category.entity';

export interface ICategoryRepository {
  create(dto: CreateCategoryDto): Promise<CategoryEntity>;
  findAll(): Promise<CategoryEntity[]>;
  findByName(name: string): Promise<CategoryEntity | null>;
  getFeatured(): Promise<CategoryEntity[]>;
}
