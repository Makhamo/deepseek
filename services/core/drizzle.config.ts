import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.MIGRATION_DATABASE_URL ??
      'postgresql://uhs_migrator:uhs_migrator@localhost:5432/uhs_core',
  },
  strict: true,
  verbose: true,
});
