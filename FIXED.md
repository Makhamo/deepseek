# v4 — registration now uses the real `users` / `user_credentials` tables

## One id everywhere
Registering a patient generates ONE uuid (UUIDv7) and writes it to:

| Where | Column |
|-------|--------|
| auth `users` | `id` |
| auth `user_credentials` | `user_id` (password hash copied from Better Auth's credential) |
| auth Better Auth `user` / `account` / `session` | `id` / `user_id` / `user_id` |
| auth `patient_profile` | `user_id` **and** `id` (patientId = userId) |
| lab / appointment / nicu / triage / claims / pharmacy | `userId`, `user_id` or `UserID` (per DB) and `patientId`, `patient_id` or `patientID` |

Failure handling: if the `users` / `user_credentials` insert fails, the Better Auth user is
removed again, so you never end up with a half-created account.

## Database safety (v3 correction)
v3 ran a full bootstrap automatically and very likely created extra Better Auth tables
(`user`, `session`, `account`, `verification`, `patient_profile`, `jwks`, `twoFactor`, …)
next to your real schema. v4:
- does **nothing** on startup when the core tables exist;
- when some are missing, only runs `migrations/0004_core_identity.sql` (`CREATE … IF NOT EXISTS`,
  no ALTER / DROP / seed). Disable with `AUTH_AUTO_SCHEMA=false`;
- `npm run db:bootstrap` now refuses to run if a `users` table exists;
- `npm run db:inspect` is read-only and lists every table with row counts and columns.

Nothing is dropped automatically. Review `db:inspect` output before removing any table.

## Run
```bash
cd services/auth && npm install && npm run dev
cd apps/web && npm install && npm run dev      # http://localhost:3000/signup
```

---

# Fixed package — Auth Hub schema + TypeScript + DB bootstrap

## Critical: empty database

If you see `relation "user" does not exist`, the auth Neon DB has no tables.
Run the bootstrap **once** from `services/auth`:

```bash
cd services/auth
cp .env.example .env   # ensure DATABASE_URL is set
npm install
npm run db:bootstrap   # creates all tables + seeds registry/permissions
npm run dev
```

## What was fixed

1. **Better Auth schema** — jwks / twoFactor columns
2. **Express req.params types** — `param()` helper
3. **Stale @uhs/service-kit imports** — standalone auth
4. **Registration UX** — check-email, detailed errors, forceReRegister
5. **Full DB bootstrap** — `migrations/0002_full_auth_schema.sql` + seed

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run db:bootstrap` | Create all tables + seed (use this first) |
| `npm run db:apply-plugins` | Only plugin columns (if tables already exist) |
| `npm run db:push` | drizzle-kit push from schema.ts |

## Signup

```bash
cd apps/web
echo 'NEXT_PUBLIC_AUTH_URL=http://localhost:4001' > .env.local
npm install && npm run dev
```

Open http://localhost:3000/signup
