/**
 * Prefer: npm run db:push  or  npm run db:apply-plugins
 * This CLI was from the monorepo service-kit; auth is standalone now.
 */
console.error(
  "Use: npm run db:push   or   npm run db:apply-plugins\n" +
    "(migrate-cli via @uhs/service-kit is not used in this standalone auth hub)"
);
process.exit(1);
