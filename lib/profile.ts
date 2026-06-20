/**
 * The signature move, client-side: read the signed-in user's memory and render
 * ONE compact athlete profile in markdown. This rides in front of every AI request.
 * The data is the user's own synced document (sessions + stated preferences); a
 * model that receives this *feels* like it remembers you — really it's just
 * structured state injection, a filter over a small, finite, structured record.
 */
import type { Session, Stance, Prefs } from "./types";
import { shortDate } from "./derive";

export function buildClientContext(args: {
  prefs: Prefs;
  stances: Record<string, Stance>;
  sessions: Session[];
}): string {
  const { prefs, stances, sessions } = args;

  const byStance = (s: Stance) =>
    Object.entries(stances)
      .filter(([, v]) => v === s)
      .map(([k]) => k);
  const banned = byStance("banned");
  const avoid = byStance("avoid");
  const loved = byStance("love");

  // PBs: heaviest set per exercise, with the reps from that set
  const best = new Map<string, { w: number; r: number }>();
  for (const s of sessions) {
    for (const e of s.entries) {
      for (const st of e.sets) {
        const cur = best.get(e.name);
        if (!cur || st.w > cur.w) best.set(e.name, { w: st.w, r: st.r });
      }
    }
  }
  const pbLines = [...best.entries()]
    .sort((a, b) => b[1].w - a[1].w)
    .map(([name, v]) => `- ${name}: ${num(v.w)}kg × ${v.r}`)
    .join("\n");

  const recentLines = sessions
    .slice(0, 3)
    .map((s) => `- ${s.focus || s.title} (${shortDate(s.dateISO)})`)
    .join("\n");

  return `# ATHLETE PROFILE

## Goals & setup
- Goal: ${prefs.goal || "general strength + muscle"}
- Equipment: ${prefs.equipment || "full commercial gym"}
- Style: ${prefs.split_style || "balanced"}
- Default rest: ${prefs.rest_default ?? 120}s

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

function num(v: number): string {
  return Number.isInteger(v) ? String(v) : (Math.round(v * 10) / 10).toFixed(1);
}
