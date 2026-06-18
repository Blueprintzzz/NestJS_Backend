import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateDistrictDto, DistrictQueryDto, UpdateDistrictDto } from '../../dto/district.dto';
import { DistrictEntity } from '../../entities/district.entity';
import { IDistrictRepository, Pagination } from '../interfaces/district.repository.interface';

function toNum(v: any): number {
  return typeof v === 'object' && v !== null ? parseFloat(v.toString()) : Number(v);
}

function mapDistrict(raw: any): DistrictEntity {
  return {
    ...raw,
    latitude: toNum(raw.latitude),
    longitude: toNum(raw.longitude),
    attractions: (raw.attractions ?? []).map((a: any) => ({
      ...a,
      latitude: toNum(a.latitude),
      longitude: toNum(a.longitude),
      entryFee: a.entryFee != null ? toNum(a.entryFee) : null,
      images: Array.isArray(a.images) ? a.images : [],
    })),
  };
}

@Injectable()
export class PrismaDistrictRepository implements IDistrictRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDistrictDto): Promise<DistrictEntity> {
    const d = await this.prisma.district.create({ data: dto as any, include: { attractions: false } });
    return mapDistrict({ ...d, attractions: [] });
  }

  async findAll(query: DistrictQueryDto): Promise<Pagination<DistrictEntity>> {
    const where: any = { status: 'ACTIVE' };
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
    const skip = (query.page - 1) * query.limit;
    const [total, rows] = await Promise.all([
      this.prisma.district.count({ where }),
      this.prisma.district.findMany({ where, skip, take: query.limit, orderBy: { name: 'asc' }, include: { attractions: false } }),
    ]);
    return { data: rows.map((r) => mapDistrict({ ...r, attractions: [] })), total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) };
  }

  async findById(id: string): Promise<DistrictEntity | null> {
    const d = await this.prisma.district.findUnique({ where: { id }, include: { attractions: true } });
    return d ? mapDistrict(d) : null;
  }

  async findFeatured(limit: number): Promise<DistrictEntity[]> {
    const rows = await this.prisma.district.findMany({ where: { featured: true, status: 'ACTIVE' }, take: limit, include: { attractions: false } });
    return rows.map((r) => mapDistrict({ ...r, attractions: [] }));
  }

  async update(id: string, dto: UpdateDistrictDto): Promise<DistrictEntity> {
    const d = await this.prisma.district.update({ where: { id }, data: dto as any, include: { attractions: true } });
    return mapDistrict(d);
  }

  async setFeatured(id: string, featured: boolean): Promise<DistrictEntity> {
    const d = await this.prisma.district.update({ where: { id }, data: { featured }, include: { attractions: true } });
    return mapDistrict(d);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.district.delete({ where: { id } });
    return true;
  }
}
