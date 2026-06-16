import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  ormAdapter: process.env.ORM_ADAPTER ?? 'prisma',
  nodeEnv: process.env.NODE_ENV ?? 'development',
}));