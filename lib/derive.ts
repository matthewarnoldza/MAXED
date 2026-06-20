/**
 * Pure, memo-friendly selectors over the logged history. This is the "Layer 2"
 * of the memory: PBs, ghost targets, per-lift trend and the home dashboard are
 * all *computed* from `sessions` (+ the in-progress set list) — never stored.
 * A filter/reduce is the retrieval; there is no separate stats table to drift.
 *
 * `sessions` is always ordered newest-first (index 0 = most recent).
 */
import type { Session, LoggedSet } from "./types";
import { e1rm } from "./format";

const DAY = 86_400_000;

/** Heaviest single set ever logged for a lift, optionally folding in live sets. */
export function pbFor(sessions: Session[], name: string, live: LoggedSet[] = []): number {
  let pb = 0;
  for (const s of sessions) {
    const e = s.entries.find((x) => x.name === name);
    if (e) for (const st of e.sets) if (st.w > pb) pb = st.w;
  }
  for (const st of live) if (st.w > pb) pb = st.w;
  return pb;
}

/** Top set of the most recent *prior* session — the ghost target row. */
export function lastTopFor(sessions: Session[], name: string): { w: number; r: number } | null {
  for (const s of sessions) {
    const e = s.entries.find((x) => x.name === name);
    if (e && e.sets.length) {
      const top = e.sets.reduce((a, b) => (b.w > a.w ? b : a));
      return { w: top.w, r: top.r };
    }
  }
  return null;
}

export interface ExerciseHistory {
  name: string;
  hasData: boolean;
  pb: number;
  pbReps: number;
  pbDateLabel: string | null;
  e1rmBest: number;
  sessionsCount: number;
  deltaKg: number; // first logged top set → latest top set
  /** Top set per session, oldest → newest (max 12) for the bar chart. */
  topSets: { w: number; r: number; pb: boolean; label: string }[];
  /** Recent sessions newest-first with their set weights for the ledger. */
  recent: { label: string; sets: LoggedSet[] }[];
}

/** Everything the History screen needs for one exercise, from raw sessions. */
export function historyFor(sessions: Session[], name: string): ExerciseHistory {
  // chronological (oldest → newest) view of just this exercise
  const chrono = [...sessions]
    .reverse()
    .map((s) => ({ s, e: s.entries.find((x) => x.name === name) }))
    .filter((r): r is { s: Session; e: NonNullable<typeof r.e> } => !!r.e && r.e.sets.length > 0);

  if (chrono.length === 0) {
    return {
      name,
      hasData: false,
      pb: 0,
      pbReps: 0,
      pbDateLabel: null,
      e1rmBest: 0,
      sessionsCount: 0,
      deltaKg: 0,
      topSets: [],
      recent: [],
    };
  }

  let pb = 0;
  let pbReps = 0;
  let pbDateISO = chrono[0].s.dateISO;
  let e1rmBest = 0;

  const topSets = chrono.map(({ s, e }) => {
    const top = e.sets.reduce((a, b) => (b.w > a.w ? b : a));
    for (const st of e.sets) {
      if (st.w > pb) {
        pb = st.w;
        pbReps = st.r;
        pbDateISO = s.dateISO;
      }
      const est = e1rm(st.w, st.r);
      if (est > e1rmBest) e1rmBest = est;
    }
    return { w: top.w, r: top.r, pb: top.w >= pb, label: shortDate(s.dateISO) };
  });

  // re-flag which session actually holds the PB (last one to reach `pb`)
  topSets.forEach((t) => (t.pb = t.w === pb));

  const first = topSets[0].w;
  const latest = topSets[topSets.length - 1].w;

  return {
    name,
    hasData: true,
    pb,
    pbReps,
    pbDateLabel: shortDate(pbDateISO),
    e1rmBest,
    sessionsCount: chrono.length,
    deltaKg: Math.round((latest - first) * 10) / 10,
    topSets: topSets.slice(-12),
    recent: chrono
      .slice(-6)
      .reverse()
      .map(({ s, e }) => ({ label: shortDate(s.dateISO), sets: e.sets })),
  };
}

export interface HomeStats {
  dayNumber: number;
  streak: number;
  volumeWeekT: string; // tonnes, one decimal
  e1rmTop: number;
  pbsThisMonth: number;
  todayLabel: string; // "WED 12 MAR"
}

/** Dashboard figures for Home, all computed from history (no stored counters). */
export function homeStats(sessions: Session[], startDateISO: string, now: Date): HomeStats {
  const day = Math.max(1, Math.floor((now.getTime() - new Date(startDateISO).getTime()) / DAY) + 1);

  // distinct training days, newest-first, as midnight timestamps
  const days = Array.from(
    new Set(sessions.map((s) => startOfDay(new Date(s.dateISO)).getTime()))
  ).sort((a, b) => b - a);

  let streak = 0;
  if (days.length) {
    const today = startOfDay(now).getTime();
    // streak counts only if the latest session was today or yesterday
    if (today - days[0] <= DAY) {
      streak = 1;
      for (let i = 1; i < days.length; i++) {
        if (days[i - 1] - days[i] === DAY) streak++;
        else break;
      }
    }
  }

  const weekAgo = now.getTime() - 7 * DAY;
  let volumeKg = 0;
  for (const s of sessions) {
    if (new Date(s.dateISO).getTime() < weekAgo) continue;
    for (const e of s.entries) for (const st of e.sets) volumeKg += st.w * st.r;
  }

  let e1rmTop = 0;
  const cutoff = now.getTime() - 35 * DAY;
  for (const s of sessions) {
    if (new Date(s.dateISO).getTime() < cutoff) continue;
    for (const e of s.entries) for (const st of e.sets) e1rmTop = Math.max(e1rmTop, e1rm(st.w, st.r));
  }

  const mo = now.getMonth();
  const yr = now.getFullYear();
  let pbsThisMonth = 0;
  for (const s of sessions) {
    const d = new Date(s.dateISO);
    if (d.getMonth() !== mo || d.getFullYear() !== yr) continue;
    for (const e of s.entries) for (const st of e.sets) if (st.pb) pbsThisMonth++;
  }

  return {
    dayNumber: day,
    streak,
    volumeWeekT: (volumeKg / 1000).toFixed(1),
    e1rmTop,
    pbsThisMonth,
    todayLabel: now
      .toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
      .toUpperCase(),
  };
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();
}
