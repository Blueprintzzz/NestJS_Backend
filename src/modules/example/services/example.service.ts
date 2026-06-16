import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateExampleDto } from '../dto/create-example.dto';
import { ExampleEntity } from '../entities/example.entity';
import { ExampleCreatedEvent } from '../events/example-created.event';
import { IExampleRepository } from '../repositories/interfaces/example.repository.interface';
import { EXAMPLE_REPOSITORY } from '../repositories/repository.provider';

@Injectable()
export class ExampleService {
  constructor(
    @Inject(EXAMPLE_REPOSITORY)
    private readonly exampleRepository: IExampleRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(data: CreateExampleDto): Promise<ExampleEntity> {
    const result = await this.exampleRepository.create(data);
    this.eventEmitter.emit('example.created', new ExampleCreatedEvent(result));
    return result;
  }

  findAll(): Promise<ExampleEntity[]> {
    return this.exampleRepository.findAll();
  }
}
