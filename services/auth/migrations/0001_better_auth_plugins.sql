-- Better Auth plugins: twoFactor + jwt (jwks)
-- Idempotent — safe to re-run.

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "two_factor_enabled" boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS "twoFactor" (
  "id" text PRIMARY KEY NOT NULL,
  "secret" text NOT NULL,
  "backupCodes" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
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
