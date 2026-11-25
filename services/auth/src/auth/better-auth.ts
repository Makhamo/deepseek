import type { Database } from '@uhs/service-kit';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { jwt, organization, twoFactor } from 'better-auth/plugins';
import type { ServiceConfig } from '../config.js';

/**
 * Better Auth owns accounts, sessions, MFA, organisations (tenants) and
 * memberships (spec §5). Other services never import this: they verify the
 * issued JWTs against the JWKS.
 *
 * The auth tables are generated with `npm run db:auth-generate` once the
 * Better Auth schema is finalised; they live in this service's database only.
 */
export function createAuth(config: ServiceConfig, database: Database) {
  return betterAuth({
    appName: 'UHS',
    baseURL: config.BETTER_AUTH_URL,
    secret: config.BETTER_AUTH_SECRET,
    database: drizzleAdapter(database.db, { provider: 'pg' }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60,
    },
    plugins: [
      // A tenant is a Better Auth organisation; a facility is a team.
      organization(),
      // Issues the access token described in spec §5.5.
      jwt(),
      // MFA is mandatory for staff memberships.
      twoFactor(),
    ],
    advanced: {
      database: { generateId: false },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
