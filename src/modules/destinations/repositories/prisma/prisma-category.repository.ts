import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCategoryDto } from '../../dto/category.dto';
import { CategoryEntity } from '../../entities/category.entity';
import { ICategoryRepository } from '../interfaces/category.repository.interface';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    return this.prisma.tourCategory.create({ data: dto as any }) as any;
  }

  async findAll(): Promise<CategoryEntity[]> {
    return this.prisma.tourCategory.findMany({ orderBy: { name: 'asc' } }) as any;
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    return this.prisma.tourCategory.findFirst({ where: { name: name as any } }) as any;
  }

  async getFeatured(): Promise<CategoryEntity[]> {
    return this.prisma.tourCategory.findMany({ where: { featured: true } }) as any;
  }
}
