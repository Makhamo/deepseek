/**
 * Propagate a newly registered patient (or staff) into every service database.
 * Column names and table structures differ per service — each target has an explicit mapping
 * based on the provided schemas.
 *
 * Password is NEVER copied to downstream DBs (auth is the credential source of truth).
 * userId and patientId are shared (same UUID) across all databases.
 */
import { Pool } from "pg";

export type Registration = {
  userId: string;
  patientId?: string; // for patients; for staff may be null or same
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string; // patient, doctor, labTech, pharmacist, admin, nurse, etc.
  phone?: string | null;
  gender?: string | null;
  idNumber?: string | null;
  dateOfBirth?: string | null; // YYYY-MM-DD
  address?: string | null;
  // staff specific
  licenseNumber?: string | null;
  specialty?: string | null;
  practiceNumber?: string | null;
};

const SERVICE_DB_ENV: Record<string, string> = {
  lab: "LAB_DATABASE_URL",
  appointment: "APPOINTMENT_DATABASE_URL",
  nicu: "NICU_DATABASE_URL",
  triage: "TRIAGE_DATABASE_URL",
  claims: "CLAIMS_DATABASE_URL",
  pharmacy: "PHARMACY_DATABASE_URL",
};

const pools = new Map<string, Pool>();

function resolveUrl(envKey: string, serviceKey: string): string | undefined {
  const primary = process.env[envKey];
  if (primary) return primary;
  if (serviceKey === "nicu") return process.env.NICE_DATABASE_URL;
  return undefined;
}

function getPool(envKey: string, serviceKey: string): Pool | null {
  const url = resolveUrl(envKey, serviceKey);
  if (!url) return null;
  let pool = pools.get(envKey);
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 15_000,
      connectionTimeoutMillis: 8_000,
    });
    pools.set(envKey, pool);
  }
  return pool;
}

async function safeQuery(
  client: import("pg").PoolClient,
  sql: string,
  params: unknown[],
  label: string
) {
  try {
    await client.query(sql, params);
  } catch (err) {
    console.warn(`[propagate] ${label}:`, (err as Error).message);
  }
}

/* ------------------------------------------------------------------ */
/*  Per-service writers (aligned to provided schemas)                  */
/* ------------------------------------------------------------------ */

async function writeLab(client: import("pg").PoolClient, p: Registration) {
  // Lab User: userId, name, email, role, password, isActive
  await safeQuery(
    client,
    `INSERT INTO "User" ("userId", name, email, role, password, "isActive")
     VALUES ($1, $2, $3, $4, NULL, true)
     ON CONFLICT ("userId") DO UPDATE SET
       name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role`,
    [p.userId, p.fullName, p.email, p.role],
    "lab.User"
  );

  if (p.role === "patient" && p.patientId) {
    await safeQuery(
      client,
      `INSERT INTO "Patient" ("patientId", name, surname, "dateOfBirth", gender, "idNumber", phone, email, address, "userId", "isActive")
       VALUES ($1, $2, $3, $4::date, $5, $6, $7, $8, $9, $10, true)
       ON CONFLICT ("patientId") DO UPDATE SET
         name = EXCLUDED.name, surname = EXCLUDED.surname, "dateOfBirth" = EXCLUDED."dateOfBirth",
         gender = EXCLUDED.gender, "idNumber" = EXCLUDED."idNumber", phone = EXCLUDED.phone,
         email = EXCLUDED.email, address = EXCLUDED.address, "userId" = EXCLUDED."userId"`,
      [
        p.patientId,
        p.firstName,
        p.lastName,
        p.dateOfBirth || null,
        p.gender || null,
        p.idNumber || null,
        p.phone || null,
        p.email,
        p.address || null,
        p.userId,
      ],
      "lab.Patient"
    );
  }
}

