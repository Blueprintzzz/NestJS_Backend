import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AttractionQueryDto, CreateAttractionDto, UpdateAttractionDto } from '../../dto/attraction.dto';
import { AttractionEntity } from '../../entities/attraction.entity';
import { IAttractionRepository, MapPoint, Pagination } from '../interfaces/attraction.repository.interface';

function toNum(v: any): number {
  return typeof v === 'object' && v !== null ? parseFloat(v.toString()) : Number(v);
}

function mapAttraction(raw: any): AttractionEntity {
  return {
    ...raw,
    latitude: toNum(raw.latitude),
    longitude: toNum(raw.longitude),
    entryFee: raw.entryFee != null ? toNum(raw.entryFee) : null,
    images: Array.isArray(raw.images) ? raw.images : [],
  };
}

@Injectable()
export class PrismaAttractionRepository implements IAttractionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttractionDto): Promise<AttractionEntity> {
    const a = await this.prisma.attraction.create({ data: dto as any });
    return mapAttraction(a);
  }

  async findAll(query: AttractionQueryDto): Promise<Pagination<AttractionEntity>> {
    const where: any = {};
    if (query.districtId) where.districtId = query.districtId;
    if (query.category) where.category = query.category;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
    const skip = (query.page - 1) * query.limit;
    const [total, rows] = await Promise.all([
      this.prisma.attraction.count({ where }),
      this.prisma.attraction.findMany({ where, skip, take: query.limit, orderBy: { name: 'asc' } }),
    ]);
    return { data: rows.map(mapAttraction), total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) };
  }

  async findById(id: string): Promise<AttractionEntity | null> {
    const a = await this.prisma.attraction.findUnique({ where: { id } });
    return a ? mapAttraction(a) : null;
  }

  async findByDistrict(districtId: string): Promise<AttractionEntity[]> {
    const rows = await this.prisma.attraction.findMany({ where: { districtId }, orderBy: { name: 'asc' } });
    return rows.map(mapAttraction);
  }

  async findByCategory(category: string): Promise<AttractionEntity[]> {
    const rows = await this.prisma.attraction.findMany({ where: { category: category as any }, orderBy: { name: 'asc' } });
    return rows.map(mapAttraction);
  }

  async update(id: string, dto: UpdateAttractionDto): Promise<AttractionEntity> {
    const a = await this.prisma.attraction.update({ where: { id }, data: dto as any });
    return mapAttraction(a);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.attraction.delete({ where: { id } });
    return true;
  }

  async getMapData(): Promise<MapPoint[]> {
    const rows = await this.prisma.attraction.findMany({ select: { id: true, name: true, latitude: true, longitude: true, districtId: true, category: true } });
    return rows.map((r) => ({ id: r.id, name: r.name, latitude: toNum(r.latitude), longitude: toNum(r.longitude), districtId: r.districtId, category: r.category }));
  }
}
