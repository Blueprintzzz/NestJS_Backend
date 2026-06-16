# Sberry - Monolithic REST API

A unified NestJS REST API application combining authentication, user management, and organization management.

## Features

- **JWT Authentication** with Passport
- **User Management** (CRUD operations)
- **Organization Management** (CRUD operations)
- **Repository Pattern** with ORM adapter switching (Prisma/Drizzle)
- **Swagger Documentation** at `/api`
- **PostgreSQL** database on AWS RDS
- **Docker** support

## Tech Stack

- Node.js 24
- NestJS 11
- TypeScript
- Prisma 6.x (default ORM)
- Drizzle ORM (alternative)
- PostgreSQL
- JWT Authentication
- Swagger/OpenAPI
- pnpm

## Prerequisites

- Node.js 24+
- pnpm
- PostgreSQL (AWS RDS configured)

## Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Run migrations (if needed)
pnpm prisma:migrate
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public&sslmode=require"
PORT=3000
ORM_ADAPTER=prisma
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

## Running the Application

```bash
# Development mode
pnpm start:dev

# Production mode
pnpm build
pnpm start:prod
```

## Docker

```bash
# Build image
docker build -t sberry .

# Run container
docker run -p 3000:3000 --env-file .env sberry
```

## API Documentation

Once the application is running, visit:
- Swagger UI: `http://localhost:3000/api`

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/profile` - Get authenticated user profile (requires JWT)

### Users
- `GET /users` - Get all users (requires JWT)
- `GET /users/:id` - Get user by ID (requires JWT)
- `POST /users` - Create user (requires JWT)
- `PATCH /users/:id` - Update user (requires JWT)
- `DELETE /users/:id` - Delete user (requires JWT)

### Organizations
- `GET /organizations` - Get all organizations (requires JWT)
- `GET /organizations/:id` - Get organization by ID (requires JWT)
- `POST /organizations` - Create organization (requires JWT)
- `PATCH /organizations/:id` - Update organization (requires JWT)
- `DELETE /organizations/:id` - Delete organization (requires JWT)

## ORM Adapter Switching

The application supports switching between Prisma and Drizzle ORM at runtime using the `ORM_ADAPTER` environment variable:

```env
# Use Prisma (default)
ORM_ADAPTER=prisma

# Use Drizzle
ORM_ADAPTER=drizzle
```

Note: Drizzle implementation is currently pending. Prisma is fully functional.

## Project Structure

```
sberry/
├── src/
│   ├── modules/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # User management
│   │   ├── organizations/ # Organization management
│   │   ├── roles/         # Roles (placeholder)
│   │   └── permissions/   # Permissions (placeholder)
│   ├── common/            # Shared utilities
│   ├── config/            # Configuration files
│   ├── prisma/            # Prisma service
│   ├── drizzle/           # Drizzle service
│   ├── app.module.ts      # Root module
│   └── main.ts            # Application entry point
├── prisma/
│   └── schema.prisma      # Database schema
├── .env                   # Environment variables
├── Dockerfile             # Docker configuration
└── package.json           # Dependencies
```

## Database Schema

The application uses the following main tables:
- `auth_users` - User accounts with authentication
- `organizations` - Organization entities
- `user_organizations` - Many-to-many relationship between users and organizations

## Development Notes

- All gRPC/microservice code has been removed
- Single REST API application with one package.json
- Repository pattern implemented for easy ORM switching
- JWT authentication required for most endpoints
- Swagger documentation auto-generated from decorators

## License

UNLICENSED
