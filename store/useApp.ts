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
  | "sessions"
  | "achievements"
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
  restEndsAt: number;
  flash: boolean;
  pbFire: boolean;
}

interface AppState {
  hydrated: boolean;
  loadingUser: boolean;
  cloudOk: boolean;
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
  customExercises: { name: string; group: string }[];
  pinned: string[];

  library: { query: string; category: Filter };
  apiKey: string;
  model: string;
  serverHasKey: boolean;
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
  liveSwapLift: (name: string) => void;
  liveAddLift: (name: string) => void;
  liveRemoveLift: () => void;
  logSet: () => void;
  skipRest: () => void;
  tickRest: () => void;
  finishWorkout: () => void;

  // plan
  movePlan: (i: number, dir: -1 | 1) => void;
  removeFromPlan: (id: number) => void;
  addToPlan: (name: string) => void;
  togglePlan: (name: string) => void;
  addCustomExercise: (name: string) => void;
  registerCustomExercise: (name: string) => void;

  // sessions / reuse
  repeatSession: (id: number) => void;
  deleteSession: (id: number) => void;
  togglePin: (name: string) => void;

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
  checkServerKey: () => Promise<void>;
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
  { id: 1, name: "Barbell Bench Press", sets: 4, reps: 8, kg: 60 },
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
    inc: 2.5,
    rest: 0,
    restOn: false,
    restEndsAt: 0,
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
    customExercises: [] as { name: string; group: string }[],
    pinned: ["Barbell Bench Press", "Back Squat", "Deadlift"] as string[],
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
    customExercises: Array.isArray(d.customExercises) ? (d.customExercises as { name: string; group: string }[]) : [],
    pinned: Array.isArray(d.pinned) ? (d.pinned as string[]) : ["Barbell Bench Press", "Back Squat", "Deadlift"],
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
    customExercises: s.customExercises,
    pinned: s.pinned,
  };
}

/** The richer snapshot cached on-device (adds the live workout + last-viewed lift). */
export function localData(s: AppState) {
  return { ...cloudData(s), live: s.live, historyExercise: s.historyExercise };
}

export const cacheKey = (id: string) => `maxed:user:${id}`;

/** Write just the on-device cache (fast, frequent). */
export function cacheUser(s: AppState) {
  if (!s.currentUser) return;
  try {
    localStorage.setItem(cacheKey(s.currentUser.id), JSON.stringify(localData(s)));
  } catch {}
}

/** POST a doc to the cloud. `name` lets the server self-heal a missing users row
 *  (an offline-created profile then syncs cleanly once back online). Tracks cloudOk. */
