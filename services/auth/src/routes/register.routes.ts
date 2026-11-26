/**
 * POST /api/register/patient
 * GET  /api/register/check-email?email=
 *
 * One patient registration → ONE id everywhere:
 *
 *   users.id (uuid)  =  "user".id  =  account.user_id  =  patient_profile.user_id
 *                    =  patient_profile.id (patientId)
 *                    =  userId / user_id / UserID in every downstream service DB
 *                       (lab, appointment, nicu, triage, claims, pharmacy)
 *                    =  patientId / patient_id / patientID in their patient tables
 *
 * Steps
 *  1. Reject if the email already exists in `users` or Better Auth's "user".
 *  2. Better Auth signUpEmail  → "user" + account(password hash) + session (id = UUIDv7).
 *  3. In one transaction: INSERT users + user_credentials with that SAME id
 *     (password_hash = the hash Better Auth stored; the plain password is never stored).
 *     If this fails the Better Auth user is removed again, so no half-created identity.
 *  4. patient_profile (demographics), then fan-out to the service databases.
 *
 * Body: { email, password, firstName, lastName, phone?, gender?, idNumber?,
 *         dateOfBirth?, address?, forceReRegister? }
 * Ids are always assigned by the server; any userId/patientId in the body is ignored.
 * forceReRegister is dev-only: needs ALLOW_REREGISTER=true AND NODE_ENV != production.
 */
import { Router, type Response } from "express";
import { eq } from "drizzle-orm";
import { auth } from "../auth.js";
import { db, pool } from "../db/index.js";
import { user as userTable } from "../db/schema.js";
import { ensureSchema, isMissingTable, isSchemaProblem } from "../db/ensure-schema.js";
import { propagateUserToServices } from "../lib/propagate.js";

const router = Router();

function normalizeEmail(email: unknown): string {
  return String(email ?? "")
    .toLowerCase()
    .trim();
}

/** Run a DB call; if a core table is missing (fresh database) create it once and retry. */
async function withSchemaRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (!isMissingTable(err)) throw err;
    console.warn("[register] missing table, creating core tables:", (err as Error).message);
    await ensureSchema();
    return fn();
  }
}

function dbNotReady(res: Response, err: unknown) {
  return res.status(503).json({
    error: "The auth database does not match what the service expects",
    code: "DB_SCHEMA_MISMATCH",
    detail: (err as Error)?.message || String(err),
    hint: "Run `npm run db:inspect` in services/auth and compare with migrations/0004_core_identity.sql.",
  });
}

type ExistingUser = { id: string; source: "users" | "user" };

/** Look the email up in BOTH identity tables (users is canonical, "user" is Better Auth). */
async function findExisting(email: string): Promise<ExistingUser[]> {
  const r = await withSchemaRetry(() =>
    pool.query(
      `SELECT id::text AS id, 'users' AS source FROM "users" WHERE email = $1::citext
       UNION ALL
       SELECT id::text AS id, 'user' AS source FROM "user" WHERE lower(email) = $2::text`,
      [email, email]
    )
  );
  return r.rows as ExistingUser[];
}

