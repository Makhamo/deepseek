-- Core identity tables (idempotent, NON-DESTRUCTIVE).
--
-- Only ever CREATE ... IF NOT EXISTS. It never ALTERs, drops or seeds anything, so it
-- is a no-op on a database that already has these tables. Run automatically on startup
-- only when one of them is missing.
--
--   users / user_credentials   canonical identity registry (matches the production auth DB)
--   user, session, account,    Better Auth tables (sessions + sign-in). Their ids are the
--   verification, jwks,        SAME uuid as users.id, so users.id = user.id =
--   twoFactor                  account.user_id = patient_profile.user_id = patient id.
--   patient_profile            demographics, id = user id

BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" citext NOT NULL CONSTRAINT "users_email_key" UNIQUE,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "phone" text,
  "status" text DEFAULT 'active' NOT NULL,
  "email_verified_at" timestamp with time zone,
  "last_login_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid REFERENCES "users"("id"),
  "updated_by" uuid REFERENCES "users"("id"),
  "deleted_at" timestamp with time zone,
  "deleted_by" uuid REFERENCES "users"("id"),
  "is_active" boolean DEFAULT true NOT NULL,
  CONSTRAINT "users_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'locked'::text, 'disabled'::text])))
);

CREATE TABLE IF NOT EXISTS "user_credentials" (
  "user_id" uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "password_hash" text NOT NULL,
  "password_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "must_change" boolean DEFAULT false NOT NULL,
  "failed_attempts" integer DEFAULT 0 NOT NULL,
  "locked_until" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid REFERENCES "users"("id"),
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" uuid REFERENCES "users"("id"),
  "deleted_at" timestamp with time zone,
  "deleted_by" uuid REFERENCES "users"("id"),
  "is_active" boolean DEFAULT true NOT NULL,
  CONSTRAINT "user_credentials_failed_attempts_check" CHECK ((failed_attempts >= 0))
);

CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "email_verified" boolean NOT NULL DEFAULT false,
  "image" text,
  "role" text DEFAULT 'patient',
  "banned" boolean DEFAULT false,
  "ban_reason" text,
  "ban_expires" timestamp,
  "two_factor_enabled" boolean DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY NOT NULL,
  "expires_at" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "ip_address" text,
  "user_agent" text,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "active_organization_id" text,
  "impersonated_by" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY NOT NULL,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamp,
  "refresh_token_expires_at" timestamp,
  "scope" text,
  "password" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "patient_profile" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "date_of_birth" timestamp,
  "gender" text,
  "blood_type" text,
  "phone" text,
  "address" text,
  "emergency_contact_name" text,
  "emergency_contact_phone" text,
  "medical_aid_number" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "twoFactor" (
  "id" text PRIMARY KEY NOT NULL,
  "secret" text NOT NULL,
  "backupCodes" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "verified" boolean DEFAULT false,
  "failedVerificationCount" integer DEFAULT 0,
  "lockedUntil" timestamp
);
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

COMMIT;
