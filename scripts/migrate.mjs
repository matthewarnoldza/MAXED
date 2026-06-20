#!/usr/bin/env node
/**
 * MAXED DB migration / seed.
 *
 *   node scripts/migrate.mjs            # apply schema.sql (idempotent)
 *   node scripts/migrate.mjs --seed     # schema + seed.sql
 *   node scripts/migrate.mjs --reset    # drop all tables, then schema
 *   node scripts/migrate.mjs --reset --seed
 *
 * Run this where Turso is reachable (your machine or CI) — this app's hosted
 * web environment may block the Turso host by network policy.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// --- tiny .env.local loader (no extra deps) ---
function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv(join(root, ".env.local"));
loadEnv(join(root, ".env"));

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) {
  console.error("✗ TURSO_DATABASE_URL is not set (.env.local or environment).");
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
const doReset = args.has("--reset");
const doSeed = args.has("--seed");

const client = createClient({ url, authToken });

const DROP = `
DROP TABLE IF EXISTS sets;
DROP TABLE IF EXISTS workout_exercises;
DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS exercise_prefs;
DROP TABLE IF EXISTS preferences;
DROP TABLE IF EXISTS exercises;
`;

try {
  if (doReset) {
    console.log("• Dropping existing tables…");
    await client.executeMultiple(DROP);
  }

  console.log("• Applying schema.sql…");
  await client.executeMultiple(readFileSync(join(root, "db", "schema.sql"), "utf8"));

  if (doSeed) {
    console.log("• Applying seed.sql…");
    await client.executeMultiple(readFileSync(join(root, "db", "seed.sql"), "utf8"));
  }

  const { rows } = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log("✓ Done. Tables:", rows.map((r) => r.name).join(", "));
} catch (err) {
  console.error("✗ Migration failed:", err?.message || err);
  process.exit(1);
} finally {
  client.close();
}
