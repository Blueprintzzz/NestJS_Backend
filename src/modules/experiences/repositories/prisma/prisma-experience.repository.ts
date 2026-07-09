import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateExperienceDto, ExperienceQueryDto, UpdateExperienceDto } from '../../dto/experience.dto';
import { ExperienceEntity } from '../../entities/experience.entity';
import { IExperienceRepository, Pagination } from '../interfaces/experience.repository.interface';

function toNum(v: any): number {
  return typeof v === 'object' && v !== null ? parseFloat(v.toString()) : Number(v);
}

function mapExperience(raw: any): ExperienceEntity {
  return {
    ...raw,
    price: toNum(raw.price),
    rating: raw.rating != null ? toNum(raw.rating) : null,
    images: Array.isArray(raw.images) ? raw.images : [],
  };
}

@Injectable()
export class PrismaExperienceRepository implements IExperienceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExperienceDto): Promise<ExperienceEntity> {
    const e = await this.prisma.experience.create({ data: { ...dto, images: dto.images ?? [] } as any });
    return mapExperience(e);
  }

  async findAll(query: ExperienceQueryDto): Promise<Pagination<ExperienceEntity>> {
    const where: any = { status: 'ACTIVE' };
    if (query.category) where.category = query.category;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
    const skip = (query.page - 1) * query.limit;
    const [total, rows] = await Promise.all([
      this.prisma.experience.count({ where }),
      this.prisma.experience.findMany({ where, skip, take: query.limit, orderBy: { createdAt: 'desc' } }),
    ]);
    return { data: rows.map(mapExperience), total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) };
  }

  async findById(id: string): Promise<ExperienceEntity | null> {
    const e = await this.prisma.experience.findUnique({ where: { id } });
    return e ? mapExperience(e) : null;
  }

  async findFeatured(): Promise<ExperienceEntity[]> {
    const rows = await this.prisma.experience.findMany({
      where: { featured: true, status: 'ACTIVE' },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapExperience);
  }

  async update(id: string, dto: UpdateExperienceDto): Promise<ExperienceEntity> {
    const e = await this.prisma.experience.update({ where: { id }, data: dto as any });
    return mapExperience(e);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.experience.delete({ where: { id } });
    return true;
  }

  async setFeatured(id: string): Promise<ExperienceEntity> {
    const e = await this.prisma.experience.update({ where: { id }, data: { featured: true } });
    return mapExperience(e);
  }
}
