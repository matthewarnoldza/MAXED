/** Number/format helpers shared by the logger, history and context packet. */

/** Whole numbers stay whole; fractions show one decimal (e.g. 142.5). */
export function num(v: number): string {
  return Number.isInteger(v) ? String(v) : (Math.round(v * 10) / 10).toFixed(1);
}

/** Seconds → m:ss for the rest timer. */
export function fmtClock(s: number): string {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss < 10 ? "0" : ""}${ss}`;
}

/** Epley estimated 1-rep max, matching the prototype. */
export function e1rm(w: number, r: number): number {
  return Math.round(w * (1 + r / 30));
}

/** Quarter-kg rounding for weight steppers (supports 2.5kg granularity). */
export function snapWeight(v: number): number {
  return Math.max(0, Math.round(v * 4) / 4);
}
