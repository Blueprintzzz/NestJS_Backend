import { ExperienceEntity } from '../entities/experience.entity';

export class ExperienceCreatedEvent {
  constructor(public readonly experience: ExperienceEntity) {}
}

export class ExperienceUpdatedEvent {
  constructor(public readonly experience: ExperienceEntity) {}
}
