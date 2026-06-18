import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      throw new Error('DATABASE_URL must be a valid postgresql:// connection string');
    }
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: true },
    });
    super({ adapter: new PrismaPg(pool) });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
