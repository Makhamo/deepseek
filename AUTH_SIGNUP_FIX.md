# Patient registration + multi-DB identity fix

## Problem fixed
- `Failed to fetch` on signup → frontend now calls `POST /api/register/patient` with clear error if auth is down.
- Different column names per service → explicit SQL mappings (no shared schema assumption).
- Same `userId` + `patientId` (uuidv7 from browser) written everywhere.

## Signup fields
firstName, lastName, email, password, phone, gender, idNumber, dateOfBirth, address  
role is always `patient`. Two uuidv7s: `userId` and `patientId`.

## Column mapping

| Field        | Auth patient_profile | Lab user/patient | NICU | Appointment | Triage |
|-------------|----------------------|------------------|------|-------------|--------|
| userId      | user.id / userId     | userId           | UserID | userId    | user_id |
| patientId   | patient_profile.id   | patientId        | patientID | patientId | patient_id |
| firstName   | (in name)            | name             | FirtName | firstName | first_name |
| lastName    | (in name)            | surname          | LastName | lastName | last_name |
| email       | user.email           | email            | Email | email     | email |
| phone       | phone                | phone            | —    | phoneNumber | phone |
| gender      | gender               | gender           | Gender | gender   | gender |
| dateOfBirth | dateOfBirth          | dateOfBirth      | DateOfBirth | —    | date_of_birth |
| idNumber    | medicalAidNumber*    | idNumber         | —    | identification | id_number |
| address     | address              | address          | —    | address  | address |
| role        | user.role            | role             | Role | role     | role |

\* Auth stores national id in `medicalAidNumber` until a dedicated column is added.

Password is **not** copied to other DBs (auth is the only credential store).

## Run

```bash
# terminal 1 — auth must be running or signup shows "Cannot reach auth server"
cd services/auth
cp .env.example .env   # already has your Neon URLs
npm install
npm run db:push
npm run dev            # http://localhost:4001

# terminal 2
cd apps/web
echo 'NEXT_PUBLIC_AUTH_URL=http://localhost:4001' > .env.local
npm install
npm run dev            # http://localhost:3000
```

Open http://localhost:3000/signup

## Endpoint
`POST http://localhost:4001/api/register/patient`

## Schema fix (2026-11-26)

Better Auth plugins `jwt` and `twoFactor` require:

- column `user.two_factor_enabled`
- table `twoFactor` (id, secret, backupCodes, userId)
- table `jwks` (id, publicKey, privateKey, createdAt, expiresAt)

Apply either:

```bash
cd services/auth
npm run db:push
# or
psql "$DATABASE_URL" -f migrations/0001_better_auth_plugins.sql
```

Then restart auth (`npm run dev`).