async function writeAppointment(client: import("pg").PoolClient, p: Registration) {
  // Appointment Users: userId, firstName, lastName, role, phoneNumber, email, password, gender, isActive
  await safeQuery(
    client,
    `INSERT INTO "Users" ("userId", "firstName", "lastName", role, "phoneNumber", email, password, gender, "isActive")
     VALUES ($1, $2, $3, $4, $5, $6, NULL, $7, 1)
     ON CONFLICT ("userId") DO UPDATE SET
       "firstName" = EXCLUDED."firstName", "lastName" = EXCLUDED."lastName",
       role = EXCLUDED.role, "phoneNumber" = EXCLUDED."phoneNumber",
       email = EXCLUDED.email, gender = EXCLUDED.gender`,
    [p.userId, p.firstName, p.lastName, p.role, p.phone ? parseInt(p.phone) || null : null, p.email, p.gender || "other"],
    "appointment.Users"
  );

  if (p.role === "patient" && p.patientId) {
    await safeQuery(
      client,
      `INSERT INTO patient ("patientId", "userId", identification, address, "isActive")
       VALUES ($1, $2, $3, $4, 1)
       ON CONFLICT ("patientId") DO UPDATE SET
         "userId" = EXCLUDED."userId", identification = EXCLUDED.identification, address = EXCLUDED.address`,
      [p.patientId, p.userId, p.idNumber ? parseInt(p.idNumber) || null : null, p.address || ""],
      "appointment.patient"
    );
  }

  // For doctors, also insert into doctors table if role is doctor
  if (p.role === "doctor") {
    await safeQuery(
      client,
      `INSERT INTO doctors ("doctorId", "userId", availability, speciality, "practiceNumber", "isActive", "regFee", "consultFee")
       VALUES ($1, $2, 'available', $3, $4, 1, 0, 0)
       ON CONFLICT ("doctorId") DO UPDATE SET speciality = EXCLUDED.speciality, "practiceNumber" = EXCLUDED."practiceNumber"`,
      [p.userId, p.userId, p.specialty || "General", p.practiceNumber || "0"],
      "appointment.doctors"
    );
  }
}

async function writeNicu(client: import("pg").PoolClient, p: Registration) {
  // Nice/NICU User: UserID, Email, Password, Role
  await safeQuery(
    client,
    `INSERT INTO "User" ("UserID", "Email", "Password", "Role", "IsActive")
     VALUES ($1, $2, NULL, $3, true)
     ON CONFLICT ("UserID") DO UPDATE SET "Email" = EXCLUDED."Email", "Role" = EXCLUDED."Role"`,
    [p.userId, p.email, p.role],
    "nicu.User"
  );

  if (p.role === "patient" && p.patientId) {
    await safeQuery(
      client,
      `INSERT INTO "Patient" ("PatientID", "FirstName", "LastName", "Gender", "DateOfBirth", "IsActive")
       VALUES ($1, $2, $3, $4, $5::date, true)
       ON CONFLICT ("PatientID") DO UPDATE SET
         "FirstName" = EXCLUDED."FirstName", "LastName" = EXCLUDED."LastName",
         "Gender" = EXCLUDED."Gender", "DateOfBirth" = EXCLUDED."DateOfBirth"`,
      [p.patientId, p.firstName, p.lastName, p.gender || null, p.dateOfBirth || null],
      "nicu.Patient"
    );
  }

  // For nurses
  if (p.role === "nurse") {
    await safeQuery(
      client,
      `INSERT INTO "Nurse" ("NurseID", "FirstName", "LastName", "LicenseNum", "PhoneNum", "UserID", "IsActive")
       VALUES ($1, $2, $3, $4, $5, $1, true)
       ON CONFLICT ("NurseID") DO UPDATE SET "FirstName" = EXCLUDED."FirstName", "LicenseNum" = EXCLUDED."LicenseNum"`,
      [p.userId, p.firstName, p.lastName, p.licenseNumber || null, p.phone || null],
      "nicu.Nurse"
    );
  }
}

async function writeTriage(client: import("pg").PoolClient, p: Registration) {
  // Triage users: user_id, email, role, password_hash
  await safeQuery(
    client,
    `INSERT INTO users (user_id, email, role, password_hash, is_active)
     VALUES ($1, $2, $3, NULL, true)
     ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role`,
    [p.userId, p.email, p.role],
    "triage.users"
  );

  if (p.role === "patient" && p.patientId) {
    await safeQuery(
      client,
      `INSERT INTO patient (patient_id, user_id, first_name, last_name, email, phone, address, date_of_birth, gender, id_number, is_deleted)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
       ON CONFLICT (patient_id) DO UPDATE SET
         user_id = EXCLUDED.user_id, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
         email = EXCLUDED.email, phone = EXCLUDED.phone, address = EXCLUDED.address,
         date_of_birth = EXCLUDED.date_of_birth, gender = EXCLUDED.gender, id_number = EXCLUDED.id_number`,
      [
        p.patientId,
        p.userId,
        p.firstName,
        p.lastName,
        p.email,
        p.phone || null,
        p.address || null,
        p.dateOfBirth || null,
        p.gender || null,
        p.idNumber || null,
      ],
      "triage.patient"
    );
  }

  // For clinicians/doctors
  if (p.role === "doctor" || p.role === "clinician") {
    await safeQuery(
      client,
      `INSERT INTO clinician (clinician_id, user_id, first_name, last_name, email, specialization, license_number, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       ON CONFLICT (clinician_id) DO UPDATE SET
         first_name = EXCLUDED.first_name, specialization = EXCLUDED.specialization, license_number = EXCLUDED.license_number`,
      [p.userId, p.userId, p.firstName, p.lastName, p.email, p.specialty || null, p.licenseNumber || null, p.phone || null],
      "triage.clinician"
    );
  }
}

