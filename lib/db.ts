import "server-only";
import { createClient, type Client } from "@libsql/client";

/**
 * Turso (libSQL) client — server-only. Credentials never reach the browser.
 * Returns null when env is unset so routes can degrade gracefully (offline-first).
 */
let _client: Client | null = null;

export function getDb(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) return null;
  if (_client) return _client;
  _client = createClient({ url, authToken });
  return _client;
}
