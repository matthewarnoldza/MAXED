"use client";

import { create } from "zustand";
import { snapWeight } from "@/lib/format";
import type { Filter } from "@/lib/exercises";

export type ScreenId =
  | "launch"
  | "home"
  | "plan"
  | "library"
  | "assistant"
  | "logger"
  | "history";

export type Theme = "light" | "dark";

export interface PlanLift {
  id: number;
  name: string;
  sets: number;
  reps: number;
  kg: number;
}

export interface LoggedSet {
  w: number;
  r: number;
  pb?: boolean;
}

export interface GeneratedLift {
  name: string;
  sets: number;
  reps: number;
  load: string; // "+2.5" | "26" | "BW" — display string
  note?: string;
}

export interface GeneratedPlan {
  title: string;
  focus: string;
  meta: string; // "6 LIFTS · 22 SETS · ~48 MIN · HYPERTROPHY"
  prompt: string;
  lifts: GeneratedLift[];
}

export type AssistantStatus =
  | "idle"
  | "loading"
  | "pending"
  | "accepted"
  | "discarded"
  | "error";

interface LogState {
  exercise: string;
  w: number;
  r: number;
  inc: number;
  pb: number;
  last: { w: number; r: number };
  sets: LoggedSet[];
  rest: number;
  restOn: boolean;
  flash: boolean;
  pbFire: boolean;
}

interface AppState {
  screen: ScreenId;
  theme: Theme;
  hydrated: boolean;

  log: LogState;
  plan: PlanLift[];
  library: { query: string; category: Filter };

  assistant: {
    status: AssistantStatus;
    plan: GeneratedPlan | null;
    prompt: string;
    error: string | null;
  };

  // navigation
  go: (s: ScreenId) => void;

  // theme
  toggleTheme: () => void;
  hydrate: () => void;

  // logger
  incW: () => void;
  decW: () => void;
  incR: () => void;
  decR: () => void;
  logSet: () => void;
  skipRest: () => void;
  tickRest: () => void;
  clearFlash: () => void;
  clearPbFire: () => void;

  // plan
  movePlan: (i: number, dir: -1 | 1) => void;

  // library
  setQuery: (q: string) => void;
  setCategory: (c: Filter) => void;
  addToPlan: (name: string) => void;

  // assistant
  generate: (prompt: string) => Promise<void>;
  acceptPlan: () => void;
  discardPlan: () => void;
  resetAssistant: () => void;
}

const DEFAULT_PROMPT =
  "Give me a 50-minute push day, focus on hypertrophy, push bench up.";

const SAMPLE_PLAN: GeneratedPlan = {
  title: "Push\nDay A",
  focus: "HYPERTROPHY",
  meta: "6 LIFTS · 22 SETS · ~48 MIN · HYPERTROPHY",
  prompt: DEFAULT_PROMPT,
  lifts: [
    { name: "Bench Press", sets: 4, reps: 8, load: "+2.5" },
    { name: "Incline DB Press", sets: 3, reps: 10, load: "26" },
    { name: "Overhead Press", sets: 4, reps: 6, load: "45" },
    { name: "Dips", sets: 3, reps: 10, load: "BW" },
    { name: "Lateral Raise", sets: 3, reps: 15, load: "12" },
    { name: "Cable Fly", sets: 3, reps: 15, load: "18" },
  ],
};

const THEME_KEY = "mx-theme";

