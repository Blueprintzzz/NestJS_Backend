# NestJS Skeleton

A production-ready NestJS starter that demonstrates three architectural patterns working together:

- **ORM Adapter Pattern** — swap Prisma ↔ Drizzle at runtime via env var
- **Repository Pattern** — interface-first data access; services never touch ORM classes directly
- **Event-Driven Pattern** — `@nestjs/event-emitter` wired for internal domain events

---

## Quick Start

```bash
cp .env.example .env        # fill in DATABASE_URL
pnpm install
pnpm prisma:generate
pnpm start:dev
```

Swagger UI: `http://localhost:3000/api`


## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd 
pnpm install
```

### 2. Configure Environment
The `.env` file is already configured with your AWS RDS connection:
```env
DATABASE_URL="postgresql://master:Sberry%232026@sberry-dev-db.cy9ooyg60e74.us-east-1.rds.amazonaws.com:5432/postgres?schema=public&sslmode=require"
PORT=3000
ORM_ADAPTER=prisma
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

### 3. Generate Prisma Client
```bash
pnpm prisma:generate
```

### 4. Run Database Migrations (if needed)
```bash
pnpm prisma:migrate
```

### 5. Start Development Server
```bash
pnpm start:dev
```
---



## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Runtime environment |
| `ORM_ADAPTER` | `prisma` | `prisma` or `drizzle` |
| `DATABASE_URL` | — | PostgreSQL connection string |

---

## ORM Adapter Pattern

The adapter is chosen at startup by reading `ORM_ADAPTER` from the environment.
No code changes are needed to switch ORMs — only the env var.

### How it works

Each module has a repository factory in `repositories/repository.provider.ts`:

```typescript
export const exampleRepositoryProvider: Provider = {
  provide: EXAMPLE_REPOSITORY,
  inject: [ConfigService, PrismaService, DrizzleService],
  useFactory: (config, prisma, drizzle) => {
    return config.get('app.ormAdapter') === 'drizzle'
      ? new DrizzleExampleRepository(drizzle)
      : new PrismaExampleRepository(prisma);
  },
};
```

The service injects the **token**, never the class:

```typescript
constructor(
  @Inject(EXAMPLE_REPOSITORY)
  private readonly repo: IExampleRepository,
) {}
```

Switch ORM:

```env
ORM_ADAPTER=drizzle   # or prisma
```

---

## Event-Driven Pattern

`EventEmitterModule` is registered globally in `AppModule` with `delimiter: '.'`.
Event names follow the `domain.verb` convention.

### Emitting an event (inside a service)

```typescript
this.eventEmitter.emit('example.created', new ExampleCreatedEvent(result));
```

### Handling an event (inside a listener)

```typescript
@Injectable()
export class ExampleCreatedListener {
  @OnEvent('example.created')
  handleExampleCreated(payload: ExampleCreatedEvent): void {
    // side-effects: send email, write audit log, trigger another event
  }
}
```

Register the listener as a provider in the module — no additional wiring needed.

**Rule:** Listeners must not import another module's service to trigger side effects.
Use the repository directly, or emit a further event.

---

## Adding a New Module

Follow these steps to scaffold a new domain module (e.g. `products`):

### 1. Create the folder structure

```
src/modules/products/
  controllers/products.controller.ts
  dto/create-product.dto.ts
  entities/product.entity.ts
  events/product-created.event.ts
  listeners/product-created.listener.ts
  repositories/
    interfaces/product.repository.interface.ts
    prisma/prisma-product.repository.ts
    drizzle/drizzle-product.repository.ts
    repository.provider.ts
  services/products.service.ts
  products.module.ts
```

### 2. Define the interface

```typescript
// repositories/interfaces/product.repository.interface.ts
export interface IProductRepository {
  create(data: CreateProductDto): Promise<ProductEntity>;
  findAll(): Promise<ProductEntity[]>;
  findById(id: string): Promise<ProductEntity | null>;
}
```

### 3. Implement for Prisma (and stub for Drizzle)

```typescript
// repositories/prisma/prisma-product.repository.ts
@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateProductDto) { return this.prisma.product.create({ data }); }
  async findAll() { return this.prisma.product.findMany(); }
  async findById(id: string) { return this.prisma.product.findUnique({ where: { id } }); }
}
```

### 4. Wire the factory

```typescript
// repositories/repository.provider.ts
export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';

export const productRepositoryProvider: Provider = {
  provide: PRODUCT_REPOSITORY,
  inject: [ConfigService, PrismaService, DrizzleService],
  useFactory: (config, prisma, drizzle) =>
    config.get('app.ormAdapter') === 'drizzle'
      ? new DrizzleProductRepository(drizzle)
      : new PrismaProductRepository(prisma),
};
```

### 5. Add the Prisma model

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Run `pnpm prisma:migrate` to apply.

### 6. Register in AppModule

```typescript
// app.module.ts
import { ProductsModule } from './modules/products/products.module';

@Module({ imports: [..., ProductsModule] })
export class AppModule {}
```

---

## Project Structure

```
src/
  config/
    app.config.ts          ← typed config (port, ormAdapter, nodeEnv)
  common/
    guards/                ← shared guards
    filters/               ← shared exception filters
    interceptors/          ← shared interceptors
    decorators/            ← shared decorators
  drizzle/
    drizzle.service.ts     ← Drizzle connection (stub, ready to use)
  prisma/
    prisma.service.ts      ← Prisma + pg.Pool + SSL lifecycle
  modules/
    example/               ← full pattern demonstration
  app.module.ts
  main.ts
prisma/
  schema.prisma            ← add your models here
.env.example
```

---

## Planned Infrastructure (in package.json, not yet wired)

These packages are installed and ready to wire when needed:

| Package | Use case |
|---|---|
| `@nestjs/bull` + `bullmq` | Background job queues |
| `socket.io` + `@nestjs/websockets` | Real-time WebSocket support |
| `connect-redis` + `ioredis` + `express-session` | Redis-backed sessions |
| `@nestjs/cqrs` | CQRS command/query separation |

---

## Database Schema Conventions

- Primary keys: `String @id @default(uuid())`
- Timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Soft deletes where needed: `deletedAt DateTime?`
- Status enums: `ACTIVE | INACTIVE | SUSPENDED`
