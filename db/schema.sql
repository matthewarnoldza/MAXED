-- MAXED memory substrate (libSQL / Turso)
-- Tiny and flat. Layer 1 (durable prefs) is hand-edited; Layer 2 (PBs, recent,
-- trend) is computed from `sets` + `workouts` at context-build time.

-- Exercise catalogue ------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercises (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT UNIQUE NOT NULL,
  muscle_group TEXT,
  equipment    TEXT
);

-- Layer 1 · durable, explicit preferences --------------------------------
CREATE TABLE IF NOT EXISTS preferences (
  key        TEXT PRIMARY KEY,        -- goal | equipment | split_style | rest_default | ...
  value      TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- how the athlete feels about each movement — the "no deadlifts" memory
CREATE TABLE IF NOT EXISTS exercise_prefs (
  exercise_id INTEGER PRIMARY KEY REFERENCES exercises(id) ON DELETE CASCADE,
  stance      TEXT CHECK (stance IN ('love','like','avoid','banned')),
  note        TEXT,
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- Workouts + their prescribed exercises ----------------------------------
CREATE TABLE IF NOT EXISTS workouts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  focus      TEXT,
  status     TEXT DEFAULT 'planned' CHECK (status IN ('planned','active','done','discarded')),
  source     TEXT DEFAULT 'manual',  -- manual | assistant
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id    INTEGER REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id   INTEGER REFERENCES exercises(id),
  position      INTEGER,
  target_sets   INTEGER,
  target_reps   INTEGER,
  target_weight REAL
);

-- Layer 2 source · every set you log (also the PB source of truth) --------
CREATE TABLE IF NOT EXISTS sets (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id INTEGER REFERENCES exercises(id),
  workout_id  INTEGER REFERENCES workouts(id),
  weight      REAL,
  reps        INTEGER,
  logged_at   TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sets_exercise ON sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_sets_logged   ON sets(logged_at);
CREATE INDEX IF NOT EXISTS idx_we_workout    ON workout_exercises(workout_id);
