// src/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization, jwt, admin, twoFactor } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
import { eq } from "drizzle-orm";

import { db } from "./db/index.js";
import { schema, patientProfile, users } from "./db/schema.js";
import { uuidv7 } from "./lib/uuidv7.js";
import { propagateUserToServicesLegacy as propagateUserToServices } from "./lib/propagate.js";

/* ------------------------------------------------------------------ */
/*  Access control (Better Auth admin plugin)                          */
/* ------------------------------------------------------------------ */

const statement = {
  ...defaultStatements,
} as const;

const ac = createAccessControl(statement);

const patientRole = ac.newRole({});
const doctorRole = ac.newRole({});
const pharmacistRole = ac.newRole({});
const nurseRole = ac.newRole({});
const labTechRole = ac.newRole({});
const adminRole = ac.newRole({ ...adminAc.statements });
const superadminRole = ac.newRole({ ...adminAc.statements });

/* ------------------------------------------------------------------ */
/*  Auth instance                                                      */
/* ------------------------------------------------------------------ */

export const auth = betterAuth({
  appName: "Auth API",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4001",
  secret: process.env.BETTER_AUTH_SECRET!,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  emailAndPassword: {
    enabled: true,
    // Public sign-up = patient. No email verification required for now.
    // Flip to true once transactional email (Resend/SES) is wired.
    requireEmailVerification: false,
    minPasswordLength: 8,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60,          // refresh every hour
  },

  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 10,
      membershipLimit: 100,
      creatorRole: "owner",
    }),
    jwt({
      jwt: {
        expirationTime: "15m",
      },
    }),
    twoFactor(),
    admin({
      defaultRole: "patient",
      adminRoles: ["admin", "superadmin"],
      ac,
      roles: {
        patient: patientRole,
        doctor: doctorRole,
        pharmacist: pharmacistRole,
        nurse: nurseRole,
        labtech: labTechRole,
        admin: adminRole,
        superadmin: superadminRole,
      },
    }),
  ],

  /* ---------------------------------------------------------------- */
  /*  Hooks: enforce patient role + create patient_profile + fan-out  */
  /* ---------------------------------------------------------------- */
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Public signup is ALWAYS a patient.
          // Staff accounts must be created via admin routes (POST /api/staff).
          return {
            data: {
              ...user,
              role: "patient",
            },
          };
        },
        after: async (user) => {
          // 1. Create the patient_profile row in the SAME database,
          //    using the SAME user.id — this is the identity that
          //    every other service will mirror.
          try {
            const existing = await db
              .select({ id: patientProfile.id })
              .from(patientProfile)
              .where(eq(patientProfile.userId, user.id))
              .limit(1);

            if (existing.length === 0) {
              // Use the same UUID as user.id so PatientId === UserId across
              // every service database (frontend can also send uuidv7).
              await db.insert(patientProfile).values({
                id: user.id,
                userId: user.id,
                // All demographic fields left null — patient fills them
                // via POST /api/patients/me.
              });
            }
          } catch (err) {
            // Do NOT fail the signup if profile creation fails; the
            // patient can still sign in and we can backfill later.
            console.error("[auth] failed to create patient_profile", err);
          }

          // Sync to users table with proper first/last name and UUID-compatible id
          try {
            const nameParts = (user.name || "").trim().split(/\s+/);
            const firstName = nameParts[0] || "Patient";
            const lastName = nameParts.slice(1).join(" ") || "User";
            await db.insert(users).values({
              id: user.id,
              email: user.email,
              firstName,
              lastName,
              status: "active",
              isActive: true,
            }).onConflictDoNothing();
          } catch (err) {
            console.error("[auth] failed to sync users table", err);
          }

          // 2. Fan-out the same user.id to downstream services so
          //    lab, appointment, pharmacy, triage, nice, claims all
          //    store a mirror row with the identical id.
          try {
            await propagateUserToServices({
              id: user.id,
              email: user.email,
              name: user.name,
              role: (user as { role?: string }).role ?? "patient",
            });
          } catch (err) {
            console.error("[auth] failed to propagate user", err);
          }
        },
      },
      update: {
        after: async (user) => {
          // Keep downstream mirrors in sync when name/email/role change.
          try {
            await propagateUserToServices({
              id: user.id,
              email: user.email,
              name: user.name,
              role: (user as { role?: string }).role ?? "patient",
            });
          } catch (err) {
            console.error("[auth] failed to propagate user update", err);
          }
        },
      },
    },
  },

  trustedOrigins: (
    process.env.CORS_ORIGINS ||
    process.env.CLIENT_URL ||
    "http://localhost:3000,http://localhost:5173,http://localhost:5174"
  ).split(","),

  advanced: {
    database: {
      // Generate ids in app code (time-ordered UUIDv7, same format as everywhere else).
      // This was `generateId: false`, which makes Better Auth omit ids and expects the
      // database to supply them — our id columns have no default, so inserts into
      // user / session / account failed.
      generateId: () => uuidv7(),
    },
    // Only needed if frontend and auth are on different registrable domains.
    // For localhost:3000 -> localhost:4001 the default SameSite=Lax works.
    // cookies: {
    //   session_token: {
    //     attributes: { sameSite: "none", secure: true },
    //   },
    // },
  },
});

export type Auth = typeof auth;