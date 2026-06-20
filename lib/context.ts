import "server-only";
import type { Client } from "@libsql/client";

/**
 * The signature move: read the memory tables and render ONE compact athlete
 * profile in markdown (the model reads markdown better than JSON). This block
 * rides in front of every AI request. Layer 1 = stated preferences; Layer 2 =
 * behaviour derived from logged sets (PBs, recent sessions, trend).
 */
export async function buildAthleteContext(db: Client): Promise<string> {
  const [prefs, stances, pbs, recent] = await Promise.all([
    db.execute("SELECT key, value FROM preferences"),
    db.execute(
      `SELECT e.name AS name, ep.stance AS stance, ep.note AS note
         FROM exercise_prefs ep JOIN exercises e ON e.id = ep.exercise_id`
    ),
    db.execute(
      `SELECT e.name AS name,
              MAX(s.weight) AS top,
              (SELECT reps FROM sets s2 WHERE s2.exercise_id = e.id
                 ORDER BY s2.weight DESC, s2.reps DESC LIMIT 1) AS reps
         FROM sets s JOIN exercises e ON e.id = s.exercise_id
        GROUP BY e.id
        ORDER BY top DESC`
    ),
    db.execute(
      `SELECT focus, created_at FROM workouts
        WHERE status = 'done' ORDER BY created_at DESC LIMIT 3`
    ),
  ]);

  return formatProfile(prefs.rows, stances.rows, pbs.rows, recent.rows);
}

type Row = Record<string, unknown>;

function formatProfile(prefs: Row[], stances: Row[], pbs: Row[], recent: Row[]): string {
  const get = (k: string) =>
    (prefs.find((p) => p.key === k)?.value as string | undefined) ?? "—";

  const banned = stances.filter((s) => s.stance === "banned").map((s) => s.name);
  const avoid = stances.filter((s) => s.stance === "avoid").map((s) => s.name);
  const loved = stances.filter((s) => s.stance === "love").map((s) => s.name);

  const pbLines = pbs
    .filter((p) => p.top != null)
    .map((p) => `- ${p.name}: ${fmtNum(p.top)}kg × ${p.reps ?? "?"}`)
    .join("\n");

  const recentLines = recent
    .map((r) => `- ${r.focus ?? "session"} (${shortDate(r.created_at as string)})`)
    .join("\n");

  return `# ATHLETE PROFILE

## Goals & setup
- Goal: ${get("goal")}
- Equipment: ${get("equipment")}
- Style: ${get("split_style")}
- Default rest: ${get("rest_default")}s

## Movement stances
- Banned (never program): ${banned.length ? banned.join(", ") : "none"}
- Avoid (minimise): ${avoid.length ? avoid.join(", ") : "none"}
- Loves (favour): ${loved.length ? loved.join(", ") : "none"}

## Current PBs (top set per lift)
${pbLines || "- (no logged sets yet)"}

## Recent sessions
${recentLines || "- (none logged yet)"}

## Coaching directive
Bias toward progressive overload: for any lift the athlete has logged, target a
small increase over the last top set. Respect the banned list absolutely. Favour
loved movements where they fit the requested focus. Keep total time realistic.`;
}

function fmtNum(v: unknown): string {
  const n = Number(v);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function shortDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();
}
