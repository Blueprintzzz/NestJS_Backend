import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/category.dto';
import { CategoryEntity } from '../entities/category.entity';
import { ICategoryRepository } from '../repositories/interfaces/category.repository.interface';
import { CATEGORY_REPOSITORY } from '../repositories/repository.provider';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly repo: ICategoryRepository,
  ) {}

  async getAllCategories(): Promise<CategoryEntity[]> {
    return this.repo.findAll();
  }

  async getCategoryByName(name: string): Promise<CategoryEntity> {
    const category = await this.repo.findByName(name);
    if (!category) throw new NotFoundException(`Category ${name} not found`);
    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryEntity> {
    return this.repo.create(dto);
  }

  async getCategoriesList(): Promise<CategoryEntity[]> {
    return this.repo.findAll();
  }
}
