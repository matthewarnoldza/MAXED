/**
 * Offline coach. When no OpenRouter key is configured we still want "Ask Coach"
 * to return a real, tailored plan — not one canned workout. This builds a
 * sensible session deterministically from the request + the athlete's own data:
 * it respects the banned list, favours loved lifts, matches the requested focus,
 * and biases logged lifts toward progressive overload over their current PB.
 */
import { EXERCISES, EQUIPMENT, type Category } from "./exercises";
import { pbFor } from "./derive";
import type { Session, Stance, GeneratedLift } from "./types";

export interface SynthInput {
  prompt: string;
  sessions: Session[];
  stances: Record<string, Stance>;
  goal: string;
}

export interface SynthResult {
  title: string;
  focus: string;
  duration_min: number;
  lifts: GeneratedLift[];
}

interface Move {
  name: string;
  cat: Category;
  m: string;
  equip: string;
}

const POOL: Move[] = EXERCISES.map((e) => ({ name: e.name, cat: e.cat, m: e.m, equip: EQUIPMENT[e.name] ?? "barbell" }));

export function synthWorkout(input: SynthInput): SynthResult {
  const p = input.prompt.toLowerCase();

  const duration = clamp(matchNumber(p) ?? 45, 20, 120);
  const { cats, label } = resolveFocus(p);
  const scheme = resolveScheme(input.goal, p);

  const banned = new Set(
    Object.entries(input.stances)
      .filter(([, v]) => v === "banned")
      .map(([k]) => k)
  );
  const avoid = new Set(
    Object.entries(input.stances)
      .filter(([, v]) => v === "avoid")
      .map(([k]) => k)
  );
  const loved = new Set(
    Object.entries(input.stances)
      .filter(([, v]) => v === "love")
      .map(([k]) => k)
  );

  // ad-hoc "no X" / "without X" parsing from the free text
  const inlineBan = (name: string) => {
    const n = name.toLowerCase();
    return /\bno\b|\bavoid\b|\bwithout\b|\bskip\b/.test(p) && p.includes(n.split(" ")[0]) && p.includes(n.split(" ").slice(-1)[0]);
  };

  const candidates = POOL.filter((mv) => cats.has(mv.cat) && !banned.has(mv.name) && !inlineBan(mv.name)).sort((a, b) => {
    // loved first, then lifts you have history on (overload targets), then avoid last, then compounds
    const score = (mv: Move) =>
      (loved.has(mv.name) ? -100 : 0) +
      (pbFor(input.sessions, mv.name) > 0 ? -20 : 0) +
      (avoid.has(mv.name) ? 200 : 0) +
      (isCompound(mv.name) ? -5 : 0);
    return score(a) - score(b);
  });

  const count = clamp(Math.round(duration / 9), 3, 6);
  const picks = pickSpread(candidates, count);

  const lifts: GeneratedLift[] = picks.map((mv, i) => {
    const compound = isCompound(mv.name);
    const sets = compound ? scheme.compoundSets : scheme.isoSets;
    const reps = compound ? scheme.compoundReps : scheme.isoReps;
    const pb = pbFor(input.sessions, mv.name);

    let load: string;
    let note: string | undefined;
    if (mv.equip === "bodyweight") {
      load = "BW";
    } else if (pb > 0) {
      // progressive overload: nudge the first known compound up from PB
      if (i === 0 || compound) {
        load = `+${scheme.step}`;
        note = "overload vs last PB";
      } else {
        load = String(roundTo(pb * 0.9, 2.5));
      }
    } else {
      load = String(defaultLoad(mv, scheme));
    }
    if (loved.has(mv.name) && !note) note = "you love this one";

    return { name: mv.name, sets, reps, load, note };
  });

  return {
    title: `${label} Day`,
    focus: scheme.focus,
    duration_min: duration,
    lifts,
  };
}

