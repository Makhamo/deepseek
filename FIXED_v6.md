# Auth Fix v6 — Shared Identity + Admin Portal

## Changes

### 1. Correct table mappings across all service databases
`services/auth/src/lib/propagate.ts` now uses the exact table and column names from the provided schemas:

- **Lab**: `"User"` (userId, name, email, role) + `"Patient"` (patientId, name, surname, dateOfBirth, gender, idNumber, phone, email, address, userId)
- **Appointment**: `"Users"` (userId, firstName, lastName, role, phoneNumber, email, gender) + `patient` + `doctors` for doctors
- **NICU / Nice**: `"User"` (UserID, Email, Role) + `"Patient"` (PatientID, FirstName, LastName, Gender, DateOfBirth) + `"Nurse"` for nurses
- **Triage**: `users` (user_id, email, role) + `patient` (patient_id, user_id, first_name, ...) + `clinician` for doctors
- **Pharmacy**: `"Patient"` (patientId, identifier, name, birthDate, gender) + `"Auth"` link + `"Practitioner"` for pharmacists
- **Claims**: generic fallback

All inserts use `ON CONFLICT` so re-registration is safe. Password is never copied (auth is source of truth).

### 2. Patient registration shares identity
`POST /api/register/patient` still creates:
- Better Auth `user` + `account` (password hash)
- `users` + `user_credentials` with the **same UUID**
- `patient_profile` with id = userId = patientId
- Fan-out to every service DB with the same userId / patientId

### 3. Staff registration (new)
`POST /api/register/staff`
- Body: email, password, firstName, lastName, role (doctor | labTech | pharmacist | nurse | admin | ...), plus licenseNumber, specialty, practiceNumber, phone, gender
- Creates real Better Auth user + users record + staff_profile
- Propagates to the relevant service databases
- Staff can immediately log in with the credentials they were given

### 4. Admin Portal
- `/admin` dashboard updated
- `/admin/register` — full form for registering any role (staff or patient)
- Collects all required auth fields
- Proxies to the auth service

### 5. Patient portal
Existing patient signup + login continues to work. After registration the patient has a real session and can use `/portal/*` with the shared identity.

## Run

```bash
# Auth service
cd services/auth
npm install
# set DATABASE_URL + LAB_DATABASE_URL, APPOINTMENT_DATABASE_URL, NICU_DATABASE_URL, TRIAGE_DATABASE_URL, PHARMACY_DATABASE_URL in .env
npm run dev          # :4001

# Web
cd apps/web
echo 'NEXT_PUBLIC_AUTH_URL=http://localhost:4001' > .env.local
npm install
npm run dev          # :3000
```

- Patient signup: http://localhost:3000/signup
- Admin register: http://localhost:3000/admin/register (after staff login, or open directly in dev)
- Login: http://localhost:3000/login

All registered users (patient or staff) use the real Better Auth login and receive a real session.

## v6.1 — Real Patient Profile in Portal

- Patient layout (`(patient)/layout.tsx`) now loads the Better Auth session and fetches `/api/patients/me`.
- Displays the real first + last name and email in the sidebar and topbar (no more hardcoded “Thandi Ndlovu”).
- Portal home greeting uses the real first name from the patient profile.
- Settings → Personal tab loads the real profile and saves changes back via `POST /api/patients/me`.
- New proxy: `apps/web/src/app/api/patients/me/route.ts` forwards to the auth service.

Patient registration still creates the `patient_profile` row with the shared userId, so the portal immediately shows the real registered patient.

## v6.2 — Seeded Admin + Real Profile Fields + Advanced Admin Portal

- **Default admin seeded on startup**: `admin@gmail.com` / `password123`
  - Created via Better Auth `signUpEmail` so the password hash is real.
  - Role set to `admin`, staff_profile created.
- **Patient profile now returns full identity**:
  - `findByUserId` joins `users` and returns `firstName`, `lastName`, `email`, `phone`, `name`.
  - Settings and portal greeting now show real names, email, and phone.
- **Advanced admin portal**:
  - `/admin` dashboard with links and seeded credentials note.
  - `/admin/users` — live table of all users (name, email, role, phone, status).
  - `/admin/register` — full registration form (unchanged, already working).
  - New endpoint: `GET /api/admin/users` (staff-only).

## v6.3 — Patient loading + Advanced Admin controls

- Patient portal home and Settings → Personal now show a spinner while fetching the real profile.
- Advanced admin portal:
  - Change user role (`POST /api/admin/users/:id/role`)
  - Set password (`POST /api/admin/users/:id/password`) — hashes via Better Auth
  - Assign organization membership (`POST /api/admin/users/:id/organization`)
  - List organizations and permissions
  - Full UI on `/admin/users` with side panel for actions