export function cloudPost(
  userId: string,
  name: string,
  data: unknown,
  opts: { replace?: boolean; beacon?: boolean } = {}
) {
  const body = JSON.stringify({ userId, name, data, replace: opts.replace });
  if (opts.beacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/state", new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch("/api/state", { method: "POST", headers: { "Content-Type": "application/json" }, body })
    .then((r) => useApp.setState({ cloudOk: r.ok }))
    .catch(() => useApp.setState({ cloudOk: false }));
}

/** Immediately persist the signed-in user (cache + cloud). Used on switch / sign-out /
 *  reset / delete so nothing is lost to the debounced autosave or a stale server merge. */
function writeUser(s: AppState, opts: { replace?: boolean; beacon?: boolean } = {}) {
  if (!s.currentUser) return;
  cacheUser(s);
  cloudPost(s.currentUser.id, s.currentUser.name, cloudData(s), opts);
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

const INC_CYCLE = [1, 2.5, 5, 10];

function liftsToPlan(lifts: GeneratedLift[], sessions: Session[]): PlanLift[] {
  return lifts.map((l, i) => {
    const t = l.load.trim();
    let kg: number;
    if (/^[+-]/.test(t)) {
      // progressive-overload delta ("+2.5") → resolve against the athlete's current PB
      const base = pbFor(sessions, l.name) || lastTopFor(sessions, l.name)?.w || 0;
      kg = base > 0 ? base + parseFloat(t) : 0; // no history yet → 0 (workingFor picks a sane start)
    } else {
      kg = parseFloat(t);
      if (Number.isNaN(kg)) kg = pbFor(sessions, l.name) || 0; // "BW" etc.
    }
    return { id: i + 1, name: l.name, sets: l.sets, reps: l.reps, kg: snapWeight(Math.max(0, kg)) };
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

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      loadingUser: false,
      cloudOk: true,
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
      historyExercise: "Barbell Bench Press",
      customExercises: [],
      pinned: ["Barbell Bench Press", "Back Squat", "Deadlift"],

      library: { query: "", category: "ALL" },
      apiKey: "",
      model: "anthropic/claude-sonnet-4.6",
      serverHasKey: false,
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
        if (prev && prev.id !== id) writeUser(get());
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
              set(applyUserData(freshUserData()));
              writeUser(get());
            }
          }
        } catch {
          if (!appliedFromCache) set(applyUserData(freshUserData()));
        } finally {
          set({ loadingUser: false });
        }
      },

      signOut: () => {
        writeUser(get());
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
              inc: st.live.inc || 2.5,
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
          return { live: { ...st.live, liftIndex: i, w: wk.w, r: wk.r, restOn: false, rest: 0, restEndsAt: 0 } };
        }),

      nextLift: () => get().selectLift(get().live.liftIndex + 1),
      prevLift: () => get().selectLift(get().live.liftIndex - 1),

      // on-the-fly edits during a live workout
      liveSwapLift: (name) =>
        set((st) => {
          const live = st.live;
          if (!live.active) return {} as Partial<AppState>;
          const i = live.liftIndex;
          const cur = live.lifts[i];
          if (!cur || cur.name === name) return {} as Partial<AppState>;
          const id = Math.max(0, ...live.lifts.map((l) => l.id)) + 1;
          const lifts = live.lifts.map((l, idx) => (idx === i ? { id, name, sets: cur.sets, reps: cur.reps, kg: 0 } : l));
          const wk = workingFor(lifts[i], live.entries, st.sessions);
          return { live: { ...live, lifts, w: wk.w, r: wk.r, restOn: false, rest: 0, restEndsAt: 0 } };
        }),
      liveAddLift: (name) =>
        set((st) => {
          const live = st.live;
          if (!live.active) return {} as Partial<AppState>;
          const exists = live.lifts.findIndex((l) => l.name === name);
          if (exists >= 0) {
            const wk = workingFor(live.lifts[exists], live.entries, st.sessions);
            return { live: { ...live, liftIndex: exists, w: wk.w, r: wk.r, restOn: false, rest: 0, restEndsAt: 0 } };
          }
          const id = Math.max(0, ...live.lifts.map((l) => l.id)) + 1;
          const lift = { id, name, sets: 3, reps: 10, kg: 0 };
          const lifts = [...live.lifts, lift];
          const wk = workingFor(lift, live.entries, st.sessions);
          return { live: { ...live, lifts, liftIndex: lifts.length - 1, w: wk.w, r: wk.r, restOn: false, rest: 0, restEndsAt: 0 } };
        }),
      liveRemoveLift: () =>
        set((st) => {
          const live = st.live;
          if (!live.active || live.lifts.length <= 1) return {} as Partial<AppState>;
          const i = live.liftIndex;
          const lifts = live.lifts.filter((_, idx) => idx !== i);
          const ni = Math.min(i, lifts.length - 1);
          const wk = workingFor(lifts[ni], live.entries, st.sessions);
          return { live: { ...live, lifts, liftIndex: ni, w: wk.w, r: wk.r, restOn: false, rest: 0, restEndsAt: 0 } };
        }),

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
              restEndsAt: Date.now() + st.prefs.rest_default * 1000,
            },
          };
        }),

      skipRest: () => set((st) => ({ live: { ...st.live, rest: 0, restOn: false, restEndsAt: 0 } })),
      tickRest: () => {
        const { live } = get();
        if (!live.restOn) return;
        // wall-clock anchored, so a reload or iOS backgrounding can't desync the countdown
        const rest = live.restEndsAt
          ? Math.max(0, Math.round((live.restEndsAt - Date.now()) / 1000))
          : Math.max(0, live.rest - 1);
        if (rest === live.rest && rest > 0) return;
        set({ live: { ...live, rest, restOn: rest > 0 } });
      },

      finishWorkout: () =>
        set((st) => {
          const { live } = st;
          // include every logged exercise — even ones swapped out / removed mid-session
          const names = Array.from(new Set([...live.lifts.map((l) => l.name), ...Object.keys(live.entries)]));
          const entries: SessionEntry[] = names
            .map((name) => ({ name, sets: live.entries[name] ?? [] }))
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
      togglePlan: (name) =>
        set((st) => {
          const existing = st.plan.find((p) => p.name.toLowerCase() === name.toLowerCase());
          if (existing) return { plan: st.plan.filter((p) => p.id !== existing.id) };
          const id = Math.max(0, ...st.plan.map((p) => p.id)) + 1;
          const last = lastTopFor(st.sessions, name);
          return { plan: [...st.plan, { id, name, sets: 3, reps: 10, kg: last?.w ?? 0 }] };
        }),
      addCustomExercise: (name) =>
        set((st) => {
          const clean = name.trim().replace(/\s+/g, " ");
          if (!clean) return {} as Partial<AppState>;
          const lc = clean.toLowerCase();
          const known =
            EXERCISES.some((e) => e.name.toLowerCase() === lc) ||
            st.customExercises.some((c) => c.name.toLowerCase() === lc);
          const customExercises = known
            ? st.customExercises
            : [...st.customExercises, { name: clean, group: "Your exercises" }];
          let plan = st.plan;
          if (!plan.some((p) => p.name.toLowerCase() === lc)) {
            const id = Math.max(0, ...plan.map((p) => p.id)) + 1;
            const last = lastTopFor(st.sessions, clean);
            plan = [...plan, { id, name: clean, sets: 3, reps: 10, kg: last?.w ?? 0 }];
          }
          return { customExercises, plan };
        }),
      registerCustomExercise: (name) =>
        set((st) => {
          const clean = name.trim().replace(/\s+/g, " ");
          if (!clean) return {} as Partial<AppState>;
          const lc = clean.toLowerCase();
          const known =
            EXERCISES.some((e) => e.name.toLowerCase() === lc) ||
            st.customExercises.some((c) => c.name.toLowerCase() === lc);
          if (known) return {} as Partial<AppState>;
          return { customExercises: [...st.customExercises, { name: clean, group: "Your exercises" }] };
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

      // ---- sessions / reuse ----
      repeatSession: (id) =>
        set((st) => {
          const s = st.sessions.find((x) => x.id === id);
          if (!s) return {} as Partial<AppState>;
          const plan: PlanLift[] = s.entries
            .filter((e) => e.sets.length)
            .map((e, i) => {
              const top = e.sets.reduce((a, b) => (b.w > a.w ? b : a), e.sets[0]);
              return { id: i + 1, name: e.name, sets: e.sets.length, reps: top.r || 10, kg: snapWeight(top.w || 0) };
            });
          if (!plan.length) return {} as Partial<AppState>;
          return { plan, planTitle: s.title || "Workout", planFocus: s.focus || "SESSION", screen: "plan" };
        }),

      deleteSession: (id) => {
        set((st) => ({ sessions: st.sessions.filter((x) => x.id !== id) }));
        // authoritative replace so the server-side session-merge can't resurrect it
        writeUser(get(), { replace: true });
      },

      togglePin: (name) =>
        set((st) => ({
          pinned: st.pinned.includes(name) ? st.pinned.filter((n) => n !== name) : [...st.pinned, name],
        })),

      // ---- assistant ----
      generate: async (prompt) => {
        const cur = get();
        if (cur.assistant.status === "loading") return; // ignore rapid double-submit
        // Refine: if a plan is already on screen, send it as the draft so the model
        // edits THAT plan instead of starting over (live-AI path only).
        const existing = cur.assistant.plan;
        const draft = existing
          ? {
              title: existing.title.replace(/\n/g, " "),
              focus: existing.focus,
              duration_min: parseInt(existing.meta.match(/~(\d+)\s*MIN/i)?.[1] ?? "45", 10) || 45,
              exercises: existing.lifts.map((l) => ({
                name: l.name,
                sets: l.sets,
                reps: l.reps,
                load: l.load,
                note: l.note ?? "",
              })),
            }
          : undefined;
        set((st) => ({ assistant: { ...st.assistant, status: "loading", prompt, error: null } }));
        const { prefs, stances, sessions, apiKey, model } = get();
        const context = buildClientContext({ prefs, stances, sessions });
        try {
          const res = await fetch("/api/workout/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, context, draft, apiKey: apiKey || undefined, model }),
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
          // NOTE: we deliberately do NOT write durable banned stances from the prompt
          // here — "no back squats" is a one-off request (already honoured by the
          // generator), not a permanent preference. Bans are set explicitly in Library.
          return {
            plan: newPlan,
            planTitle: gen.title.replace(/\n/g, " "),
            planFocus: gen.focus,
            assistant: { ...st.assistant, status: "accepted" },
          };
        }),

      discardPlan: () => set((st) => ({ assistant: { ...st.assistant, status: "discarded" } })),
      resetAssistant: () => set((st) => ({ assistant: { ...st.assistant, status: "idle", plan: null } })),

      // ---- settings ----
      setApiKey: (k) => set({ apiKey: k.trim() }),
      setModel: (m) => set({ model: m.trim() || "anthropic/claude-sonnet-4.6" }),
      checkServerKey: async () => {
        try {
          const res = await fetch("/api/workout/generate");
          if (res.ok) {
            const { hasServerKey } = (await res.json()) as { hasServerKey?: boolean };
            set({ serverHasKey: !!hasServerKey });
          }
        } catch {}
      },
      setPref: (key, value) => set((st) => ({ prefs: { ...st.prefs, [key]: value } })),
      resetData: () => {
        set({
          sessions: [],
          stances: {},
          customExercises: [],
          plan: DEFAULT_PLAN,
          planTitle: "Push Day",
          planFocus: "HYPERTROPHY",
          live: emptyLive(),
          assistant: { status: "idle", plan: null, prompt: DEFAULT_PROMPT, error: null },
        });
        // authoritative wipe: replace the cloud doc so the session-merge can't resurrect it
        writeUser(get(), { replace: true });
      },
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
