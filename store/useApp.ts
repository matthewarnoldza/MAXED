"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { snapWeight } from "@/lib/format";
import { pbFor, lastTopFor } from "@/lib/derive";
import { synthWorkout } from "@/lib/generator";
import { buildClientContext } from "@/lib/profile";
import { EXERCISES, type Filter } from "@/lib/exercises";
import type {
  PlanLift,
  LoggedSet,
  Session,
  SessionEntry,
  Stance,
  Prefs,
  GeneratedPlan,
  GeneratedLift,
} from "@/lib/types";

export type ScreenId =
  | "launch"
  | "login"
  | "home"
  | "plan"
  | "library"
  | "assistant"
  | "logger"
  | "history"
  | "settings";

export type Theme = "light" | "dark";
export type AssistantStatus = "idle" | "loading" | "pending" | "accepted" | "discarded";

export interface Profile {
  id: string;
  name: string;
}

interface LiveState {
  active: boolean;
  title: string;
  focus: string;
  liftIndex: number;
  lifts: PlanLift[];
  entries: Record<string, LoggedSet[]>;
  w: number;
  r: number;
  inc: number;
  rest: number;
  restOn: boolean;
  flash: boolean;
  pbFire: boolean;
}

interface AppState {
  hydrated: boolean;
  loadingUser: boolean;
  screen: ScreenId;
  theme: Theme;

  // identity (device-level, persisted)
  currentUser: Profile | null;
  knownProfiles: Profile[];

  // per-user data (loaded from cloud on login; synced on change)
  startDateISO: string;
  prefs: Prefs;
  stances: Record<string, Stance>;
  sessions: Session[];
  planTitle: string;
  planFocus: string;
  plan: PlanLift[];
  live: LiveState;
  historyExercise: string;

  library: { query: string; category: Filter };
  apiKey: string;
  model: string;
  assistant: {
    status: AssistantStatus;
    plan: GeneratedPlan | null;
    prompt: string;
    error: string | null;
  };

  // navigation + chrome
  go: (s: ScreenId) => void;
  toggleTheme: () => void;

  // auth
  createProfile: (name: string) => Promise<void>;
  switchUser: (id: string) => Promise<void>;
  loadUser: (id: string, name: string) => Promise<void>;
  signOut: () => void;
  removeProfile: (id: string) => void;

  // live workout
  startWorkout: () => void;
  selectLift: (i: number) => void;
  nextLift: () => void;
  prevLift: () => void;
  incW: () => void;
  decW: () => void;
  incR: () => void;
  decR: () => void;
  cycleInc: () => void;
  logSet: () => void;
  skipRest: () => void;
  tickRest: () => void;
  finishWorkout: () => void;

  // plan
  movePlan: (i: number, dir: -1 | 1) => void;
  removeFromPlan: (id: number) => void;
  addToPlan: (name: string) => void;

  // library
  setQuery: (q: string) => void;
  setCategory: (c: Filter) => void;
  setStance: (name: string, stance: Stance | null) => void;

  // history
  openHistory: (name: string) => void;

  // assistant
  generate: (prompt: string) => Promise<void>;
  acceptPlan: () => void;
  discardPlan: () => void;
  resetAssistant: () => void;

  // settings
  setApiKey: (k: string) => void;
  setModel: (m: string) => void;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  resetData: () => void;
}

const DEFAULT_PROMPT = "45-minute push day, hypertrophy, push my bench up.";

const DEFAULT_PREFS: Prefs = {
  goal: "build muscle + get stronger",
  equipment: "full commercial gym",
  split_style: "push / pull / legs",
  rest_default: 120,
};

const DEFAULT_PLAN: PlanLift[] = [
  { id: 1, name: "Bench Press", sets: 4, reps: 8, kg: 60 },
  { id: 2, name: "Incline DB Press", sets: 3, reps: 10, kg: 24 },
  { id: 3, name: "Overhead Press", sets: 4, reps: 6, kg: 35 },
  { id: 4, name: "Lateral Raise", sets: 3, reps: 15, kg: 10 },
];

