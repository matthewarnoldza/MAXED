/** Shared domain types for the MAXED client. Kept dependency-free so both the
 *  store and the pure derivation helpers can import them without cycles. */

export type Stance = "love" | "avoid" | "banned";

/** A lift as it sits in the editable plan. */
export interface PlanLift {
  id: number;
  name: string;
  sets: number;
  reps: number;
  kg: number;
}

/** One logged working set. `pb` flags it as a personal best at log time. */
export interface LoggedSet {
  w: number;
  r: number;
  pb?: boolean;
}

/** All the sets logged for one exercise within a single session. */
export interface SessionEntry {
  name: string;
  sets: LoggedSet[];
}

/** A completed (or in-progress, once finished) workout, newest stored first. */
export interface Session {
  id: number;
  dateISO: string;
  focus: string;
  title: string;
  entries: SessionEntry[];
}

/** Durable, stated preferences — Layer 1 of the memory. */
export interface Prefs {
  goal: string;
  equipment: string;
  split_style: string;
  rest_default: number; // seconds
}

/** A lift inside an AI-generated / synthesised plan (display-shaped). */
export interface GeneratedLift {
  name: string;
  sets: number;
  reps: number;
  load: string; // "+2.5" | "26" | "BW"
  note?: string;
}

export interface GeneratedPlan {
  title: string; // may contain a "\n" to stack onto two lines
  focus: string;
  meta: string; // "6 LIFTS · 22 SETS · ~48 MIN · HYPERTROPHY"
  prompt: string;
  lifts: GeneratedLift[];
}
