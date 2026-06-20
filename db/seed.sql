-- Starter data so the context packet has something to assemble on day one.

-- Exercise library --------------------------------------------------------
INSERT OR IGNORE INTO exercises (name, muscle_group, equipment) VALUES
  ('Back Squat',            'QUADS',     'barbell'),
  ('Barbell Row',           'BACK',      'barbell'),
  ('Bench Press',           'CHEST',     'barbell'),
  ('Bulgarian Split Squat', 'QUADS',     'dumbbell'),
  ('Deadlift',              'POSTERIOR', 'barbell'),
  ('Dips',                  'TRICEPS',   'bodyweight'),
  ('Incline DB Press',      'CHEST',     'dumbbell'),
  ('Lat Pulldown',          'BACK',      'cable'),
  ('Lateral Raise',         'DELTS',     'dumbbell'),
  ('Leg Press',             'QUADS',     'machine'),
  ('Overhead Press',        'SHOULDERS', 'barbell'),
  ('Pull-up',               'BACK',      'bodyweight'),
  ('Romanian Deadlift',     'HAMS',      'barbell'),
  ('Cable Row',             'BACK',      'cable'),
  ('Cable Fly',             'CHEST',     'cable');

-- Layer 1 · durable preferences ------------------------------------------
INSERT INTO preferences (key, value) VALUES
  ('goal',         'fat loss + muscle · 2100 kcal · 184g protein'),
  ('equipment',    'full commercial gym'),
  ('split_style',  'heavy compound bias · 45 min'),
  ('rest_default', '120')
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now');

-- Stances — the "no deadlifts" memory
INSERT INTO exercise_prefs (exercise_id, stance, note)
  SELECT id, 'banned', 'lower back' FROM exercises WHERE name = 'Deadlift'
ON CONFLICT(exercise_id) DO UPDATE SET stance = excluded.stance, note = excluded.note;
INSERT INTO exercise_prefs (exercise_id, stance, note)
  SELECT id, 'love', NULL FROM exercises WHERE name = 'Incline DB Press'
ON CONFLICT(exercise_id) DO UPDATE SET stance = excluded.stance;
INSERT INTO exercise_prefs (exercise_id, stance, note)
  SELECT id, 'love', NULL FROM exercises WHERE name = 'Cable Row'
ON CONFLICT(exercise_id) DO UPDATE SET stance = excluded.stance;
INSERT INTO exercise_prefs (exercise_id, stance, note)
  SELECT id, 'love', NULL FROM exercises WHERE name = 'Romanian Deadlift'
ON CONFLICT(exercise_id) DO UPDATE SET stance = excluded.stance;

-- A few finished workouts so "recent" + "PBs" populate -------------------
INSERT INTO workouts (id, focus, status, source, created_at) VALUES
  (1, 'Squat Day', 'done', 'manual', datetime('now','-14 days')),
  (2, 'Push Day',  'done', 'manual', datetime('now','-10 days')),
  (3, 'Squat Day', 'done', 'manual', datetime('now','-3 days'))
ON CONFLICT(id) DO NOTHING;

-- Logged sets (PB source of truth) ---------------------------------------
INSERT INTO sets (exercise_id, workout_id, weight, reps, logged_at)
  SELECT e.id, 1, 130, 5, datetime('now','-14 days') FROM exercises e WHERE e.name='Back Squat';
INSERT INTO sets (exercise_id, workout_id, weight, reps, logged_at)
  SELECT e.id, 3, 140, 3, datetime('now','-3 days') FROM exercises e WHERE e.name='Back Squat';
INSERT INTO sets (exercise_id, workout_id, weight, reps, logged_at)
  SELECT e.id, 2, 100, 8, datetime('now','-10 days') FROM exercises e WHERE e.name='Bench Press';
INSERT INTO sets (exercise_id, workout_id, weight, reps, logged_at)
  SELECT e.id, 2, 32, 8, datetime('now','-10 days') FROM exercises e WHERE e.name='Incline DB Press';
INSERT INTO sets (exercise_id, workout_id, weight, reps, logged_at)
  SELECT e.id, 1, 100, 8, datetime('now','-14 days') FROM exercises e WHERE e.name='Romanian Deadlift';
