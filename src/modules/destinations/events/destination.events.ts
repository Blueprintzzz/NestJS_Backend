import { DestinationEntity } from '../entities/destination.entity';

export class DestinationCreatedEvent {
  constructor(public readonly destination: DestinationEntity) {}
}

export class DestinationUpdatedEvent {
  constructor(public readonly destination: DestinationEntity) {}
}
