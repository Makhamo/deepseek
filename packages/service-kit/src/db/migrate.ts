import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

/**
 * Applies this service's drizzle migrations using MIGRATION_DATABASE_URL, the
 * owner role. The runtime role (uhs_app) has no DDL rights (spec §6.1).
 */
export async function runMigrations(options: {
  databaseUrl: string;
  migrationsFolder: string;
}): Promise<void> {
  const pool = new Pool({ connectionString: options.databaseUrl, max: 1 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: options.migrationsFolder });
  } finally {
    await pool.end();
  }
}
