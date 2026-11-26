/**
 * Apply full auth schema + seed against DATABASE_URL.
 * Usage: npm run db:bootstrap
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env without dotenv dependency
for (const candidate of [
  path.join(__dirname, "../.env"),
  path.join(process.cwd(), ".env"),
]) {
  if (fs.existsSync(candidate)) {
    for (const line of fs.readFileSync(candidate, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (process.env[k] === undefined) process.env[k] = v;
    }
    break;
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (put it in services/auth/.env)");
  process.exit(1);
}

const files = [
  "migrations/0002_full_auth_schema.sql",
  "migrations/0003_seed.sql",
];

const pool = new pg.Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    // Safety: never layer the Better-Auth/domain schema on top of an existing identity DB.
    const existing = await client.query(
      `SELECT to_regclass('public.users') AS users, to_regclass('public.user_credentials') AS creds`
    );
    if ((existing.rows[0].users || existing.rows[0].creds) && !process.argv.includes("--force")) {
      console.error(
        'This database already has a "users" table, so the full bootstrap was NOT run.\n' +
          "The auth service creates only the missing core tables on startup by itself.\n" +
          "Run `npm run db:inspect` to review the database. Use --force only if you are sure."
      );
      process.exit(1);
    }
    for (const rel of files) {
      const full = path.join(__dirname, "..", rel);
      if (!fs.existsSync(full)) {
        console.error("Missing", full);
        process.exit(1);
      }
      const sql = fs.readFileSync(full, "utf8");
      console.log("Applying", rel, "...");
      await client.query(sql);
      console.log("  OK", rel);
    }

    const tables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    console.log("\nTables in public schema:");
    for (const r of tables.rows) console.log(" -", r.tablename);

    const userCheck = await client.query(`SELECT COUNT(*)::int AS n FROM "user"`);
    console.log(`\nuser rows: ${userCheck.rows[0].n}`);
    console.log("BOOTSTRAP COMPLETE — restart auth (npm run dev) and retry signup.");
  } catch (e) {
    console.error("FAILED:", e.message);
    if (e.position) console.error("position:", e.position);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
