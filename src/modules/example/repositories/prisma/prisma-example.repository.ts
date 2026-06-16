import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateExampleDto } from '../../dto/create-example.dto';
import { ExampleEntity } from '../../entities/example.entity';
import { IExampleRepository } from '../interfaces/example.repository.interface';

@Injectable()
export class PrismaExampleRepository implements IExampleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateExampleDto): Promise<ExampleEntity> {
    // TODO: replace with real Prisma call once schema is finalised
    // return this.prisma.example.create({ data });
    return { id: 'todo', ...data, createdAt: new Date() };
  }

  async findAll(): Promise<ExampleEntity[]> {
    // TODO: return this.prisma.example.findMany();
    return [];
  }

  async findById(id: string): Promise<ExampleEntity | null> {
    // TODO: return this.prisma.example.findUnique({ where: { id } });
    return null;
  }
}
