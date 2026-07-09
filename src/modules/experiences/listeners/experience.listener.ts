import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ExperienceCreatedEvent, ExperienceUpdatedEvent } from '../events/experience.events';

@Injectable()
export class ExperienceListener {
  @OnEvent('experience.created')
  onExperienceCreated(payload: ExperienceCreatedEvent): void {
    console.log(`[experience.created] id=${payload.experience.id} name=${payload.experience.name}`);
  }

  @OnEvent('experience.updated')
  onExperienceUpdated(payload: ExperienceUpdatedEvent): void {
    console.log(`[experience.updated] id=${payload.experience.id}`);
  }
}
