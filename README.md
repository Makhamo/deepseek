<div align="center">

# Unified Healthcare Platform

**One web app, nine services, one shared backbone.**
A multi-tenant clinical platform for hospitals and clinics.

`TypeScript 5.9` · `Next.js 15` · `React 19` · `Express 5` · `PostgreSQL 16`
`Drizzle` · `RabbitMQ` · `Redis` · `Zod` · `Turborepo` · `Vitest`

</div>

> **Status: foundation.** Every workspace is initialised, wired and tested.
> Clinical and financial behaviour is not implemented yet — the build order is in
> [`docs/architecture.md`](docs/architecture.md).

## Quick start

Requires **Node 22+**, **npm 11** and **Docker** with Compose v2.

```bash
npm install
cp .env.example .env
npm run infra:up     # Postgres 16, Redis 7, RabbitMQ 3.13
npm run dev          # every workspace, in watch mode
```

| Surface  | URL                          |
| -------- | ---------------------------- |
| Web app  | http://localhost:3000        |
| Services | http://localhost:4001 – 4009 |

Run a single workspace:

```bash
cp services/doctor/.env.example services/doctor/.env
npm run db:migrate --workspace @uhs/doctor
npm run dev --workspace @uhs/doctor
```

### Run everything in Docker

A local Compose stack builds every workspace from source, runs the migrations
and starts the app:

```bash
npm run stack:up     # docker compose -f infra/docker-compose.local.yml up --build -d
npm run stack:logs   # follow the logs
npm run stack:down   # stop, keeping the volumes
```

| Surface  | URL                                                 |
| -------- | --------------------------------------------------- |
| Web app  | http://localhost:3000                               |
| Services | http://localhost:4001 – 4009                        |
| RabbitMQ | http://localhost:15673 (`uhs` / `uhs`)              |
| Postgres | `localhost:5433` (roles from `infra/postgres/init`) |
| Redis    | `localhost:6380`                                    |

If port 3000 is already taken, publish the web app elsewhere:
`APP_ORIGIN=http://localhost:3010 WEB_HOST_PORT=3010 npm run stack:up`.

This stack runs production builds, so there is no hot reload — use `npm run dev`
while developing. Its infrastructure ports differ from `npm run infra:up` and
its volumes belong to the `uhs-local` Compose project, so the two can run side by
side without sharing data. Migrations are one-shot services that run before the
services they belong to; reset a broken bootstrap with
`docker compose -f infra/docker-compose.local.yml down -v`.

## Stack

| Layer     | Choice                                                        |
| --------- | ------------------------------------------------------------- |
| Language  | TypeScript 5.9, strict, ESM with NodeNext resolution          |
| Frontend  | Next.js 15 App Router, React 19, Tailwind 3.4, TanStack Query |
| Services  | Express 5, Zod 4, Pino logging, OpenTelemetry tracing         |
| Data      | PostgreSQL 16 with Drizzle ORM and row-level tenancy          |
| Messaging | RabbitMQ 3.13 (outbox → relay → inbox), Redis 7, Socket.IO    |
| Auth      | Better Auth, JWT verified against JWKS, permission guards     |
| Tooling   | npm workspaces, Turborepo 2, Vitest 3, ESLint 9               |

## Workspaces

| Workspace                | Port | Purpose                                          | Database       |
| ------------------------ | ---- | ------------------------------------------------ | -------------- |
| `apps/web`               | 3000 | Next.js app and BFF                              | —              |
| `services/auth`          | 4001 | Accounts, sessions, organisations, JWKS          | `uhs_auth`     |
| `services/core`          | 4002 | Tenancy, registry, reference data, ledger, audit | `uhs_core`     |
| `services/doctor`        | 4003 | Encounters, appointments, claimable services     | `uhs_doctor`   |
| `services/triage`        | 4004 | Triage assessments                               | `uhs_triage`   |
| `services/lab`           | 4005 | Orders, specimens, results, reports              | `uhs_lab`      |
| `services/nicu`          | 4006 | Admissions, neonatal orders, billing             | `uhs_nicu`     |
| `services/pharmacy`      | 4007 | Prescriptions, dispensing, delivery              | `uhs_pharmacy` |
| `services/claims`        | 4008 | Claims, adjudication, remittance                 | `uhs_claims`   |
| `services/notifications` | 4009 | Socket.IO fan-out                                | — (Redis)      |

Shared packages: `@uhs/contracts` (schemas, permissions, events),
`@uhs/service-kit` (config, tenancy, outbox, auth, HTTP), `@uhs/ui` (tokens,
components), `@uhs/config` (TypeScript, ESLint, Prettier).

## Commands

| Command                                          | Does                                    |
| ------------------------------------------------ | --------------------------------------- |
| `npm run dev`                                    | All workspaces in watch mode            |
| `npm run dev:web`                                | Web app only                            |
| `npm run build`                                  | Build everything                        |
| `npm run typecheck`                              | TypeScript across the repo              |
| `npm run lint`                                   | ESLint, including dependency boundaries |
| `npm test`                                       | Vitest suites                           |
| `npm run infra:up` / `npm run infra:down`        | Local infrastructure                    |
| `npm run db:generate --workspace @uhs/<service>` | Migration from the schema               |
| `npm run db:migrate --workspace @uhs/<service>`  | Apply migrations                        |

## Deployment

Staging and production are separate Docker Compose stacks on one VPS — production
on port 3000, staging on port 3100 — defined in
[`infra/deploy/docker-compose.yml`](infra/deploy/docker-compose.yml).

CI/CD is not in the repository yet. See [`docs/deployment.md`](docs/deployment.md)
for the VPS layout and secrets the deployment will need.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — structure, request flow, events, tenancy, build order
- [`docs/deployment.md`](docs/deployment.md) — environments, VPS setup, migrations
- [`docs/runbooks/`](docs/runbooks) — broker outage, dead-letter replay, held events

## Rules

- A service depends only on `@uhs/contracts` and `@uhs/service-kit`, never on another service. A web app never imports service code. ESLint fails the build on either.
- Tenancy comes from the verified token or the event envelope — never from a request body — and every query runs through `withTenant`.
- Events are written in the outbox in the same transaction as the change; consumers are idempotent through the inbox.
- Errors are Problem Details, money is a decimal string, identifiers are UUIDv7.
