import { PackageQueryDto } from '../../dto/package-query.dto';
import { CreateTourPackageDto, AddItineraryDto, AddInclusionDto } from '../../dto/create-package.dto';
import { UpdateTourPackageDto } from '../../dto/update-package.dto';
import { TourPackageEntity, PackageItineraryEntity, PackageInclusionEntity } from '../../entities/package.entity';
import { PackageCategory } from '@prisma/client';

export interface Pagination<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface IPackageRepository {
  create(dto: CreateTourPackageDto, adminId: string): Promise<TourPackageEntity>;
  findById(id: string): Promise<TourPackageEntity | null>;
  findAll(query: PackageQueryDto): Promise<Pagination<TourPackageEntity>>;
  findByCategory(category: PackageCategory, query: PackageQueryDto): Promise<Pagination<TourPackageEntity>>;
  findFeatured(): Promise<TourPackageEntity[]>;
  update(id: string, dto: UpdateTourPackageDto): Promise<TourPackageEntity>;
  delete(id: string): Promise<boolean>;
  setFeatured(id: string, featured: boolean): Promise<TourPackageEntity>;
  setStatus(id: string, status: string): Promise<TourPackageEntity>;
  addItinerary(packageId: string, dto: AddItineraryDto): Promise<PackageItineraryEntity>;
  updateItinerary(packageId: string, day: number, dto: Partial<AddItineraryDto>): Promise<PackageItineraryEntity>;
  addInclusion(packageId: string, dto: AddInclusionDto): Promise<PackageInclusionEntity>;
}
