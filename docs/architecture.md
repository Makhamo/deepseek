# Architecture

This repository implements the structure of the Unified Healthcare Platform
technical specification. It is the foundation step of the build order (§19):
the shared backbone exists once, and each product increment fills in modules.

## Shape

```
apps/web                  Next.js App Router application and backend-for-frontend
services/<name>           Express 5 service with its own Postgres database
packages/contracts        Zod schemas shared by every boundary
packages/service-kit      Backbone: config, db, outbox, inbox, bus, auth, http
packages/ui               Theme tokens, Tailwind preset, base components
packages/config           TypeScript, ESLint and Prettier configuration
infra                     Local Postgres/Redis/RabbitMQ and per-service images
docs                      This document and runbooks
```

A service is the only place that owns its tables. It never imports another
service; cross-service types live in `@uhs/contracts`, and integration happens
through events or the small set of internal HTTP endpoints.

## Request flow (§1.2)

1. The browser talks to `apps/web` only.
2. The server holds the session, obtains a tenant-scoped access token from auth,
   and calls services with it.
3. Each service verifies the token against auth's JWKS (`authenticate`), sets the
   tenant in the transaction (`withTenant`), and checks the route permission
   (`requirePermission`).
4. Changes other services must react to are written to the outbox in the same
   transaction and published to RabbitMQ by the relay.
5. Synchronous service-to-service calls are limited to registry snapshot, role
   catalogue, consent check, reconciliation and held-event release.

## Backbone (`@uhs/service-kit`)

| Concern | Module | Spec |
| --- | --- | --- |
| Environment | `config.ts` | §4.2 |
| Logging with redaction | `logger.ts` | §17 |
| Tracing | `tracing.ts` | §17 |
| Tenant transaction | `db/client.ts` | §7.3 |
| Outbox + relay | `outbox.ts` | §9.3 |
| Idempotent consumer | `inbox.ts` | §9.4 |
| Broker topology and retries | `eventbus.ts` | §9.2, §9.6 |
| Token verification and permissions | `auth.ts` | §4.3, §5.5 |
| Problem Details and middleware order | `http/*` | §4.3, §4.4 |
| Graceful shutdown | `lifecycle.ts` | §4.4 |

`withTenant` sets `app.tenant_id` with `set_config(..., true)`, which is
transaction-local and cannot leak across pooled connections. A table with
`tenant_id` needs the matching policy and `FORCE ROW LEVEL SECURITY`.

## Events

Events use the envelope from `@uhs/contracts` (§9.1) and the catalogue from §9.9.
Routing keys are the event type, with `.<source_application>` appended for
`lab.*` and `clm.*`, so a consumer only binds to the keys of its own application.

Every consumer queue has a durable dead-letter queue and a five-step retry ladder
(1s, 5s, 30s, 2m, 10m). Delays use TTL queues that dead-letter through a fanout
exchange, which preserves the original routing key.

Consumers are idempotent: the inbox primary key is `(consumer, event_id)`, and
the row is written in the same transaction as the handler's work, so a technical
failure rolls everything back and a redelivery retries cleanly.

## Tenancy

- `tenant_id` comes from the verified token or the event envelope, never from a
  request body or query string.
- Patients are global registry records in core; each tenant issues its own MRN.
- Cross-tenant events carry `relationship_id`; the consumer resolves it through
  core before applying anything.

## Frontend

Route groups mirror the three areas: `(staff)`, `(patient)` and `(platform)`.
Hostname decides the area in `middleware.ts`, which only annotates the request —
every service still enforces its own permissions.

`experimental`/`transpilePackages` compiles the workspace packages from source.
The CSP in `next.config.ts` allows `unsafe-eval` in development only.

## Build order (§19)

1. **Foundation (this repository).** Monorepo, packages, CI, infrastructure, and
   a service template with auth, tenancy, outbox and inbox.
2. **auth and core skeletons.** Better Auth acceptance tests, tenancy, registry
   basics, ledger and the held-event worklist.
3. **Web shell.** Login, tenant switch, theming, navigation, tenant admin screens.
4. **INT-01 and INT-03.** Encounter to triage, lab orders and results.
5. **INT-05.** Infant identity, multiples, admissions, critical result task,
   realtime gateway.
6. **INT-06/07/08.** Claims intake, lifecycle, adjustments, first payer adapter.
7. **INT-02 and INT-04.** Triage to pharmacy, pharmacy to lab when enabled.
8. **Reconciliation, performance, security review and runbooks.**

## Conventions

- REST and JSON, paths starting `/v1`; internal endpoints under `/internal` with
  service tokens only.
- POST requires `Idempotency-Key`; PUT and PATCH require `If-Match`.
- Errors are Problem Details with a stable `<SERVICE>-<AREA>-<NNN>` code.
- Money is `NUMERIC(14,2)` and a decimal string in JSON; arithmetic uses
  `decimal.js`, never floats.
- Identifiers are UUIDv7 generated in application code.
