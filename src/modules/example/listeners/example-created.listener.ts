import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ExampleCreatedEvent } from '../events/example-created.event';

@Injectable()
export class ExampleCreatedListener {
  @OnEvent('example.created')
  handleExampleCreated(payload: ExampleCreatedEvent): void {
    // TODO: replace with real side-effects (emails, audit log, etc.)
    console.log('Handling example.created', payload.example.id);
  }
}
