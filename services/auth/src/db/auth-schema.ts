/**
 * Better Auth table definitions (user, session, account, verification,
 * organization, member, invitation, twoFactor) belong here.
 *
 * Generate them once the auth schema is finalised:
 *
 *   npm run db:auth-generate --workspace @uhs/auth
 *
 * then re-export the generated tables from ./schema.ts so drizzle-kit includes
 * them in this service's migrations. They are intentionally absent until then:
 * this service owns its database and no other service may depend on auth's
 * tables.
 */
export {};