export const useApp = create<AppState>((set, get) => ({
  screen: "launch",
  theme: "light",
  hydrated: false,

  log: {
    exercise: "Back Squat",
    w: 140,
    r: 3,
    inc: 5,
    pb: 140,
    last: { w: 135, r: 3 },
    sets: [
      { w: 130, r: 5 },
      { w: 135, r: 3 },
    ],
    rest: 0,
    restOn: false,
    flash: false,
    pbFire: false,
  },

  plan: [
    { id: 1, name: "Back Squat", sets: 5, reps: 5, kg: 140 },
    { id: 2, name: "Romanian Deadlift", sets: 4, reps: 8, kg: 100 },
    { id: 3, name: "Leg Press", sets: 3, reps: 12, kg: 220 },
    { id: 4, name: "Walking Lunge", sets: 3, reps: 10, kg: 24 },
  ],

  library: { query: "", category: "ALL" },

  assistant: {
    status: "pending",
    plan: SAMPLE_PLAN,
    prompt: DEFAULT_PROMPT,
    error: null,
  },

  go: (s) => set({ screen: s }),

  toggleTheme: () =>
    set((st) => {
      const theme: Theme = st.theme === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(THEME_KEY, theme);
        } catch {}
      }
      return { theme };
    }),

  hydrate: () => {
    if (get().hydrated) return;
    let theme: Theme = "light";
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(THEME_KEY) as Theme | null;
        if (saved === "light" || saved === "dark") theme = saved;
      } catch {}
    }
    set({ theme, hydrated: true });
  },

  incW: () => set((st) => ({ log: { ...st.log, w: snapWeight(st.log.w + st.log.inc) } })),
  decW: () => set((st) => ({ log: { ...st.log, w: snapWeight(st.log.w - st.log.inc) } })),
  incR: () => set((st) => ({ log: { ...st.log, r: st.log.r + 1 } })),
  decR: () => set((st) => ({ log: { ...st.log, r: Math.max(1, st.log.r - 1) } })),

  logSet: () => {
    const { log } = get();
    const beat = log.w > log.pb;
    set({
      log: {
        ...log,
        sets: [...log.sets, { w: log.w, r: log.r, pb: beat }],
        pb: beat ? log.w : log.pb,
        pbFire: beat,
        flash: true,
        rest: 120,
        restOn: true,
      },
    });
    // offline-first: UI already updated. Persist opportunistically; never block.
    void fetch("/api/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise: log.exercise, weight: log.w, reps: log.r }),
    }).catch(() => {});

    setTimeout(() => get().clearFlash(), 650);
    if (beat) setTimeout(() => get().clearPbFire(), 2400);
  },

  skipRest: () => set((st) => ({ log: { ...st.log, rest: 0, restOn: false } })),
  tickRest: () =>
    set((st) => {
      if (!st.log.restOn || st.log.rest <= 0) return {} as Partial<AppState>;
      const nr = st.log.rest - 1;
      return { log: { ...st.log, rest: nr, restOn: nr > 0 } };
    }),
  clearFlash: () => set((st) => ({ log: { ...st.log, flash: false } })),
  clearPbFire: () => set((st) => ({ log: { ...st.log, pbFire: false } })),

  movePlan: (i, dir) =>
    set((st) => {
      const a = [...st.plan];
      const j = i + dir;
      if (j < 0 || j >= a.length) return {} as Partial<AppState>;
      [a[i], a[j]] = [a[j], a[i]];
      return { plan: a };
    }),

  setQuery: (q) => set((st) => ({ library: { ...st.library, query: q } })),
  setCategory: (c) => set((st) => ({ library: { ...st.library, category: c } })),

  addToPlan: (name) =>
    set((st) => {
      if (st.plan.some((p) => p.name === name)) return {} as Partial<AppState>;
      const id = Math.max(0, ...st.plan.map((p) => p.id)) + 1;
      return { plan: [...st.plan, { id, name, sets: 3, reps: 10, kg: 0 }] };
    }),

  generate: async (prompt) => {
    set((st) => ({ assistant: { ...st.assistant, status: "loading", prompt, error: null } }));
    try {
      const res = await fetch("/api/workout/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`Generate failed (${res.status})`);
      const data = (await res.json()) as { plan: GeneratedPlan };
      set({ assistant: { status: "pending", plan: data.plan, prompt, error: null } });
    } catch (e) {
      // Graceful offline/blocked fallback: show the sample plan so the flow stays usable.
      set({
        assistant: {
          status: "pending",
          plan: { ...SAMPLE_PLAN, prompt },
          prompt,
          error: e instanceof Error ? e.message : "offline",
        },
      });
    }
  },

  acceptPlan: () =>
    set((st) => {
      const gen = st.assistant.plan;
      let plan = st.plan;
      if (gen) {
        const existing = new Set(plan.map((p) => p.name));
        const additions: PlanLift[] = gen.lifts
          .filter((l) => !existing.has(l.name))
          .map((l, k) => ({
            id: Math.max(0, ...plan.map((p) => p.id)) + 1 + k,
            name: l.name,
            sets: l.sets,
            reps: l.reps,
            kg: Number.isNaN(parseFloat(l.load)) ? 0 : parseFloat(l.load),
          }));
        plan = [...plan, ...additions];

        // close the loop: persist the accepted workout + prefs (offline-safe)
        void fetch("/api/workout/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            focus: gen.focus,
            source: "assistant",
            lifts: gen.lifts.map((l) => ({
              name: l.name,
              sets: l.sets,
              reps: l.reps,
              load: l.load,
            })),
          }),
        }).catch(() => {});
      }
      return { plan, assistant: { ...st.assistant, status: "accepted" } };
    }),

  discardPlan: () =>
    set((st) => ({ assistant: { ...st.assistant, status: "discarded" } })),
  resetAssistant: () =>
    set((st) => ({ assistant: { ...st.assistant, status: "pending" } })),
}));
