/**
 * Create the core identity tables ONLY if some are missing.
 *
 * Safety rules (this runs against real databases):
 *  - If every core table already exists this does nothing at all (no DDL, no seed).
 *  - When something is missing it runs migrations/0004_core_identity.sql, which only
 *    uses CREATE ... IF NOT EXISTS. It never ALTERs, drops or seeds existing tables.
 *  - Set AUTH_AUTO_SCHEMA=false to turn it off completely.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./index.js";

const here = path.dirname(fileURLToPath(import.meta.url));
// src/db (tsx) and dist/db (tsc) both sit two levels below the service root.
const MIGRATIONS_DIR = path.resolve(here, "../../migrations");
const CORE_FILE = "0004_core_identity.sql";

/** Tables registration + sign-in need. */
export const CORE_TABLES = [
  "users",
  "user_credentials",
  "user",
  "session",
  "account",
  "verification",
  "patient_profile",
] as const;

/** 42P01 = undefined_table (e.g. `relation "user" does not exist`). */
export function isMissingTable(err: unknown): boolean {
  const e = err as { code?: string; message?: string; cause?: { code?: string; message?: string } };
  if ((e?.code ?? e?.cause?.code) === "42P01") return true;
  return /relation "[^"]+" does not exist/i.test(`${e?.message ?? ""} ${e?.cause?.message ?? ""}`);
}

/** Missing table OR missing column — the database doesn't match what the code expects. */
export function isSchemaProblem(err: unknown): boolean {
  const e = err as { code?: string; message?: string; cause?: { code?: string; message?: string } };
  const code = e?.code ?? e?.cause?.code;
  if (code === "42P01" || code === "42703") return true;
  return /(relation|column) "[^"]+" (of relation "[^"]+" )?does not exist/i.test(
    `${e?.message ?? ""} ${e?.cause?.message ?? ""}`
  );
}

export async function missingCoreTables(): Promise<string[]> {
  const r = await pool.query(
    `SELECT t AS name, to_regclass('public."' || t || '"') IS NULL AS missing
       FROM unnest($1::text[]) AS t`,
    [CORE_TABLES as unknown as string[]]
  );
  return r.rows.filter((x) => x.missing).map((x) => x.name as string);
}

let inflight: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (process.env.AUTH_AUTO_SCHEMA === "false") return Promise.resolve();
  if (inflight) return inflight;

  inflight = (async () => {
    const missing = await missingCoreTables();
    if (missing.length === 0) return; // healthy database: touch nothing

    console.warn(`[db] missing core tables: ${missing.join(", ")} — creating them (IF NOT EXISTS only)…`);
    const file = path.join(MIGRATIONS_DIR, CORE_FILE);
    if (!fs.existsSync(file)) throw new Error(`Migration file not found: ${file}`);

    const client = await pool.connect();
    try {
      await client.query(fs.readFileSync(file, "utf8"));
      console.log("[db] core tables created ✔");
    } catch (err) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}
