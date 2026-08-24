<p align="center">
  <a href="https://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="140" alt="NestJS logo" />
  </a>
</p>

<h1 align="center">NestJS Clean Architecture</h1>

<p align="center">
  A user management REST API built with NestJS, Clean Architecture, Prisma,
  PostgreSQL, JWT authentication, and automated tests.
</p>

## Clean Architecture

```mermaid
flowchart LR
    Client([HTTP client])

    subgraph Infrastructure[Infrastructure]
        HTTP[Controllers, DTOs, presenters]
        Auth[JWT and bcrypt adapters]
        Database[Prisma and PostgreSQL]
    end

    subgraph Application[Application]
        UseCases[Use cases]
        Ports[Provider contracts]
    end

    subgraph Domain[Domain]
        Entities[Entities and business rules]
        Repositories[Repository contracts]
        Rules[Validators and domain errors]
    end

    Client --> HTTP
    HTTP --> UseCases
    UseCases --> Entities
    UseCases --> Repositories
    UseCases --> Rules
    UseCases --> Ports
    Database -. implements .-> Repositories
    Auth -. implements .-> Ports
```

Dependencies point inward: infrastructure coordinates frameworks and adapters,
application code implements use cases, and the domain contains the core rules
without depending on NestJS or Prisma.

## Features

- User registration, login, search, update, password change, and removal
- JWT authentication for protected endpoints
- Password hashing with bcrypt
- PostgreSQL persistence through Prisma
- Request validation and centralized exception filters
- Response serialization and pagination presenters
- OpenAPI documentation with Swagger
- Unit, integration, and end-to-end test suites
- GitHub Actions workflow for unit tests

## Tech stack

| Area              | Technology                            |
| ----------------- | ------------------------------------- |
| Runtime           | Node.js 20+ and TypeScript            |
| Framework         | NestJS 11 with Fastify                |
| Database          | PostgreSQL 18 and Prisma 7            |
| Authentication    | JWT and bcrypt                        |
| Validation        | class-validator and class-transformer |
| API documentation | Swagger / OpenAPI                     |
| Testing           | Jest and Supertest                    |

## Project structure

```text
src/
├── auth/
│   └── infrastructure/       # JWT service, guard, and Nest module
├── users/
│   ├── domain/               # Entities, validators, and repository contracts
│   ├── application/          # Use cases and output DTOs
│   └── infrastructure/       # HTTP, persistence, presenters, and providers
├── shared/
│   ├── domain/               # Shared entities, errors, and repositories
│   ├── application/          # Shared contracts and DTOs
│   └── infrastructure/       # Prisma, configuration, filters, and interceptors
├── app.module.ts
├── global-config.ts
└── main.ts
```

## Prerequisites

- Node.js 20 or newer
- npm
- Docker with Docker Compose

## Getting started

Install the dependencies:

```bash
npm ci
```

Start PostgreSQL:

```bash
docker compose up -d db
```

Create `.env.development` in the project root:

```dotenv
PORT=3000
NODE_ENV=development
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRES_IN=86400
DATABASE_URL=postgresql://postgres:docker@localhost:5432/projectdb
```

Generate the Prisma Client and apply the migrations:

```bash
npx dotenv-cli -e .env.development -- prisma generate
npx dotenv-cli -e .env.development -- prisma migrate deploy
```

Start the application in watch mode:

```bash
npm run start:dev
```

The API is available at `http://localhost:3000` and the Swagger UI at
`http://localhost:3000/reference`.

## API endpoints

| Method   | Endpoint              | Authentication | Description                              |
| -------- | --------------------- | -------------- | ---------------------------------------- |
| `POST`   | `/users`              | Public         | Register a user                          |
| `POST`   | `/users/login`        | Public         | Authenticate and receive an access token |
| `GET`    | `/users`              | Bearer token   | Search and paginate users                |
| `GET`    | `/users/:id`          | Bearer token   | Get a user by ID                         |
| `PUT`    | `/users/:id`          | Bearer token   | Update a user's name                     |
| `PATCH`  | `/users/:id/password` | Bearer token   | Change a user's password                 |
| `DELETE` | `/users/:id`          | Bearer token   | Remove a user                            |

Send the access token returned by `/users/login` in protected requests:

```http
Authorization: Bearer <access-token>
```

The search endpoint accepts `page`, `perPage`, `sort`, `sortDir`, and `filter`
as optional query parameters. Supported sort fields are `name` and
`createdAt`; `sortDir` accepts `asc` or `desc`.

## Testing

Integration and end-to-end tests require `.env.test` with a dedicated test
database. Do not point tests at a development or production database because
the suites clear persisted users during setup.

| Command             | Purpose                           |
| ------------------- | --------------------------------- |
| `npm run test:unit` | Run unit tests                    |
| `npm run test:int`  | Run integration tests             |
| `npm run test:e2e`  | Run end-to-end tests              |
| `npm run test:cov`  | Generate the Jest coverage report |
| `npm run lint`      | Run ESLint and apply safe fixes   |
| `npm run build`     | Build the application             |

The unit-test workflow runs on every push with Node.js 24, installs dependencies
with `npm ci`, generates the Prisma Client, and executes `npm run test:unit`.

## Production build

```bash
npm run build
npm run start:prod
```

Production uses the variables from `.env` and starts the compiled entry point
at `dist/src/main`.
