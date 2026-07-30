import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DestinationCreatedEvent, DestinationUpdatedEvent } from '../events/destination.events';

@Injectable()
export class DestinationListener {
  @OnEvent('destination.created')
  onCreated(payload: DestinationCreatedEvent): void {
    console.log(`[destination.created] id=${payload.destination.id} name=${payload.destination.name}`);
  }

  @OnEvent('destination.updated')
  onUpdated(payload: DestinationUpdatedEvent): void {
    console.log(`[destination.updated] id=${payload.destination.id}`);
  }
}
