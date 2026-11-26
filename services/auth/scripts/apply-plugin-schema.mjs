/**
 * Apply Better Auth plugin columns/tables without drizzle-kit push.
 * Usage (from services/auth): npm run db:apply-plugins
 */
import "dotenv/config";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = `
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "two_factor_enabled" boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS "twoFactor" (
  "id" text PRIMARY KEY NOT NULL,
  "secret" text NOT NULL,
  "backupCodes" text NOT NULL,
  "userId" text NOT NULL,
  "verified" boolean DEFAULT false,
  "failedVerificationCount" integer DEFAULT 0,
  "lockedUntil" timestamp
);

ALTER TABLE "twoFactor" ADD COLUMN IF NOT EXISTS "verified" boolean DEFAULT false;
ALTER TABLE "twoFactor" ADD COLUMN IF NOT EXISTS "failedVerificationCount" integer DEFAULT 0;
ALTER TABLE "twoFactor" ADD COLUMN IF NOT EXISTS "lockedUntil" timestamp;

CREATE INDEX IF NOT EXISTS "twoFactor_userId_idx" ON "twoFactor" ("userId");

CREATE TABLE IF NOT EXISTS "jwks" (
  "id" text PRIMARY KEY NOT NULL,
  "publicKey" text NOT NULL,
  "privateKey" text NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "expiresAt" timestamp,
  "alg" text,
  "crv" text
);

ALTER TABLE "jwks" ADD COLUMN IF NOT EXISTS "alg" text;
ALTER TABLE "jwks" ADD COLUMN IF NOT EXISTS "crv" text;
`;

const pool = new pg.Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(sql);
  console.log("OK: Better Auth plugin schema applied (twoFactor + jwks + user.two_factor_enabled)");
} catch (e) {
  console.error("FAILED:", e.message);
  process.exit(1);
} finally {
  await pool.end();
}