function resolveFocus(p: string): { cats: Set<Category>; label: string } {
  const has = (...k: string[]) => k.some((w) => p.includes(w));
  // Legs FIRST: "leg day, no back squats" must not be hijacked by the "back" in
  // "back squats" matching the pull keywords. Arms are checked after push/pull so
  // "warm up" (contains "arm") can't false-match.
  if (has("leg", "squat", "quad", "glute", "ham", "calf", "lunge", "lower")) return { cats: new Set<Category>(["LEGS"]), label: "Leg" };
  if (has("push", "chest", "bench")) return { cats: new Set<Category>(["PUSH"]), label: "Push" };
  if (has("pull", "back", "row", "lat")) return { cats: new Set<Category>(["PULL"]), label: "Pull" };
  if (has("bicep", "tricep", "curl") || /\barms?\b/.test(p)) return { cats: new Set<Category>(["PUSH", "PULL"]), label: "Arm" };
  if (has("upper")) return { cats: new Set<Category>(["PUSH", "PULL"]), label: "Upper" };
  if (has("full", "total")) return { cats: new Set<Category>(["PUSH", "PULL", "LEGS"]), label: "Full Body" };
  return { cats: new Set<Category>(["PUSH", "PULL", "LEGS"]), label: "Full Body" };
}

interface Scheme {
  focus: string;
  compoundSets: number;
  compoundReps: number;
  isoSets: number;
  isoReps: number;
  step: number;
}

function resolveScheme(goal: string, p: string): Scheme {
  const g = `${goal} ${p}`.toLowerCase();
  if (/strength|power|heavy|1rm|max/.test(g))
    return { focus: "STRENGTH", compoundSets: 5, compoundReps: 5, isoSets: 3, isoReps: 8, step: 5 };
  if (/fat|cut|endur|condition|lean|shred/.test(g))
    return { focus: "CONDITIONING", compoundSets: 4, compoundReps: 12, isoSets: 3, isoReps: 15, step: 2.5 };
  return { focus: "HYPERTROPHY", compoundSets: 4, compoundReps: 8, isoSets: 3, isoReps: 12, step: 2.5 };
}

const COMPOUNDS = new Set([
  "Barbell Bench Press",
  "Incline Barbell Press",
  "Incline DB Press",
  "Flat DB Press",
  "Close-grip Bench Press",
  "Back Squat",
  "Front Squat",
  "Hack Squat",
  "Leg Press",
  "Deadlift",
  "Romanian Deadlift",
  "Stiff-leg Deadlift",
  "Overhead Press",
  "Seated DB Press",
  "Barbell Row",
  "Pendlay Row",
  "T-Bar Row",
  "Pull-up",
  "Chin-up",
  "Lat Pulldown",
  "Dips",
  "Bulgarian Split Squat",
  "Hip Thrust",
  "Power Clean",
]);
function isCompound(name: string): boolean {
  return COMPOUNDS.has(name);
}

function defaultLoad(mv: Move, scheme: Scheme): number {
  const base: Record<string, number> = {
    barbell: scheme.focus === "STRENGTH" ? 60 : 40,
    dumbbell: 18,
    cable: 20,
    machine: 50,
  };
  return roundTo(base[mv.equip] ?? 20, 2.5);
}

/** Take the first `n`, but interleave so we don't return five chest movements. */
function pickSpread(list: Move[], n: number): Move[] {
  const out: Move[] = [];
  const usedMuscle = new Map<string, number>();
  for (const mv of list) {
    const c = usedMuscle.get(mv.m) ?? 0;
    if (c >= 2) continue; // at most two per muscle
    out.push(mv);
    usedMuscle.set(mv.m, c + 1);
    if (out.length >= n) break;
  }
  // backfill if the muscle cap left us short
  if (out.length < n) for (const mv of list) if (!out.includes(mv) && (out.push(mv), out.length >= n)) break;
  return out.slice(0, n);
}

function matchNumber(p: string): number | null {
  const m = p.match(/(\d{2,3})\s*(?:min|minute|m\b)/);
  return m ? Number(m[1]) : null;
}
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
function roundTo(v: number, step: number): number {
  return Math.round(v / step) * step;
}
