import { ExampleEntity } from '../entities/example.entity';

export class ExampleCreatedEvent {
  constructor(public readonly example: ExampleEntity) {}
}
