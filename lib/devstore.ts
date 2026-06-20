import "server-only";

/**
 * In-memory fallback so MAXED is fully functional in local dev with NO Turso
 * configured — sign in, log, switch users all work against this process-local
 * store. It lives on globalThis so it survives Next dev's HMR module reloads.
 *
 * Production always has Turso set, so this path is never used there (and would
 * not persist across serverless instances anyway).
 */
interface UserRow {
  id: string;
  name: string;
}

const g = globalThis as unknown as {
  __maxedMem?: { users: Map<string, UserRow>; state: Map<string, string> };
};

export const mem =
  g.__maxedMem ?? (g.__maxedMem = { users: new Map<string, UserRow>(), state: new Map<string, string>() });