async function writePharmacy(client: import("pg").PoolClient, p: Registration) {
  // Pharmacy Patient
  if (p.role === "patient" && p.patientId) {
    await safeQuery(
      client,
      `INSERT INTO "Patient" ("patientId", identifier, name, "birthDate", gender, "isActive")
       VALUES ($1, $2, $3, $4::date, $5, true)
       ON CONFLICT ("patientId") DO UPDATE SET
         identifier = EXCLUDED.identifier, name = EXCLUDED.name, "birthDate" = EXCLUDED."birthDate", gender = EXCLUDED.gender`,
      [p.patientId, p.idNumber || p.patientId, p.fullName, p.dateOfBirth || null, p.gender || null],
      "pharmacy.Patient"
    );

    // Also create Auth link
    await safeQuery(
      client,
      `INSERT INTO "Auth" ("authId", username, "passwordHash", "entityType", "entityId", "isActive")
       VALUES ($1, $2, NULL, 'Patient', $3, true)
       ON CONFLICT ("authId") DO NOTHING`,
      [p.userId, p.email, p.patientId],
      "pharmacy.Auth"
    );
  }

  // For pharmacist
  if (p.role === "pharmacist" || p.role === "pharmacy") {
    await safeQuery(
      client,
      `INSERT INTO "Practitioner" ("practitionerId", identifier, name, role, "isActive")
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT ("practitionerId") DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role`,
      [p.userId, p.licenseNumber || p.userId, p.fullName, "pharmacist"],
      "pharmacy.Practitioner"
    );

    await safeQuery(
      client,
      `INSERT INTO "Auth" ("authId", username, "passwordHash", "entityType", "entityId", "isActive")
       VALUES ($1, $2, NULL, 'Practitioner', $1, true)
       ON CONFLICT ("authId") DO NOTHING`,
      [p.userId, p.email],
      "pharmacy.Auth.staff"
    );
  }
}

async function writeClaims(client: import("pg").PoolClient, p: Registration) {
  // Generic fallback for claims (no schema provided)
  await safeQuery(
    client,
    `INSERT INTO users (id, email, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, first_name = EXCLUDED.first_name`,
    [p.userId, p.email, p.firstName, p.lastName, p.role],
    "claims.users"
  );
  if (p.patientId && p.role === "patient") {
    await safeQuery(
      client,
      `INSERT INTO patient (id, user_id, email, name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name`,
      [p.patientId, p.userId, p.email, p.fullName],
      "claims.patient"
    );
  }
}

const WRITERS: Record<
  string,
  (c: import("pg").PoolClient, p: Registration) => Promise<void>
> = {
  lab: writeLab,
  appointment: writeAppointment,
  nicu: writeNicu,
  triage: writeTriage,
  claims: writeClaims,
  pharmacy: writePharmacy,
};

/**
 * Fan-out registration data to every configured service database.
 * Fire-and-forget; never throws to the caller.
 */
export async function propagateUserToServices(p: Registration) {
  const jobs = Object.entries(SERVICE_DB_ENV).map(async ([key, envKey]) => {
    const pool = getPool(envKey, key);
    if (!pool) {
      console.warn(`[propagate] ${key}: no DATABASE_URL configured, skip`);
      return;
    }
    const client = await pool.connect();
    try {
      const writer = WRITERS[key];
      if (writer) await writer(client, p);
    } catch (err) {
      console.warn(`[propagate] ${key} failed:`, (err as Error).message);
    } finally {
      client.release();
    }
  });
  await Promise.allSettled(jobs);
}

/** Backward-compatible thin wrapper used by Better Auth hooks. */
export async function propagateUserToServicesLegacy(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}) {
  const parts = (user.name || "").trim().split(/\s+/);
  const firstName = parts[0] || user.name || "User";
  const lastName = parts.slice(1).join(" ") || "";
  await propagateUserToServices({
    userId: user.id,
    patientId: user.role === "patient" ? user.id : undefined,
    email: user.email,
    firstName,
    lastName,
    fullName: user.name,
    role: user.role || "patient",
  });
}
