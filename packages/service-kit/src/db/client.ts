import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export type Db = NodePgDatabase<Record<string, never>>;

/** The transaction handle passed to handlers running under a tenant. */
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

export interface Database {
  readonly pool: Pool;
  readonly db: Db;
  /**
   * Runs `fn` inside a transaction whose `app.tenant_id` is set locally
   * (spec §7.3). The setting is the third argument `true`, so it is scoped to
   * the transaction and can never leak across pooled connections.
   */
  withTenant: <T>(tenantId: string, fn: (tx: Tx) => Promise<T>) => Promise<T>;
  ping: () => Promise<void>;
  close: () => Promise<void>;
}

export function createDatabase(connectionString: string, maxConnections = 10): Database {
  const pool = new Pool({ connectionString, max: maxConnections });
  const db = drizzle(pool);

  return {
    pool,
    db,
    async withTenant<T>(tenantId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
      return db.transaction(async (tx) => {
        await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`);
        return fn(tx);
      });
    },
    async ping(): Promise<void> {
      await pool.query('select 1');
    },
    async close(): Promise<void> {
      await pool.end();
    },
  };
}
