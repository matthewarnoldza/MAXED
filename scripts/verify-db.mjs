#!/usr/bin/env node
/**
 * Verify the Turso/libSQL setup: connect, list tables, show the multi-user
 * schema, and round-trip a read/write on user_state to prove the token has RW.
 *
 *   node scripts/verify-db.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const val = m[2].replace(/^["']|["']$/g, "");
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}
loadEnv(join(root, ".env.local"));
loadEnv(join(root, ".env"));

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) {
  console.error("✗ TURSO_DATABASE_URL not set");
  process.exit(1);
}
console.log("• Connecting to", url.replace(/\/\/.*@/, "//"));
const db = createClient({ url, authToken });

try {
  const { rows: tables } = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '\\_%' ESCAPE '\\' ORDER BY name"
  );
  const names = tables.map((r) => r.name);
  console.log("• Tables:", names.length ? names.join(", ") : "(none)");

  for (const t of names) {
    const { rows } = await db.execute(`SELECT COUNT(*) AS n FROM "${t}"`);
    console.log(`    - ${t}: ${rows[0].n} rows`);
  }

  const hasUsers = names.includes("users");
  const hasState = names.includes("user_state");
  console.log(`• Multi-user schema present: users=${hasUsers ? "✓" : "✗"} user_state=${hasState ? "✓" : "✗"}`);

  if (hasUsers && hasState) {
    // round-trip RW test on a throwaway user
    const id = "verify-" + Math.random().toString(36).slice(2, 10);
    await db.execute({ sql: "INSERT INTO users (id, name) VALUES (?, ?)", args: [id, "verify-bot"] });
    await db.execute({
      sql: "INSERT INTO user_state (user_id, data) VALUES (?, ?)",
      args: [id, JSON.stringify({ hello: "world", sessions: [] })],
    });
    const { rows } = await db.execute({ sql: "SELECT data FROM user_state WHERE user_id = ?", args: [id] });
    const ok = rows[0] && JSON.parse(rows[0].data).hello === "world";
    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [id] }); // cascade clears user_state
    const { rows: left } = await db.execute({ sql: "SELECT COUNT(*) AS n FROM user_state WHERE user_id = ?", args: [id] });
    console.log(`• Round-trip RW test: write+read ${ok ? "✓" : "✗"}, cascade delete ${left[0].n === 0 ? "✓" : "✗"}`);
    console.log(ok && left[0].n === 0 ? "\n✓ Database is correctly set up and writable." : "\n✗ Round-trip failed.");
  } else {
    console.log("\n→ Run `node scripts/migrate.mjs --reset` to create the multi-user schema.");
  }
} catch (err) {
  console.error("✗ Verify failed:", err?.message || err);
  process.exit(1);
} finally {
  db.close();
}
