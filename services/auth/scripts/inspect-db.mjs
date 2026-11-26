/**
 * READ-ONLY. Lists every table in the auth database with its row count and columns,
 * and marks the tables that older versions of this project's setup scripts create.
 * Nothing is changed. Usage: npm run db:inspect
 */
import "dotenv/config";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (services/auth/.env)");
  process.exit(1);
}

// Tables the project's own scripts (0002 / 0004) may have created.
const projectTables = new Set([
  "user", "session", "account", "verification", "patient_profile", "twoFactor", "jwks",
  "organization", "member", "invitation", "department", "service", "organization_service",
  "permission", "role_permission", "service_registry", "staff_profile",
  "held_event", "inbox", "outbox",
]);

const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
  const tables = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  console.log(`\n${tables.rows.length} tables in public\n`);
  for (const { tablename } of tables.rows) {
    const cols = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns
        WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,
      [tablename]
    );
    let n = "?";
    try {
      n = (await pool.query(`SELECT COUNT(*)::int AS n FROM "${tablename}"`)).rows[0].n;
    } catch {}
    const flag = projectTables.has(tablename) ? "  <-- also created by project scripts" : "";
    console.log(`${tablename}  (${n} rows)${flag}`);
    console.log("   " + cols.rows.map((c) => `${c.column_name}:${c.data_type}`).join(", "));
  }
  console.log(
    "\nNothing was modified. Tables flagged above may be yours or may have been created by a " +
      "setup script — compare with your original table list before dropping anything."
  );
} finally {
  await pool.end();
}
