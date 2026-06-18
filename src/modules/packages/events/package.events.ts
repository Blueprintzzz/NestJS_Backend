import { TourPackageEntity } from '../entities/package.entity';

export class PackageCreatedEvent {
  constructor(public readonly pkg: TourPackageEntity) {}
}

export class PackageUpdatedEvent {
  constructor(public readonly pkg: TourPackageEntity) {}
}

export class PackageDeletedEvent {
  constructor(public readonly id: string) {}
}
