/**
 * Design tokens as CSS-variable references, so components stay theme-aware.
 * The actual values live in app/globals.css and flip on [data-mx-theme].
 */
export const T = {
  bg: "var(--mx-bg)",
  ink: "var(--mx-ink)",
  line: "var(--mx-line)",
  soft: "var(--mx-soft)",
  sub: "var(--mx-sub)",
  accent: "var(--mx-accent)",
  onAccent: "var(--mx-on-accent)",
} as const;

export const FONT = {
  anton: "var(--font-anton)",
  archivo: "var(--font-archivo)",
  mono: "var(--font-mono)",
} as const;

/** Screen side padding & safe-area clearances (brutalist spec). */
export const PAD = {
  side: 22,
  top: 58, // clears status bar / Dynamic Island
  topTight: 54, // hero set-logger
  bottom: 32,
} as const;
