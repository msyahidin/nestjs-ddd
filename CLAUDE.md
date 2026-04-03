# CLAUDE.md

## Project Overview

NestJS v10 microservice boilerplate implementing **Domain-Driven Design (DDD)** with **CQRS** and **Event Sourcing**. TypeScript-first, production-ready with GraphQL, REST, Swagger, and comprehensive observability.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 10 |
| Language | TypeScript 5 |
| Database | MySQL via TypeORM 0.3 (Data Mapper) |
| Cache | Redis (cache-manager-redis-store) |
| API | REST + GraphQL (Apollo Federation) |
| Docs | Swagger/OpenAPI (@nestjs/swagger) |
| CQRS | @nestjs/cqrs |
| Event Store | nestjs-eventstore (custom fork) |
| Logging | Winston + Google Cloud Logging |
| Monitoring | NewRelic |
| Testing | Jest 29 + Supertest |

## Architecture

DDD layered structure per module:

```
Presentation  →  controllers/, graphql/
Application   →  commands/, queries/ (handlers/)
Domain        →  entities/, events/, sagas/
Infrastructure →  repository/, shared/services/
```

## Project Structure

```
src/
├── modules/          # Feature modules (DDD domains)
│   └── users/        # Example: commands/, queries/, events/, sagas/, entities/, dtos/, repository/
├── shared/           # Shared infrastructure services
│   └── services/     # ConfigService, LoggerService, CacheService, AwsS3Service
├── common/           # Base classes (abstract.entity.ts, common DTOs)
├── filters/          # Global exception filters (HTTP, RPC, i18n)
├── interceptors/     # Global interceptors (logging, NewRelic, response)
├── providers/        # App-level providers (event-bus)
├── migrations/       # TypeORM migrations
└── main.ts           # Bootstrap
```

## Development Commands

```bash
# Start
npm run start:dev        # Watch mode
npm run start:debug      # Debug mode

# Build
npm run build            # Compile TypeScript

# Code quality
npm run lint             # ESLint
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier

# Testing
npm run test             # Unit tests
npm run test:watch       # Unit tests (watch)
npm run test:cov         # Coverage report
npm run test:e2e         # End-to-end tests

# Database
npm run migration:generate  # Auto-generate from entity changes
npm run migration:run       # Apply pending migrations
npm run migration:revert    # Revert last migration
npm run schema:drop         # Truncate database (not drop)

# Git / Release
npm run commit           # Commitizen (conventional commits)
npm run release          # Semantic release
```

## Code Conventions

- **DB naming**: SnakeNamingStrategy — TypeORM maps camelCase fields to snake_case columns automatically
- **Commits**: Conventional Commits enforced via commitlint + Commitizen (`npm run commit`)
- **Formatting**: Prettier + ESLint (TypeScript + import-order rules)
- **Module aliases**: `@/`, `@modules/`, `@shared/`, `@common/` (configured in tsconfig paths + Jest)
- **Validation**: class-validator + class-transformer on all DTOs; global ValidationPipe with `whitelist: true, transform: true`
- **Versioning**: Semantic Release with automated CHANGELOG from commits

## Environment

Copy `.env.example` to `.env`. Key variables:

```
PORT=4000
TRANSPORT_PORT=5000

MYSQL_HOST / MYSQL_PORT / MYSQL_USERNAME / MYSQL_PASSWORD / MYSQL_DATABASE

EVENT_STORE_HOSTNAME / EVENT_STORE_TCP_PORT / EVENT_STORE_HTTP_PORT
EVENT_STORE_CREDENTIALS_USERNAME / EVENT_STORE_CREDENTIALS_PASSWORD

AWS_S3_ACCESS_KEY_ID / AWS_S3_SECRET_ACCESS_KEY / S3_BUCKET_NAME
```

## Testing

- **Unit tests**: `src/**/*.spec.ts` — Jest with ts-jest
- **E2E tests**: `test/app.e2e-spec.ts` — Supertest
- **HTTP mocking**: nock
- **Coverage**: `npm run test:cov` outputs to `coverage/`

## Adding a New Module

Follow the `src/modules/users/` structure:

```
modules/<domain>/
├── <domain>.module.ts
├── controllers/
├── services/
├── entities/        # TypeORM entity (extends AbstractEntity)
├── dtos/
├── repository/      # Extends Repository<Entity>
├── commands/
│   ├── impl/        # Command classes
│   └── handlers/    # @CommandHandler implementations
├── queries/
│   ├── impl/
│   └── handlers/    # @QueryHandler implementations
├── events/
│   └── handlers/    # @EventsHandler implementations
├── sagas/           # @Saga for long-running processes
└── graphql/         # GraphQL resolvers (optional)
```

Register the module in `app.module.ts`.
