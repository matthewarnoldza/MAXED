/** Exercise library — grouped by muscle for the custom workout builder. */
export type Category = "PUSH" | "PULL" | "LEGS" | "CORE";

export interface Exercise {
  name: string;
  cat: Category;
  group: string; // display section ("Chest", "Back", …)
  m: string; // primary muscle (row subtitle)
  equip: string; // barbell | dumbbell | cable | machine | bodyweight | kettlebell
}

export const EXERCISES: Exercise[] = [
  // ---- Chest ----
  { name: "Barbell Bench Press", cat: "PUSH", group: "Chest", m: "CHEST", equip: "barbell" },
  { name: "Incline Barbell Press", cat: "PUSH", group: "Chest", m: "UPPER CHEST", equip: "barbell" },
  { name: "Incline DB Press", cat: "PUSH", group: "Chest", m: "UPPER CHEST", equip: "dumbbell" },
  { name: "Flat DB Press", cat: "PUSH", group: "Chest", m: "CHEST", equip: "dumbbell" },
  { name: "Dips", cat: "PUSH", group: "Chest", m: "LOWER CHEST", equip: "bodyweight" },
  { name: "Cable Fly", cat: "PUSH", group: "Chest", m: "CHEST", equip: "cable" },
  { name: "Pec Deck", cat: "PUSH", group: "Chest", m: "CHEST", equip: "machine" },
  { name: "Push-up", cat: "PUSH", group: "Chest", m: "CHEST", equip: "bodyweight" },

  // ---- Back ----
  { name: "Deadlift", cat: "PULL", group: "Back", m: "POSTERIOR CHAIN", equip: "barbell" },
  { name: "Barbell Row", cat: "PULL", group: "Back", m: "MID BACK", equip: "barbell" },
  { name: "Pendlay Row", cat: "PULL", group: "Back", m: "MID BACK", equip: "barbell" },
  { name: "Lat Pulldown", cat: "PULL", group: "Back", m: "LATS", equip: "cable" },
  { name: "Pull-up", cat: "PULL", group: "Back", m: "LATS", equip: "bodyweight" },
  { name: "Chin-up", cat: "PULL", group: "Back", m: "LATS / BICEPS", equip: "bodyweight" },
  { name: "Seated Cable Row", cat: "PULL", group: "Back", m: "MID BACK", equip: "cable" },
  { name: "Single-arm DB Row", cat: "PULL", group: "Back", m: "MID BACK", equip: "dumbbell" },
  { name: "T-Bar Row", cat: "PULL", group: "Back", m: "MID BACK", equip: "machine" },
  { name: "Face Pull", cat: "PULL", group: "Back", m: "REAR DELTS", equip: "cable" },
  { name: "Back Extension", cat: "PULL", group: "Back", m: "LOWER BACK", equip: "bodyweight" },

  // ---- Shoulders ----
  { name: "Overhead Press", cat: "PUSH", group: "Shoulders", m: "SHOULDERS", equip: "barbell" },
  { name: "Seated DB Press", cat: "PUSH", group: "Shoulders", m: "SHOULDERS", equip: "dumbbell" },
  { name: "Arnold Press", cat: "PUSH", group: "Shoulders", m: "SHOULDERS", equip: "dumbbell" },
  { name: "Lateral Raise", cat: "PUSH", group: "Shoulders", m: "SIDE DELTS", equip: "dumbbell" },
  { name: "Cable Lateral Raise", cat: "PUSH", group: "Shoulders", m: "SIDE DELTS", equip: "cable" },
  { name: "Rear Delt Fly", cat: "PULL", group: "Shoulders", m: "REAR DELTS", equip: "dumbbell" },
  { name: "Upright Row", cat: "PULL", group: "Shoulders", m: "DELTS / TRAPS", equip: "barbell" },
  { name: "Barbell Shrug", cat: "PULL", group: "Shoulders", m: "TRAPS", equip: "barbell" },

  // ---- Biceps ----
  { name: "Barbell Curl", cat: "PULL", group: "Biceps", m: "BICEPS", equip: "barbell" },
  { name: "DB Curl", cat: "PULL", group: "Biceps", m: "BICEPS", equip: "dumbbell" },
  { name: "Hammer Curl", cat: "PULL", group: "Biceps", m: "BICEPS / FOREARM", equip: "dumbbell" },
  { name: "Cable Curl", cat: "PULL", group: "Biceps", m: "BICEPS", equip: "cable" },
  { name: "Preacher Curl", cat: "PULL", group: "Biceps", m: "BICEPS", equip: "machine" },

  // ---- Triceps ----
  { name: "Triceps Pushdown", cat: "PUSH", group: "Triceps", m: "TRICEPS", equip: "cable" },
  { name: "Overhead Triceps Extension", cat: "PUSH", group: "Triceps", m: "TRICEPS", equip: "dumbbell" },
  { name: "Skull Crusher", cat: "PUSH", group: "Triceps", m: "TRICEPS", equip: "barbell" },
  { name: "Close-grip Bench Press", cat: "PUSH", group: "Triceps", m: "TRICEPS", equip: "barbell" },
  { name: "Bench Dip", cat: "PUSH", group: "Triceps", m: "TRICEPS", equip: "bodyweight" },

  // ---- Quads ----
  { name: "Back Squat", cat: "LEGS", group: "Quads", m: "QUADS", equip: "barbell" },
  { name: "Front Squat", cat: "LEGS", group: "Quads", m: "QUADS", equip: "barbell" },
  { name: "Leg Press", cat: "LEGS", group: "Quads", m: "QUADS", equip: "machine" },
  { name: "Hack Squat", cat: "LEGS", group: "Quads", m: "QUADS", equip: "machine" },
  { name: "Bulgarian Split Squat", cat: "LEGS", group: "Quads", m: "QUADS / GLUTES", equip: "dumbbell" },
  { name: "Walking Lunge", cat: "LEGS", group: "Quads", m: "QUADS / GLUTES", equip: "dumbbell" },
  { name: "Goblet Squat", cat: "LEGS", group: "Quads", m: "QUADS", equip: "dumbbell" },
  { name: "Leg Extension", cat: "LEGS", group: "Quads", m: "QUADS", equip: "machine" },

  // ---- Hamstrings ----
  { name: "Romanian Deadlift", cat: "LEGS", group: "Hamstrings", m: "HAMSTRINGS", equip: "barbell" },
  { name: "Stiff-leg Deadlift", cat: "LEGS", group: "Hamstrings", m: "HAMSTRINGS", equip: "barbell" },
  { name: "Lying Leg Curl", cat: "LEGS", group: "Hamstrings", m: "HAMSTRINGS", equip: "machine" },
  { name: "Seated Leg Curl", cat: "LEGS", group: "Hamstrings", m: "HAMSTRINGS", equip: "machine" },
  { name: "Good Morning", cat: "LEGS", group: "Hamstrings", m: "HAMSTRINGS", equip: "barbell" },

  // ---- Glutes ----
  { name: "Hip Thrust", cat: "LEGS", group: "Glutes", m: "GLUTES", equip: "barbell" },
  { name: "Glute Bridge", cat: "LEGS", group: "Glutes", m: "GLUTES", equip: "bodyweight" },
  { name: "Cable Kickback", cat: "LEGS", group: "Glutes", m: "GLUTES", equip: "cable" },

  // ---- Calves ----
  { name: "Standing Calf Raise", cat: "LEGS", group: "Calves", m: "CALVES", equip: "machine" },
  { name: "Seated Calf Raise", cat: "LEGS", group: "Calves", m: "CALVES", equip: "machine" },

  // ---- Core ----
  { name: "Plank", cat: "CORE", group: "Core", m: "CORE", equip: "bodyweight" },
  { name: "Hanging Leg Raise", cat: "CORE", group: "Core", m: "LOWER ABS", equip: "bodyweight" },
  { name: "Cable Crunch", cat: "CORE", group: "Core", m: "ABS", equip: "cable" },
  { name: "Ab Wheel", cat: "CORE", group: "Core", m: "CORE", equip: "bodyweight" },
  { name: "Russian Twist", cat: "CORE", group: "Core", m: "OBLIQUES", equip: "bodyweight" },

  // ---- Full body ----
  { name: "Kettlebell Swing", cat: "LEGS", group: "Full body", m: "POSTERIOR CHAIN", equip: "kettlebell" },
  { name: "Power Clean", cat: "PULL", group: "Full body", m: "FULL BODY", equip: "barbell" },
];

/** Logical display order for the grouped library. */
export const GROUP_ORDER = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Core",
  "Full body",
];

export const CATEGORIES = ["ALL", "PUSH", "PULL", "LEGS", "CORE"] as const;
export type Filter = (typeof CATEGORIES)[number];

/** Equipment lookup, derived from the library (used by the on-device generator). */
export const EQUIPMENT: Record<string, string> = Object.fromEntries(EXERCISES.map((e) => [e.name, e.equip]));
