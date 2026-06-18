import { Injectable } from '@nestjs/common';
import { PackageCategory, ResourceStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AddInclusionDto, AddItineraryDto, CreateTourPackageDto } from '../../dto/create-package.dto';
import { PackageQueryDto } from '../../dto/package-query.dto';
import { UpdateTourPackageDto } from '../../dto/update-package.dto';
import { PackageInclusionEntity, PackageItineraryEntity, TourPackageEntity } from '../../entities/package.entity';
import { IPackageRepository, Pagination } from '../interfaces/package.repository.interface';

function toNum(v: any): number {
  return typeof v === 'object' && v !== null ? parseFloat(v.toString()) : Number(v);
}

function mapPkg(raw: any): TourPackageEntity {
  return {
    ...raw,
    basePrice: toNum(raw.basePrice),
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
    images: Array.isArray(raw.images) ? raw.images : [],
    itineraries: raw.itineraries ?? [],
    inclusions: raw.inclusions ?? [],
  };
}

@Injectable()
export class PrismaPackageRepository implements IPackageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTourPackageDto, adminId: string): Promise<TourPackageEntity> {
    const pkg = await this.prisma.tourPackage.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        duration: dto.duration,
        basePrice: dto.basePrice,
        highlights: dto.highlights,
        bestSeason: dto.bestSeason,
        maxCapacity: dto.maxCapacity,
        images: dto.images,
        adminId,
      },
      include: { itineraries: true, inclusions: true },
    });
    return mapPkg(pkg);
  }

  async findById(id: string): Promise<TourPackageEntity | null> {
    const pkg = await this.prisma.tourPackage.findUnique({
      where: { id },
      include: { itineraries: { orderBy: { day: 'asc' } }, inclusions: true },
    });
    return pkg ? mapPkg(pkg) : null;
  }

  async findAll(query: PackageQueryDto): Promise<Pagination<TourPackageEntity>> {
    return this.paginate(this.buildWhere(query), query);
  }

  async findByCategory(category: PackageCategory, query: PackageQueryDto): Promise<Pagination<TourPackageEntity>> {
    return this.paginate({ ...this.buildWhere(query), category }, query);
  }

  async findFeatured(): Promise<TourPackageEntity[]> {
    const pkgs = await this.prisma.tourPackage.findMany({
      where: { featured: true, status: ResourceStatus.ACTIVE },
      take: 6,
      include: { itineraries: false, inclusions: false },
    });
    return pkgs.map(mapPkg);
  }

  async update(id: string, dto: UpdateTourPackageDto): Promise<TourPackageEntity> {
    const pkg = await this.prisma.tourPackage.update({
      where: { id },
      data: dto as any,
      include: { itineraries: { orderBy: { day: 'asc' } }, inclusions: true },
    });
    return mapPkg(pkg);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.tourPackage.delete({ where: { id } });
    return true;
  }

  async setFeatured(id: string, featured: boolean): Promise<TourPackageEntity> {
    const pkg = await this.prisma.tourPackage.update({
      where: { id },
      data: { featured },
      include: { itineraries: true, inclusions: true },
    });
    return mapPkg(pkg);
  }

  async setStatus(id: string, status: string): Promise<TourPackageEntity> {
    const pkg = await this.prisma.tourPackage.update({
      where: { id },
      data: { status: status as ResourceStatus },
      include: { itineraries: true, inclusions: true },
    });
    return mapPkg(pkg);
  }

  async addItinerary(packageId: string, dto: AddItineraryDto): Promise<PackageItineraryEntity> {
    return this.prisma.packageItinerary.create({ data: { packageId, ...dto } });
  }

  async updateItinerary(packageId: string, day: number, dto: Partial<AddItineraryDto>): Promise<PackageItineraryEntity> {
    return this.prisma.packageItinerary.update({
      where: { packageId_day: { packageId, day } },
      data: dto,
    });
  }

  async addInclusion(packageId: string, dto: AddInclusionDto): Promise<PackageInclusionEntity> {
    return this.prisma.packageInclusion.create({ data: { packageId, ...dto } } as any);
  }

  private buildWhere(query: PackageQueryDto): any {
    const where: any = { status: ResourceStatus.ACTIVE };
    if (query.category) where.category = query.category;
    if (query.minPrice || query.maxPrice) {
      where.basePrice = {};
      if (query.minPrice) where.basePrice.gte = query.minPrice;
      if (query.maxPrice) where.basePrice.lte = query.maxPrice;
    }
    if (query.minDuration || query.maxDuration) {
      where.duration = {};
      if (query.minDuration) where.duration.gte = query.minDuration;
      if (query.maxDuration) where.duration.lte = query.maxDuration;
    }
    return where;
  }

  private async paginate(where: any, query: PackageQueryDto): Promise<Pagination<TourPackageEntity>> {
    const skip = (query.page - 1) * query.limit;
    const [total, rows] = await Promise.all([
      this.prisma.tourPackage.count({ where }),
      this.prisma.tourPackage.findMany({
        where, skip, take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: { itineraries: false, inclusions: false },
      }),
    ]);
    return { data: rows.map(mapPkg), total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) };
  }
}
