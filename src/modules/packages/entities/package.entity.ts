import { InclusionType, PackageCategory, ResourceStatus } from '@prisma/client';

export class PackageItineraryEntity {
  id: string;
  packageId: string;
  day: number;
  title: string;
  description: string;
  attractions: string;
  airportPickup: boolean;
  airportDropoff: boolean;
}

export class PackageInclusionEntity {
  id: string;
  packageId: string;
  inclusion: string;
  type: InclusionType;
}

export class TourPackageEntity {
  id: string;
  name: string;
  description: string;
  category: PackageCategory;
  duration: number;
  basePrice: number;
  highlights: string[];
  bestSeason: string;
  maxCapacity: number;
  images: string[];
  status: ResourceStatus;
  featured: boolean;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
  itineraries?: PackageItineraryEntity[];
  inclusions?: PackageInclusionEntity[];
}
