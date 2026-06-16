import { CreateExampleDto } from '../../dto/create-example.dto';
import { ExampleEntity } from '../../entities/example.entity';

export interface IExampleRepository {
  create(data: CreateExampleDto): Promise<ExampleEntity>;
  findAll(): Promise<ExampleEntity[]>;
  findById(id: string): Promise<ExampleEntity | null>;
}