function emptyLive(): LiveState {
  return {
    active: false,
    title: "",
    focus: "",
    liftIndex: 0,
    lifts: [],
    entries: {},
    w: 60,
    r: 8,
    inc: 5,
    rest: 0,
    restOn: false,
    flash: false,
    pbFire: false,
  };
}

/** Fresh state for a brand-new account. */
function freshUserData() {
  return {
    startDateISO: new Date().toISOString(),
    prefs: DEFAULT_PREFS,
    stances: {} as Record<string, Stance>,
    sessions: [] as Session[],
    planTitle: "Push Day",
    planFocus: "HYPERTROPHY",
    plan: DEFAULT_PLAN,
  };
}

/** Map a stored/loaded document onto the per-user state fields, defensively. */
function applyUserData(d: Record<string, unknown>): Partial<AppState> {
  const out: Partial<AppState> = {
    startDateISO: typeof d.startDateISO === "string" ? d.startDateISO : new Date().toISOString(),
    prefs: { ...DEFAULT_PREFS, ...(typeof d.prefs === "object" && d.prefs ? d.prefs : {}) },
    stances: d.stances && typeof d.stances === "object" ? (d.stances as Record<string, Stance>) : {},
    sessions: Array.isArray(d.sessions) ? (d.sessions as Session[]) : [],
    planTitle: typeof d.planTitle === "string" ? d.planTitle : "Push Day",
    planFocus: typeof d.planFocus === "string" ? d.planFocus : "HYPERTROPHY",
    plan: Array.isArray(d.plan) && d.plan.length ? (d.plan as PlanLift[]) : DEFAULT_PLAN,
  };
  if (d.live && typeof d.live === "object") out.live = d.live as LiveState;
  if (typeof d.historyExercise === "string") out.historyExercise = d.historyExercise;
  return out;
}

/** The document persisted to the cloud (the durable memory). Excludes the
 *  in-progress workout + transient UI so the rest timer never spams the network. */
export function cloudData(s: AppState) {
  return {
    startDateISO: s.startDateISO,
    prefs: s.prefs,
    stances: s.stances,
    sessions: s.sessions,
    planTitle: s.planTitle,
    planFocus: s.planFocus,
    plan: s.plan,
  };
}

/** The richer snapshot cached on-device (adds the live workout + last-viewed lift). */
export function localData(s: AppState) {
  return { ...cloudData(s), live: s.live, historyExercise: s.historyExercise };
}

export const cacheKey = (id: string) => `maxed:user:${id}`;

function pushCloud(userId: string, data: unknown) {
  void fetch("/api/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, data }),
  }).catch(() => {});
}

/** Immediately persist the signed-in user's data to cache + cloud. Used when
 *  switching/leaving so the outgoing user's latest work can't be lost to the
 *  debounced autosave. */
function persistNow(s: AppState) {
  if (!s.currentUser) return;
  try {
    localStorage.setItem(cacheKey(s.currentUser.id), JSON.stringify(localData(s)));
  } catch {}
  pushCloud(s.currentUser.id, cloudData(s));
}

function workingFor(
  lift: PlanLift,
  entries: Record<string, LoggedSet[]>,
  sessions: Session[]
): { w: number; r: number } {
  const logged = entries[lift.name];
  if (logged && logged.length) return { w: logged[logged.length - 1].w, r: logged[logged.length - 1].r };
  const last = lastTopFor(sessions, lift.name);
  const w = Math.max(lift.kg || 0, last?.w ?? 0) || lift.kg || 20;
  return { w: snapWeight(w), r: lift.reps || 8 };
}

const INC_CYCLE = [2.5, 5, 10];

function liftsToPlan(lifts: GeneratedLift[], sessions: Session[]): PlanLift[] {
  return lifts.map((l, i) => {
    let kg = parseFloat(l.load);
    if (Number.isNaN(kg)) kg = pbFor(sessions, l.name) || 0;
    return { id: i + 1, name: l.name, sets: l.sets, reps: l.reps, kg: snapWeight(kg) };
  });
}