/** Remove an identity everywhere it may exist (children cascade). */
async function deleteIdentity(email: string, userIds: string[]) {
  const ids = [...new Set(userIds)];
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const id of ids) {
      await client.query(`DELETE FROM patient_profile WHERE user_id = $1::text`, [id]);
      await client.query(`DELETE FROM "user" WHERE id = $1::text`, [id]); // session/account cascade
      await client.query(`DELETE FROM users WHERE id::text = $1::text`, [id]); // user_credentials cascades
    }
    await client.query(`DELETE FROM "user" WHERE lower(email) = $1::text`, [email]);
    await client.query(`DELETE FROM users WHERE email = $1::citext`, [email]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

/** Write the canonical rows (users + user_credentials) using the Better Auth user's id. */
async function mirrorIdentity(p: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO users (id, email, first_name, last_name, phone, status, is_active)
       VALUES ($1, $2, $3, $4, $5, 'active', true)
       ON CONFLICT (id) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name  = EXCLUDED.last_name,
         phone      = EXCLUDED.phone,
         updated_at = now()`,
      [p.userId, p.email, p.firstName, p.lastName, p.phone]
    );

    const cred = await client.query(
      `SELECT password FROM account
        WHERE user_id = $1::text AND provider_id = 'credential' LIMIT 1`,
      [p.userId]
    );
    const hash: string | undefined = cred.rows[0]?.password;
    if (!hash) throw new Error("Better Auth credential row not found for new user");

    await client.query(
      `INSERT INTO user_credentials (user_id, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         password_changed_at = now(),
         updated_at = now()`,
      [p.userId, hash]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

/** GET /api/register/check-email?email= */
router.get("/check-email", async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email);
    if (!email || !email.includes("@")) {
      return res.status(400).json({
        error: "Valid email query parameter is required",
        code: "INVALID_EMAIL",
      });
    }

    const found = await findExisting(email);
    if (found.length === 0) return res.json({ exists: false, email });

    return res.json({
      exists: true,
      email,
      userId: found[0].id,
      message: "An account with this email already exists",
      hint: "Sign in instead, or use a different email.",
    });
  } catch (err: any) {
    console.error("[register] check-email", err);
    if (isSchemaProblem(err)) return dbNotReady(res, err);
    return res.status(500).json({
      error: "Could not check email",
      code: "CHECK_FAILED",
      detail: err?.message || String(err),
    });
  }
});

router.post("/patient", async (req, res) => {
  try {
    const {
      email: rawEmail,
      password,
      firstName,
      lastName,
      phone,
      gender,
      idNumber,
      dateOfBirth,
      address,
      forceReRegister,
    } = req.body ?? {};

    const email = normalizeEmail(rawEmail);

    // Public endpoint: a client-supplied flag must NEVER be enough to delete an account.
    const devReregister =
      (process.env.ALLOW_REREGISTER === "true" || process.env.ALLOW_REREGISTER === "1") &&
      process.env.NODE_ENV !== "production";
    const allowForce =
      devReregister && (forceReRegister === true || forceReRegister === "true");

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: "email, password, firstName and lastName are required",
        code: "MISSING_FIELDS",
        fields: {
          email: !email ? "required" : null,
          password: !password ? "required" : null,
          firstName: !firstName ? "required" : null,
          lastName: !lastName ? "required" : null,
        },
      });
    }
    if (String(password).length < 8) {
      return res.status(400).json({
        error: "password must be at least 8 characters",
        code: "WEAK_PASSWORD",
      });
    }
    if (!email.includes("@")) {
      return res.status(400).json({ error: "Invalid email address", code: "INVALID_EMAIL" });
    }

    /* 1. duplicate check across both identity tables */
    const existing = await findExisting(email);
    if (existing.length > 0) {
      if (allowForce) {
        console.warn(`[register] forceReRegister: deleting existing identity for ${email}`);
        await deleteIdentity(email, existing.map((e) => e.id));
      } else {
        return res.status(409).json({
          error: "An account with this email already exists",
          code: "EMAIL_EXISTS",
          email,
          userId: existing[0].id,
          hint: "Sign in with this email or use a different email.",
          loginPath: "/login",
        });
      }
    }

    const first = String(firstName).trim();
    const last = String(lastName).trim();
    const fullName = `${first} ${last}`.trim();
    const role = "patient";

    /* 2. Better Auth user + credential + session (id = UUIDv7) */
    let signUpResult: unknown;
    try {
      signUpResult = await withSchemaRetry(() =>
        auth.api.signUpEmail({
          body: { email, password: String(password), name: fullName },
          headers: req.headers as HeadersInit,
        })
      );
    } catch (err: any) {
      const msg = err?.message || String(err);
      const bodyMsg = err?.body?.message || err?.cause?.message || "";
      if (isSchemaProblem(err)) return dbNotReady(res, err);
      if (/already|exist|unique|duplicate/i.test(`${msg} ${bodyMsg}`)) {
        return res.status(409).json({
          error: "An account with this email already exists",
          code: "EMAIL_EXISTS",
          email,
          detail: msg,
          hint: "Sign in instead, or use a different email.",
          loginPath: "/login",
        });
      }
      console.error("[register] better-auth signUpEmail failed", err);
      return res.status(500).json({
        error: "Could not create account",
        code: "SIGNUP_FAILED",
        detail: bodyMsg || msg,
      });
    }

    // The id Better Auth actually stored is the source of truth for every table below.
    let userId: string | undefined = (signUpResult as { user?: { id?: string } })?.user?.id;
    if (!userId) {
      const found = await db
        .select({ id: userTable.id })
        .from(userTable)
        .where(eq(userTable.email, email))
        .limit(1);
      userId = found[0]?.id;
    }
    if (!userId) {
      console.error("[register] signUpEmail returned no user and none found for", email);
      return res.status(500).json({
        error: "Account was not created",
        code: "USER_NOT_SAVED",
        hint: "Check the auth service logs for the database error.",
      });
    }
    const patientId = userId; // PatientId === UserId across every database

    /* 3. canonical users + user_credentials with the SAME id (all-or-nothing) */
    try {
      await mirrorIdentity({
        userId,
        email,
        firstName: first,
        lastName: last,
        phone: phone ? String(phone).trim() : null,
      });
    } catch (err: any) {
      console.error("[register] users/user_credentials insert failed — rolling back", err);
      try {
        await deleteIdentity(email, [userId]);
      } catch (cleanupErr) {
        console.error("[register] cleanup after failed users insert also failed", cleanupErr);
      }
      if (err?.code === "23505") {
        return res.status(409).json({
          error: "An account with this email already exists",
          code: "EMAIL_EXISTS",
          email,
          detail: err?.detail || err?.message,
          loginPath: "/login",
        });
      }
      return res.status(500).json({
        error: "Could not save the user record",
        code: "USERS_INSERT_FAILED",
        detail: err?.message || String(err),
        hint: "The account was rolled back. Check the `users` / `user_credentials` tables and any triggers on them.",
      });
    }

    const warnings: string[] = [];

    /* 4. patient_profile (id = user id) */
    try {
      await pool.query(
        `INSERT INTO patient_profile
           (id, user_id, date_of_birth, gender, phone, address, medical_aid_number)
         VALUES ($1::text, $1::text, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE SET
           date_of_birth      = COALESCE(EXCLUDED.date_of_birth, patient_profile.date_of_birth),
           gender             = COALESCE(EXCLUDED.gender, patient_profile.gender),
           phone              = COALESCE(EXCLUDED.phone, patient_profile.phone),
           address            = COALESCE(EXCLUDED.address, patient_profile.address),
           medical_aid_number = COALESCE(EXCLUDED.medical_aid_number, patient_profile.medical_aid_number),
           updated_at         = now()`,
        [
          userId,
          dateOfBirth ? new Date(dateOfBirth) : null,
          gender || null,
          phone || null,
          address || null,
          idNumber || null,
        ]
      );
    } catch (e) {
      console.error("[register] patient_profile", e);
      warnings.push("patient_profile");
    }

    try {
      await pool.query(`UPDATE "user" SET role = $2, updated_at = now() WHERE id = $1::text`, [
        userId,
        role,
      ]);
    } catch (e) {
      console.warn("[register] role update", (e as Error).message);
      warnings.push("role");
    }

    /* 5. fan-out: same userId + patientId into every service database */
    try {
      await propagateUserToServices({
        userId,
        patientId,
        email,
        firstName: first,
        lastName: last,
        fullName,
        role,
        phone: phone || null,
        gender: gender || null,
        idNumber: idNumber || null,
        dateOfBirth: dateOfBirth || null,
        address: address || null,
      });
    } catch (e) {
      console.error("[register] propagate", e);
      warnings.push("propagate");
    }

    return res.status(201).json({
      ok: true,
      userId,
      patientId,
      email,
      role,
      ...(warnings.length ? { warnings } : {}),
    });
  } catch (err: any) {
    console.error("[register] unexpected", err);
    if (isSchemaProblem(err)) return dbNotReady(res, err);
    return res.status(500).json({
      error: "Registration failed",
      code: "UNEXPECTED",
      detail: err?.message || String(err),
    });
  }
});


/**
 * POST /api/register/staff
 * Register a staff member (doctor, labTech, pharmacist, nurse, admin, etc.)
 * Creates real Better Auth user + users record + staff_profile, then propagates to relevant service DBs.
 * Required: email, password, firstName, lastName, role
 * Optional: phone, gender, licenseNumber, specialty, practiceNumber, etc.
 */
router.post("/staff", async (req, res) => {
  try {
    const {
      email: rawEmail,
      password,
      firstName,
      lastName,
      role,
      phone,
      gender,
      licenseNumber,
      specialty,
      practiceNumber,
      organizationId,
      departmentId,
      title,
      forceReRegister,
    } = req.body || {};

    const email = normalizeEmail(rawEmail);
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required", code: "INVALID_EMAIL" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters", code: "WEAK_PASSWORD" });
    }
    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First and last name are required" });
    }
    if (!role) {
      return res.status(400).json({ error: "Role is required (doctor, labTech, pharmacist, nurse, admin, ...)" });
    }

    const fullName = `${firstName} ${lastName}`.trim();

    // Check existing
    const existing = await withSchemaRetry(() =>
      db.query.user.findFirst({ where: eq(userTable.email, email) })
    );
    if (existing && !forceReRegister) {
      return res.status(409).json({
        error: "An account with this email already exists",
        code: "EMAIL_EXISTS",
        email,
        loginPath: "/login",
      });
    }

    // Sign up via Better Auth
    const signUpResult = await auth.api.signUpEmail({
      body: { email, password, name: fullName },
    });

    if (!signUpResult || !signUpResult.user) {
      return res.status(500).json({ error: "Better Auth signup failed", detail: signUpResult });
    }

    const userId = signUpResult.user.id;
    const patientId = role === "patient" ? userId : null;

    // Insert into users + user_credentials (same as patient flow)
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO users (id, email, first_name, last_name, phone, status, is_active)
         VALUES ($1, $2, $3, $4, $5, 'active', true)
         ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name`,
        [userId, email, firstName, lastName, phone || null]
      );
      // user_credentials: password_hash comes from Better Auth account, but we can leave or sync if needed
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("[register/staff] users insert failed", err);
      // cleanup Better Auth user if possible
      try {
        await db.delete(userTable).where(eq(userTable.id, userId));
      } catch {}
      return res.status(500).json({ error: "Failed to create user record", detail: (err as Error).message });
    } finally {
      client.release();
    }

    // staff_profile — all columns from the auth schema
    try {
      await pool.query(
        `INSERT INTO staff_profile
           (id, user_id, organization_id, department_id, specialty, license_number, title, phone, is_active)
         VALUES ($1, $1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (user_id) DO UPDATE SET
           organization_id = COALESCE(EXCLUDED.organization_id, staff_profile.organization_id),
           department_id   = COALESCE(EXCLUDED.department_id, staff_profile.department_id),
           specialty       = COALESCE(EXCLUDED.specialty, staff_profile.specialty),
           license_number  = COALESCE(EXCLUDED.license_number, staff_profile.license_number),
           title           = COALESCE(EXCLUDED.title, staff_profile.title),
           phone           = COALESCE(EXCLUDED.phone, staff_profile.phone),
           updated_at      = now()`,
        [
          userId,
          organizationId || null,
          departmentId || null,
          specialty || null,
          licenseNumber || null,
          title || null,
          phone || null,
        ]
      );
    } catch (e) {
      console.warn("[register/staff] staff_profile", (e as Error).message);
    }

    // Update role on Better Auth user
    try {
      await pool.query(`UPDATE "user" SET role = $2, updated_at = now() WHERE id = $1`, [userId, role]);
    } catch {}

    // Propagate
    try {
      await propagateUserToServices({
        userId,
        patientId: patientId || undefined,
        email,
        firstName,
        lastName,
        fullName,
        role,
        phone: phone || null,
        gender: gender || null,
        licenseNumber: licenseNumber || null,
        specialty: specialty || null,
        practiceNumber: practiceNumber || null,
      });
    } catch (e) {
      console.error("[register/staff] propagate", e);
    }

    return res.status(201).json({
      ok: true,
      userId,
      email,
      role,
      message: "Staff member registered. They can now log in with the provided credentials.",
    });
  } catch (err: any) {
    console.error("[register/staff] unexpected", err);
    return res.status(500).json({
      error: "Staff registration failed",
      detail: err?.message || String(err),
    });
  }
});

export default router;
