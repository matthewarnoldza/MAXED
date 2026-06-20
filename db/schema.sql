-- MAXED cloud store (libSQL / Turso) — multi-user.
--
-- Each person is one row in `users`. ALL of their app data (logged sessions,
-- current plan, PBs are derived, stated preferences, movement stances) lives as a
-- single JSON document in `user_state`, kept in sync from the client. Tiny, and
-- trivially partitioned per user — exactly right for a household of a few people.
-- The structured-memory pattern is unchanged; the document just rides in one cell.

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,           -- random, unguessable id (not enumerable)
  name       TEXT NOT NULL,              -- display name ("Matt")
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_state (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- JSON: { startDateISO, prefs, stances, sessions, planTitle, planFocus, plan }
  data       TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