function synthToPlan(prompt: string, sessions: Session[], stances: Record<string, Stance>, goal: string): GeneratedPlan {
  const r = synthWorkout({ prompt, sessions, stances, goal });
  const totalSets = r.lifts.reduce((a, b) => a + b.sets, 0);
  return {
    title: stack(r.title),
    focus: r.focus,
    meta: `${r.lifts.length} LIFTS · ${totalSets} SETS · ~${r.duration_min} MIN · ${r.focus}`,
    prompt,
    lifts: r.lifts,
  };
}

function stack(title: string): string {
  const t = (title || "Workout").trim();
  const i = t.lastIndexOf(" ");
  return i > 0 ? `${t.slice(0, i)}\n${t.slice(i + 1)}` : t;
}

function inferBans(prompt: string, known: string[]): string[] {
  const p = prompt.toLowerCase();
  if (!/\bno\b|\bavoid\b|\bwithout\b|\bskip\b/.test(p)) return [];
  return known.filter((name) => name.toLowerCase().split(" ").every((part) => p.includes(part)));
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      loadingUser: false,
      screen: "launch",
      theme: "dark",

      currentUser: null,
      knownProfiles: [],

      startDateISO: "2026-01-01T00:00:00",
      prefs: DEFAULT_PREFS,
      stances: {},
      sessions: [],
      planTitle: "Push Day",
      planFocus: "HYPERTROPHY",
      plan: DEFAULT_PLAN,
      live: emptyLive(),
      historyExercise: "Bench Press",

      library: { query: "", category: "ALL" },
      apiKey: "",
      model: "anthropic/claude-sonnet-4.6",
      assistant: { status: "idle", plan: null, prompt: DEFAULT_PROMPT, error: null },

      go: (s) => set({ screen: s }),
      toggleTheme: () => set((st) => ({ theme: st.theme === "light" ? "dark" : "light" })),

      // ---- auth ----
      createProfile: async (name) => {
        const clean = name.trim().replace(/\s+/g, " ").slice(0, 40);
        if (!clean) return;
        try {
          const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: clean }),
          });
          if (!res.ok) throw new Error("auth failed");
          const { id, name: nm } = (await res.json()) as Profile;
          await get().loadUser(id, nm);
        } catch {
          // offline: create a local-only profile so the app is still usable now
          const id = "local-" + Math.random().toString(36).slice(2, 10);
          await get().loadUser(id, clean);
        }
      },

      switchUser: async (id) => {
        const p = get().knownProfiles.find((x) => x.id === id);
        await get().loadUser(id, p?.name ?? "Athlete");
      },

      loadUser: async (id, name) => {
        // flush the outgoing user before switching away (don't lose their last sets)
        const prev = get().currentUser;
        if (prev && prev.id !== id) persistNow(get());
        // gate cloud-sync while we load, so default/empty state can't clobber the cloud
        set({ loadingUser: true });
        let appliedFromCache = false;
        try {
          const cached = localStorage.getItem(cacheKey(id));
          if (cached) {
            set(applyUserData(JSON.parse(cached)));
            appliedFromCache = true;
          }
        } catch {}

        set((st) => ({
          currentUser: { id, name },
          knownProfiles: st.knownProfiles.some((p) => p.id === id)
            ? st.knownProfiles.map((p) => (p.id === id ? { id, name } : p))
            : [...st.knownProfiles, { id, name }],
          screen: "home",
          live: appliedFromCache ? get().live : emptyLive(),
          assistant: { status: "idle", plan: null, prompt: DEFAULT_PROMPT, error: null },
        }));

        try {
          const res = await fetch(`/api/state?userId=${encodeURIComponent(id)}`);
          if (res.ok) {
            const { data } = (await res.json()) as { data: Record<string, unknown> | null };
            if (data) {
              set(applyUserData(data));
            } else if (!appliedFromCache) {
              const fresh = freshUserData();
              set(applyUserData(fresh));
              pushCloud(id, fresh);
            }
          }
        } catch {
          if (!appliedFromCache) set(applyUserData(freshUserData()));
        } finally {
          set({ loadingUser: false });
        }
      },

      signOut: () => {
        persistNow(get());
        set({ currentUser: null, screen: "login", live: emptyLive() });
      },

      removeProfile: (id) =>
        set((st) => {
          try {
            localStorage.removeItem(cacheKey(id));
          } catch {}
          const knownProfiles = st.knownProfiles.filter((p) => p.id !== id);
          if (st.currentUser?.id === id) {
            return { knownProfiles, currentUser: null, screen: "login", live: emptyLive() };
          }
          return { knownProfiles };
        }),

      // ---- live workout ----
      startWorkout: () =>
        set((st) => {
          const lifts = st.plan.map((p) => ({ ...p }));
          if (!lifts.length) return {} as Partial<AppState>;
          const w0 = workingFor(lifts[0], {}, st.sessions);
          return {
            screen: "logger",
            live: {
              ...emptyLive(),
              active: true,
              title: st.planTitle,
              focus: st.planFocus,
              lifts,
              liftIndex: 0,
              inc: st.live.inc || 5,
              w: w0.w,
              r: w0.r,
            },
          };
        }),

      selectLift: (i) =>
        set((st) => {
          const lifts = st.live.lifts;
          if (i < 0 || i >= lifts.length) return {} as Partial<AppState>;
          const wk = workingFor(lifts[i], st.live.entries, st.sessions);
          return { live: { ...st.live, liftIndex: i, w: wk.w, r: wk.r, restOn: false, rest: 0 } };
        }),

      nextLift: () => get().selectLift(get().live.liftIndex + 1),
      prevLift: () => get().selectLift(get().live.liftIndex - 1),

      incW: () => set((st) => ({ live: { ...st.live, w: snapWeight(st.live.w + st.live.inc) } })),
      decW: () => set((st) => ({ live: { ...st.live, w: snapWeight(st.live.w - st.live.inc) } })),
      incR: () => set((st) => ({ live: { ...st.live, r: st.live.r + 1 } })),
      decR: () => set((st) => ({ live: { ...st.live, r: Math.max(1, st.live.r - 1) } })),
      cycleInc: () =>
        set((st) => {
          const idx = INC_CYCLE.indexOf(st.live.inc);
          return { live: { ...st.live, inc: INC_CYCLE[(idx + 1) % INC_CYCLE.length] } };
        }),

      logSet: () =>
        set((st) => {
          const { live, sessions } = st;
          const lift = live.lifts[live.liftIndex];
          if (!lift) return {} as Partial<AppState>;
          const name = lift.name;
          const existing = live.entries[name] ?? [];
          const beat = live.w > pbFor(sessions, name, existing);
          const entry: LoggedSet = { w: live.w, r: live.r, pb: beat };

          setTimeout(() => set((s) => ({ live: { ...s.live, flash: false } })), 620);
          if (beat) setTimeout(() => set((s) => ({ live: { ...s.live, pbFire: false } })), 2300);

          return {
            live: {
              ...live,
              entries: { ...live.entries, [name]: [...existing, entry] },
              flash: true,
              pbFire: beat,
              rest: st.prefs.rest_default,
              restOn: true,
            },
          };
        }),

      skipRest: () => set((st) => ({ live: { ...st.live, rest: 0, restOn: false } })),
      tickRest: () => {
        const { live } = get();
        if (!live.restOn || live.rest <= 0) return;
        const nr = live.rest - 1;
        set({ live: { ...live, rest: nr, restOn: nr > 0 } });
      },

      finishWorkout: () =>
        set((st) => {
          const { live } = st;
          const entries: SessionEntry[] = live.lifts
            .map((l) => ({ name: l.name, sets: live.entries[l.name] ?? [] }))
            .filter((e) => e.sets.length > 0);
          if (!entries.length) return { live: emptyLive(), screen: "home" };
          const id = (st.sessions[0]?.id ?? 0) + 1;
          const session: Session = {
            id,
            dateISO: new Date().toISOString(),
            focus: live.focus || "SESSION",
            title: live.title || "Workout",
            entries,
          };
          return {
            sessions: [session, ...st.sessions],
            live: emptyLive(),
            historyExercise: entries[0].name,
            screen: "home",
          };
        }),

      // ---- plan ----
      movePlan: (i, dir) =>
        set((st) => {
          const a = [...st.plan];
          const j = i + dir;
          if (j < 0 || j >= a.length) return {} as Partial<AppState>;
          [a[i], a[j]] = [a[j], a[i]];
          return { plan: a };
        }),
      removeFromPlan: (id) => set((st) => ({ plan: st.plan.filter((p) => p.id !== id) })),
      addToPlan: (name) =>
        set((st) => {
          if (st.plan.some((p) => p.name === name)) return {} as Partial<AppState>;
          const id = Math.max(0, ...st.plan.map((p) => p.id)) + 1;
          const last = lastTopFor(st.sessions, name);
          return { plan: [...st.plan, { id, name, sets: 3, reps: 10, kg: last?.w ?? 0 }] };
        }),

      // ---- library ----
      setQuery: (q) => set((st) => ({ library: { ...st.library, query: q } })),
      setCategory: (c) => set((st) => ({ library: { ...st.library, category: c } })),
      setStance: (name, stance) =>
        set((st) => {
          const next = { ...st.stances };
          if (stance === null) delete next[name];
          else next[name] = stance;
          return { stances: next };
        }),

      openHistory: (name) => set({ historyExercise: name, screen: "history" }),

      // ---- assistant ----
      generate: async (prompt) => {
        set((st) => ({ assistant: { ...st.assistant, status: "loading", prompt, error: null } }));
        const { prefs, stances, sessions, apiKey, model } = get();
        const context = buildClientContext({ prefs, stances, sessions });
        try {
          const res = await fetch("/api/workout/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, context, apiKey: apiKey || undefined, model }),
          });
          if (!res.ok) throw new Error("generate failed");
          const data = (await res.json()) as { plan: GeneratedPlan };
          set({ assistant: { status: "pending", plan: data.plan, prompt, error: null } });
        } catch {
          const plan = synthToPlan(prompt, sessions, stances, prefs.goal);
          set({ assistant: { status: "pending", plan, prompt, error: "offline — generated on-device" } });
        }
      },

      acceptPlan: () =>
        set((st) => {
          const gen = st.assistant.plan;
          if (!gen) return { assistant: { ...st.assistant, status: "accepted" } };
          const newPlan = liftsToPlan(gen.lifts, st.sessions);
          const bans = inferBans(gen.prompt, EXERCISES.map((e) => e.name));
          const stances = { ...st.stances };
          for (const b of bans) stances[b] = "banned";
          return {
            plan: newPlan,
            planTitle: gen.title.replace(/\n/g, " "),
            planFocus: gen.focus,
            stances,
            assistant: { ...st.assistant, status: "accepted" },
          };
        }),

      discardPlan: () => set((st) => ({ assistant: { ...st.assistant, status: "discarded" } })),
      resetAssistant: () => set((st) => ({ assistant: { ...st.assistant, status: "idle", plan: null } })),

      // ---- settings ----
      setApiKey: (k) => set({ apiKey: k.trim() }),
      setModel: (m) => set({ model: m.trim() || "anthropic/claude-sonnet-4.6" }),
      setPref: (key, value) => set((st) => ({ prefs: { ...st.prefs, [key]: value } })),
      resetData: () =>
        set({
          sessions: [],
          stances: {},
          plan: DEFAULT_PLAN,
          planTitle: "Push Day",
          planFocus: "HYPERTROPHY",
          live: emptyLive(),
          assistant: { status: "idle", plan: null, prompt: DEFAULT_PROMPT, error: null },
        }),
    }),
    {
      name: "maxed:device",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      version: 2,
      // Only identity + theme live in the device store. Per-user training data is
      // loaded from the cloud (and cached under maxed:user:<id>) on sign-in.
      partialize: (s) => ({
        theme: s.theme,
        currentUser: s.currentUser,
        knownProfiles: s.knownProfiles,
      }),
    }
  )
);
