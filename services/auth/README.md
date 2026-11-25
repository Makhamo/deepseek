# Unitac Auth Hub v3 — Central identity for the unified healthcare system

One login. Role + permissions decide what each portal (Doctor, Patient, Lab, Pharmacy, …) can do across **Appointment, Lab, Pharmacy, NICE, Triage, Claims**.

## Architecture

```
                    ┌─────────────────┐
   Doctor / Patient │   Auth Hub      │  JWT + session
   portals login ──►│  (this service) │◄──── JWKS /api/auth/jwks
                    │  roles + perms  │
                    └────────┬────────┘
         ┌───────────┬───────┼───────┬──────────┬─────────┐
         ▼           ▼       ▼       ▼          ▼         ▼
   Appointment     Lab   Pharmacy  NICE      Triage    Claims
   (own DB)      (own)    (own)   (own)      (own)     (own)
```

- **Auth DB only** is connected here.
- Other databases stay owned by their microservices.
- Those services **trust Auth**: validate JWT via JWKS, or call `GET /api/me/access` / `GET /api/me/check`.

## Roles → service access (after seed)

| Role | Appointment | Lab | Pharmacy | NICE | Triage | Claims |
|------|-------------|-----|----------|------|--------|--------|
| **patient** | book / read / cancel | results read | Rx read | — | — | read / submit |
| **doctor** | full manage | orders + results | write Rx | read / write | assess | read / submit |
| **nurse** | book / read | read | Rx read | read / write | full | — |
| **pharmacist** | — | — | dispense + inventory | — | — | — |
| **labtech** | — | results write | — | — | — | — |
| **admin / superadmin** | all | all | all | all | all | all |

Permission keys examples: `appointment:book`, `lab:results:write`, `pharmacy:dispense`, `nice:write`, `triage:assess`, `claims:submit`.

## Folder layout

```
src/
  auth.ts                 Better Auth (patient public signup; staff via admin)
  dto/                    Zod validation
  middleware/             auth + validate
  models/                 DB access (+ multi-service permission seed)
  controllers/
  routes/
  db/schema.ts            user, org, permissions, service_registry, profiles…
```

## Setup

```bash
npm install --legacy-peer-deps
cp .env.example .env   # set AUTH DATABASE_URL only
npm run db:push
npm run dev
```

### One-time seed (as admin)

1. Create first admin (CLI or direct DB `role = 'superadmin'`).
2. Login as admin.
3. `POST /api/permissions/seed`
4. `POST /api/registry/seed`

## Critical APIs for other services

| Endpoint | Use |
|----------|-----|
| `GET /api/auth/jwks` | JWT verification in Lab / Appointment / … |
| `GET /api/me/access` | Full payload: role, permission keys, by-service map, profiles |
| `GET /api/me/check?permission=appointment:book` | Boolean allow/deny |
| `POST /api/auth/sign-in/email` | Login (cookie session) |
| JWT plugin | Short-lived bearer tokens for service-to-service |

### Example `GET /api/me/access` (doctor)

```json
{
  "user": { "id": "...", "role": "doctor", "email": "dr@hospital.com" },
  "permissions": ["appointment:book", "lab:orders:create", "pharmacy:prescriptions:write", "..."],
  "services": {
    "appointment": ["appointment:read", "appointment:book", "appointment:manage"],
    "lab": ["lab:orders:read", "lab:orders:create", "lab:results:read"],
    "pharmacy": ["pharmacy:prescriptions:read", "pharmacy:prescriptions:write"],
    "nice": ["nice:read", "nice:write"]
  },
  "staffProfile": { "specialty": "GP", "licenseNumber": "MP123" }
}
```

## How a service enforces access

1. Receive request with `Authorization: Bearer <jwt>` or session cookie forwarded by gateway.
2. Verify JWT with Auth JWKS **or** call Auth `GET /api/me/check?permission=lab:results:write`.
3. If not allowed → 403.

Doctor portal does **not** need separate logins for Pharmacy or Appointment: same token, Auth decides.

## Public vs staff registration

- **Patient**: `POST /api/auth/sign-up/email` → always `role=patient`.
- **Doctor / Nurse / Pharmacist / LabTech**: admin only → `POST /api/auth/admin/create-user` with `"role": "doctor"` then `POST /api/staff` for profile.

## Databases (reference — Auth does not connect to these)

| Service | Neon host (your envs) |
|---------|------------------------|
| Auth | ep-mute-wave-… |
| Lab | ep-quiet-hat-… |
| Appointment | ep-jolly-heart-… |
| NICE | ep-long-frog-… |
| Triage | ep-little-pine-… |
| Claims | ep-little-bonus-… |
| Pharmacy | ep-purple-breeze-… |

Keep secrets in each service’s own `.env`. Never put Lab/Pharmacy URLs into Auth process unless building a BFF gateway later.
