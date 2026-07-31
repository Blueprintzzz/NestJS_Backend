import { Injectable } from '@nestjs/common';
import { PackageCategory } from '@prisma/client';
import { DrizzleService } from '../../../../drizzle/drizzle.service';
import { AddInclusionDto, AddItineraryDto, CreateTourPackageDto } from '../../dto/create-package.dto';
import { PackageQueryDto } from '../../dto/package-query.dto';
import { UpdateTourPackageDto } from '../../dto/update-package.dto';
import { PackageInclusionEntity, PackageItineraryEntity, TourPackageEntity } from '../../entities/package.entity';
import { IPackageRepository, Pagination } from '../interfaces/package.repository.interface';

@Injectable()
export class DrizzlePackageRepository implements IPackageRepository {
  constructor(private readonly drizzle: DrizzleService) {}
  create(_dto: CreateTourPackageDto, _adminId: string): Promise<TourPackageEntity> { throw new Error('Drizzle not implemented'); }
  findById(_id: string): Promise<TourPackageEntity | null> { throw new Error('Drizzle not implemented'); }
  findAll(_query: PackageQueryDto): Promise<Pagination<TourPackageEntity>> { throw new Error('Drizzle not implemented'); }
  findByCategory(_category: PackageCategory, _query: PackageQueryDto): Promise<Pagination<TourPackageEntity>> { throw new Error('Drizzle not implemented'); }
  findFeatured(): Promise<TourPackageEntity[]> { throw new Error('Drizzle not implemented'); }
  update(_id: string, _dto: UpdateTourPackageDto): Promise<TourPackageEntity> { throw new Error('Drizzle not implemented'); }
  delete(_id: string): Promise<boolean> { throw new Error('Drizzle not implemented'); }
  setFeatured(_id: string, _featured: boolean): Promise<TourPackageEntity> { throw new Error('Drizzle not implemented'); }
  setStatus(_id: string, _status: string): Promise<TourPackageEntity> { throw new Error('Drizzle not implemented'); }
  addItinerary(_packageId: string, _dto: AddItineraryDto): Promise<PackageItineraryEntity> { throw new Error('Drizzle not implemented'); }
  updateItinerary(_packageId: string, _day: number, _dto: Partial<AddItineraryDto>): Promise<PackageItineraryEntity> { throw new Error('Drizzle not implemented'); }
  addInclusion(_packageId: string, _dto: AddInclusionDto): Promise<PackageInclusionEntity> { throw new Error('Drizzle not implemented'); }
  findByAdminId(_adminId: string, _query: PackageQueryDto): Promise<Pagination<TourPackageEntity>> { throw new Error('Drizzle not implemented'); }
}
