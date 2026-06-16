import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../../drizzle/drizzle.service';
import { CreateExampleDto } from '../../dto/create-example.dto';
import { ExampleEntity } from '../../entities/example.entity';
import { IExampleRepository } from '../interfaces/example.repository.interface';

@Injectable()
export class DrizzleExampleRepository implements IExampleRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(_data: CreateExampleDto): Promise<ExampleEntity> {
    // TODO: implement with Drizzle schema
    throw new Error('Not implemented');
  }

  async findAll(): Promise<ExampleEntity[]> {
    // TODO: implement with Drizzle schema
    throw new Error('Not implemented');
  }

  async findById(_id: string): Promise<ExampleEntity | null> {
    // TODO: implement with Drizzle schema
    throw new Error('Not implemented');
  }
}
