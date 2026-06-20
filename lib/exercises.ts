/** Static starter exercise library — also used to seed the Turso `exercises` table. */
export type Category = "PUSH" | "PULL" | "LEGS";

export interface Exercise {
  name: string;
  cat: Category;
  m: string; // primary muscle
}

export const EXERCISES: Exercise[] = [
  { name: "Back Squat", cat: "LEGS", m: "QUADS" },
  { name: "Barbell Row", cat: "PULL", m: "BACK" },
  { name: "Bench Press", cat: "PUSH", m: "CHEST" },
  { name: "Bulgarian Split Squat", cat: "LEGS", m: "QUADS" },
  { name: "Deadlift", cat: "PULL", m: "POSTERIOR" },
  { name: "Dips", cat: "PUSH", m: "TRICEPS" },
  { name: "Incline DB Press", cat: "PUSH", m: "CHEST" },
  { name: "Lat Pulldown", cat: "PULL", m: "BACK" },
  { name: "Lateral Raise", cat: "PUSH", m: "DELTS" },
  { name: "Leg Press", cat: "LEGS", m: "QUADS" },
  { name: "Overhead Press", cat: "PUSH", m: "SHOULDERS" },
  { name: "Pull-up", cat: "PULL", m: "BACK" },
  { name: "Romanian Deadlift", cat: "LEGS", m: "HAMS" },
];

export const CATEGORIES = ["ALL", "PUSH", "PULL", "LEGS"] as const;
export type Filter = (typeof CATEGORIES)[number];

/** Equipment hint used only when seeding the DB. */
export const EQUIPMENT: Record<string, string> = {
  "Back Squat": "barbell",
  "Barbell Row": "barbell",
  "Bench Press": "barbell",
  "Bulgarian Split Squat": "dumbbell",
  Deadlift: "barbell",
  Dips: "bodyweight",
  "Incline DB Press": "dumbbell",
  "Lat Pulldown": "cable",
  "Lateral Raise": "dumbbell",
  "Leg Press": "machine",
  "Overhead Press": "barbell",
  "Pull-up": "bodyweight",
  "Romanian Deadlift": "barbell",
};
