import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateDestinationDto, DestinationQueryDto, UpdateDestinationDto } from '../../dto/destination.dto';
import { DestinationEntity } from '../../entities/destination.entity';
import { IDestinationRepository, Pagination } from '../interfaces/destination.repository.interface';

function toNum(v: any): number {
  return typeof v === 'object' && v !== null ? parseFloat(v.toString()) : Number(v);
}

function mapDestination(raw: any): DestinationEntity {
  return {
    ...raw,
    latitude: toNum(raw.latitude),
    longitude: toNum(raw.longitude),
    entryFee: raw.entryFee != null ? toNum(raw.entryFee) : null,
    images: Array.isArray(raw.images) ? raw.images : [],
  };
}

@Injectable()
export class PrismaDestinationRepository implements IDestinationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDestinationDto): Promise<DestinationEntity> {
    const d = await this.prisma.destination.create({ data: dto as any });
    return mapDestination(d);
  }

  async findAll(query: DestinationQueryDto): Promise<Pagination<DestinationEntity>> {
    const where: any = { status: 'ACTIVE' };
    if (query.category) where.category = query.category;
    if (query.district) where.district = { contains: query.district, mode: 'insensitive' };
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
    if (query.featured !== undefined) where.featured = query.featured;
    const skip = (query.page - 1) * query.limit;
    const [total, rows] = await Promise.all([
      this.prisma.destination.count({ where }),
      this.prisma.destination.findMany({ where, skip, take: query.limit, orderBy: { name: 'asc' } }),
    ]);
    return { data: rows.map(mapDestination), total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) };
  }

  async findById(id: string): Promise<DestinationEntity | null> {
    const d = await this.prisma.destination.findUnique({ where: { id } });
    return d ? mapDestination(d) : null;
  }

  async findFeatured(limit: number): Promise<DestinationEntity[]> {
    const rows = await this.prisma.destination.findMany({
      where: { featured: true, status: 'ACTIVE' },
      take: limit,
      orderBy: { name: 'asc' },
    });
    return rows.map(mapDestination);
  }

  async findByCategory(category: string, page: number, limit: number): Promise<Pagination<DestinationEntity>> {
    const where = { category: category as any, status: 'ACTIVE' };
    const skip = (page - 1) * limit;
    const [total, rows] = await Promise.all([
      this.prisma.destination.count({ where }),
      this.prisma.destination.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
    ]);
    return { data: rows.map(mapDestination), total, page, limit, pages: Math.ceil(total / limit) };
  }

  async update(id: string, dto: UpdateDestinationDto): Promise<DestinationEntity> {
    const d = await this.prisma.destination.update({ where: { id }, data: dto as any });
    return mapDestination(d);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.destination.delete({ where: { id } });
    return true;
  }

  async setFeatured(id: string, featured: boolean): Promise<DestinationEntity> {
    const d = await this.prisma.destination.update({ where: { id }, data: { featured } });
    return mapDestination(d);
  }

  async getMapData() {
    const rows = await this.prisma.destination.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, category: true, latitude: true, longitude: true, featured: true },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category as string,
      latitude: toNum(r.latitude),
      longitude: toNum(r.longitude),
      featured: r.featured,
    }));
  }
}
