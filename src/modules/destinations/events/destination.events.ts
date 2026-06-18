import { AttractionEntity } from '../entities/attraction.entity';
import { DistrictEntity } from '../entities/district.entity';

export class DistrictCreatedEvent {
  constructor(public readonly district: DistrictEntity) {}
}

export class DistrictUpdatedEvent {
  constructor(public readonly district: DistrictEntity) {}
}

export class AttractionCreatedEvent {
  constructor(public readonly attraction: AttractionEntity) {}
}

export class AttractionUpdatedEvent {
  constructor(public readonly attraction: AttractionEntity) {}
}
