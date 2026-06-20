# Handoff: MAXED — Strength-Training Logger (iOS-first PWA)

## Overview
**MAXED** is a personal strength-training companion app. Two core jobs:
1. **Log sets and chase PBs** — record weight + reps per set, see last session as a ghost target, get a celebration when you beat a personal best.
2. **Receive AI-generated workout plans** — an assistant generates a plan that lands in a preview/confirm flow before being accepted.

The aesthetic is a **brutalist heads-up display**: the weight number is always the hero; everything else is monospace scaffolding and 2&nbsp;px rules, with a single red signal colour. It ships with light and **true-black dark mode** for the dark gym.

This package documents the **full product flow (7 screens)** and the **final logo**.

## About the Design Files
The files in `design_files/` are **design references created in HTML** — prototypes showing the intended look and behaviour, **not production code to copy directly**. They are authored as "Design Components" (`.dc.html`) and rely on a small runtime (`support.js`); that runtime is an authoring convenience, **not** something to ship.

**Your task:** recreate these designs in the target codebase's existing environment (React Native / Expo, SwiftUI, React PWA, etc.) using its established patterns, component library, and navigation. If no codebase exists yet, choose the most appropriate framework for an **iOS-first installable PWA** (e.g. React + Vite + a PWA plugin) and implement there. Do not ship the HTML.

To preview the prototypes: open any `.dc.html` in `design_files/` directly in a browser (they self-load `support.js` from the same folder).

## Fidelity
**High-fidelity (hifi).** Final colours, typography, spacing, and interactions are specified below — recreate the UI pixel-accurately using the codebase's libraries. The device bezel (`IPhone.dc.html`) is only a presentation frame around each screen; implement the screen content, not the bezel.

---

## Design Tokens

### Colour (semantic, themed)
Implemented in the prototype as CSS variables that flip on a `data-mx-theme` attribute. Map these to your theme system.

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#F4F4F0` | `#0B0B0B` | screen background |
| `ink` | `#111111` | `#F4F4F0` | primary text, borders, filled blocks |
| `accent` | `#FF2D00` | `#FF3B12` | the one red signal — TODAY tag, PB, arrows, primary CTA |
| `line` | `rgba(0,0,0,.16)` | `rgba(255,255,255,.15)` | hairline dividers |
| `soft` | `rgba(0,0,0,.05)` | `rgba(255,255,255,.05)` | chart fills, subtle surfaces |
| `sub` | `#7A7A76` | `#8A8A86` | secondary / label text |
| `on-accent` | `#FFFFFF` | `#FFFFFF` | text/icons on the red field |

**Brutalist inversion rule:** "filled" elements (primary buttons, rest bar, the `+` stepper) use `ink` as background and `bg` as text — so they read as a dark block in light mode and a white block in dark mode. The red CTA (Log Set) is the exception: always `accent` background with `#FFFFFF` text.

### Typography
Three families (all on Google Fonts):
- **Anton** — display: the weight number, screen titles, the wordmark. `text-transform: uppercase`, `letter-spacing: -.5px to -3px` (tighter at larger sizes), `line-height: ~0.82–0.9`.
- **Archivo** — UI/body: exercise names (700), prompt copy, headings (800/900). Wordmark fallback weight 900.
- **JetBrains Mono** — labels, numeric data, metadata, status tags. Usually uppercase, `letter-spacing: 1–3px`, weight 400–700.

Representative sizes (px): hero weight number **94**, screen title (Anton) **30–44**, splash wordmark **92**, set-row weight (Anton) **24**, body/exercise name (Archivo 700) **15–17**, mono labels **9–13**.

### Spacing / structure
- Screen side padding: **22px**. Top padding clears the status bar/Dynamic Island (~**54–58px**); bottom clears the home indicator (~**30px**).
- Rules: **2px** solid `ink` for structural dividers; **1px** `line` for list separators.
- No border-radius on most chrome (brutalist). Exceptions: app-icon tiles **18px**, the PLATE logo mark's corners.
- **Tap targets ≥ 44px.** Hero weight steppers are **74×74**, rep steppers **60px** tall, secondary icon buttons **34–38px**.

### Radii / shadows
- Shadows are essentially absent (flat brutalism). The only shadow in the system is the device bezel, which you will not ship.

---

## Logo — "OVERLOAD" (final, locked)
Horizontal/stacked lockup, **monochrome mark + red signal**:
- Wordmark **"MAXED"** in **Anton**, uppercase, `letter-spacing: -3px`, colour = `ink`.
- A **red up-triangle** (progressive-overload arrow) immediately after the wordmark, top-aligned to the cap height. Built as a CSS triangle: `border-left/right: 17px solid transparent; border-bottom: 30px solid accent;` (scale the 17/30 ratio with the wordmark size). Colour = `accent`.
- Subtitle **"PROGRESSIVE OVERLOAD"** in JetBrains Mono, 12px, `letter-spacing: 5px`, colour = `accent`.

Variants to produce: full lockup on `bg`; reversed lockup on `accent` (white); app icon = red tile with a white "MX" + white up-triangle. See `design_files/MAXED - Logo Options.dc.html` (option **02 · OVERLOAD**) for exact construction; it also shows the dark and app-icon treatments.

The logo appears on the **Launch / Splash** screen.

---

## Screens / Views
Order in the prototype = the intended flow. All 7 are in `design_files/MAXED - Full Flow.dc.html`.

### 1. Launch / Splash
- **Purpose:** PWA cold-start / added-to-home-screen splash.
- **Layout:** vertically centred column. Centre: mono kicker `EST. 2024 · DAY 214`, then the OVERLOAD logo lockup, then `PROGRESSIVE OVERLOAD` subtitle. Bottom: a thin **load bar** (a red fill animating width 0→100% over ~1.6s) above a mono row `OFFLINE READY` / `v2.0`.
- **Notes:** keep it instant; this is a static splash, not a loading gate.

### 2. Home / Today
- **Purpose:** what am I training today + a big start button + glanceable progress.
- **Layout:** top bar (`DAY 214` left; `STREAK 12` + dark-mode toggle right) under a 2px rule. Red kicker `TODAY · WED 12 MAR`, then Anton title `SQUAT DAY`. A 3-cell stat strip (`VOLUME 14.2T`, `E1RM 154`, `PBs/MO 5` — the last in red) bounded by 2px rules. Then a numbered exercise list (`01 Back Squat … 5×5 · 140`). Pinned bottom: full-width **Start** button (filled `ink`, Anton 32px, with a red ▶).
- **Components:** dark-mode toggle is a 34×28 bordered icon button (sun/moon).

### 3. Workout Plan
- **Purpose:** review and reorder today's prescribed plan, then start.
- **Layout:** back row (`‹ HOME`, red `PLAN`), title `SQUAT DAY`, mono meta `4 LIFTS · 15 SETS · ~45 MIN`. Scrollable list: each row = big Anton index (`01`), exercise name + mono target (`5 × 5 · 140KG`), and a stacked **▲ / ▼ reorder control** on the right. A dashed "+ ADD FROM LIBRARY" row at the end. Footer: `EDIT` (outline) + `Start ▶` (red).
- **Interaction:** ▲/▼ actually reorder the list (swap with neighbour; no-op at ends).

### 4. Exercise Library
- **Purpose:** search/filter exercises to add to a workout.
- **Layout:** back row, title `ADD A LIFT`. A bordered **search field** (magnifier + mono uppercase input, placeholder `SEARCH LIFTS`). Category chips `ALL / PUSH / PULL / LEGS` (active = filled `ink`, idle = outline). 2px rule, then a scrollable list: name (Archivo 700) + mono `CATEGORY · MUSCLE`, with a square `+` add button. Empty state: `NO LIFTS MATCH "<query>"`.
- **Interaction:** typing filters by name (case-insensitive contains); chips filter by category; both combine.

### 5. New from Assistant
- **Purpose:** preview an AI-generated plan and accept/discard it.
- **Layout:** back row + a pulsing red `● INCOMING` tag. Mono `COACH AI · GENERATED A PLAN`, Anton title `PUSH DAY A`, mono meta `6 LIFTS · 22 SETS · ~48 MIN · HYPERTROPHY`. A bordered "YOU ASKED" block echoing the prompt. Scrollable exercise preview (name + mono target; a red `+2.5` highlights a progression). Footer actions.
- **Interaction (3 states):** `pending` → shows `DISCARD` (outline) + `Accept plan` (red). `accepted` → filled `ink` confirmation `ADDED TO PLAN ✓` with `UNDO`. `discarded` → outline `PLAN DISCARDED` with `UNDO`.

### 6. Set Logger — THE HERO
- **Purpose:** log weight × reps per set, beat PBs, rest between sets.
- **Layout (top → bottom):** a 3-segment **exercise progress bar** (first segment red). Mono `EXERCISE 01 / 03` + red `PB 140`. Title `Back Squat` (Anton, single line) + mono `vs LAST +5` (delta in red). **Hero number row:** giant `−` stepper (74×74 outline) · the weight in Anton **94px** with mono `KILOS · +5` under it · giant `+` stepper (74×74 filled). Below, a reps row bounded by 2px rules: `−` | `3 REPS` (Anton) | `+`. Then the **set ledger** (scrollable): `SET 1  130 × 5`, `SET 2  135 × 3`, …, plus a dimmed ghost row `SET 3  TARGET 135 × 3`; a beaten set gets a red `PB` tag. Pinned bottom: optional **rest bar** (filled `ink`: `REST` / mono countdown / red `SKIP`), the red **Log set N** button, and a mono footer `SWIPE TO ADVANCE` / `NEXT: ROMANIAN DL ›`.
- **Interactions:**
  - `−`/`+` weight: step by **inc = 5kg** (default increment per direction; metric, supports 2.5kg granularity). Clamp ≥ 0.
  - `−`/`+` reps: step by 1, clamp ≥ 1.
  - **Log set:** append `{w, r}` to the set list; if `w > pb`, set new `pb`, fire **PB celebration** (a centred red "NEW PB" card, ~2.4s) and a full-screen red **flash** (~0.6s); start the **rest timer** at **120s**.
  - **Rest timer:** counts down once per second; `SKIP` zeroes it.
- **One-handed:** all primary actions sit in the bottom third within thumb reach; targets are oversized.

### 7. Exercise Detail / History
- **Purpose:** weight-over-time, current PB, session history, notes.
- **Layout:** back row, title `BACK SQUAT`. A PB callout block (`CURRENT PB` / Anton `140` in red / mono `×3 · 12 MAR`) beside a 2-cell stat column (`E1RM 154`, `SESSIONS 24`), all bounded by 2px rules. A **bar chart** (`TOP SET · 9 WEEKS`): ascending bars built from divs — most are `line`/`soft` fills, recent ones outlined in `ink`, the latest (PB) solid `accent`; baseline 2px rule; mono axis labels `JAN / FEB / NOW`. Session list: mono date + set summary with a red `★` on PB sets. A bordered **NOTES** block with `+ ADD`.

---

## Interactions & Behaviour (summary)
- **Dark mode:** a global toggle flips every screen by swapping the themed colour tokens (prototype: `data-mx-theme="light|dark"` on a root element). Provide an in-app toggle (top bar) and persist the choice.
- **PB celebration:** trigger only when logged weight strictly exceeds the stored PB. Card pop ~0.5s ease-out + a red flash fading ~0.6s. (Add haptics on device.)
- **Rest timer:** 120s default, 1s tick, skippable; consider a local notification when it hits 0.
- **Plan reorder:** immediate swap; disable/no-op at list ends.
- **Library filter:** text contains (case-insensitive) AND category equality.
- **Assistant:** `pending → accepted | discarded`, both reversible via UNDO.
- **Offline-first:** logging a set must feel instant and never block on network (the brief is explicit about patchy gym signal). Persist locally; sync opportunistically.
- **iOS safe areas:** keep nothing critical under the Dynamic Island or home indicator; honour `env(safe-area-inset-*)`.

## State Management
Minimal local state (prototype shape — adapt to your store):
- `theme: 'light' | 'dark'`
- `log: { w, r, inc, pb, last:{w,r}, sets:[{w,r,pb?}], rest, restOn, flash, pbFire }`
- `plan: [{ id, name, sets, reps, kg }]` (order is user-editable)
- `library: { query, category }` over a static exercise list `[{ name, category, muscle }]`
- `assistant: 'pending' | 'accepted' | 'discarded'`
- Derived per render: `e1rm = round(w * (1 + r/30))`, `volume = Σ(w·r)`, `delta = w − last.w`, formatted `m:ss` rest, next set number.

Data fetching: only the assistant plan is "fetched" (mock here). Everything else is local + persisted; a real build needs local persistence (e.g. IndexedDB / SQLite / AsyncStorage) and a sync layer.

## Assets
- **No raster image assets.** All marks/icons are CSS shapes + inline SVG paths (peak triangle, chevrons, plate, the overload arrow, status-bar glyphs).
- **Fonts:** Anton, Archivo, JetBrains Mono — load from Google Fonts (or self-host equivalents).
- **Device bezel** (`IPhone.dc.html`) is presentation-only — do not reproduce it in the app.

## Files
In `design_files/`:
- `MAXED - Full Flow.dc.html` — all 7 screens + the launch logo; contains the full interaction logic (steppers, timer, PB, plan reorder, library filter, assistant, dark mode).
- `IPhone.dc.html` — the device-frame component used to present each screen (presentation only).
- `MAXED - Logo Options.dc.html` — logo explorations; the chosen mark is **02 · OVERLOAD** (light, dark, and app-icon constructions).
- `support.js` — the Design-Component runtime that lets the `.dc.html` files open in a browser. Authoring tool only; not for production.

Open the `.dc.html` files in a browser to see the designs live (light/dark toggle is in the top bar).

## Screenshots
Static reference images of every screen are in `screenshots/` (light mode, flow order):
1. `01-launch.png` — Launch / Splash (OVERLOAD logo)
2. `02-home.png` — Home / Today
3. `03-workout-plan.png` — Workout Plan (reorderable)
4. `04-exercise-library.png` — Exercise Library (search + filter)
5. `05-new-from-assistant.png` — New from Assistant (preview/confirm)
6. `06-set-logger.png` — Set Logger (hero)
7. `07-history.png` — Exercise Detail / History

**Note on type in the screenshots:** layout, colour, spacing and content are accurate, but the capture engine can't embed the web fonts, so the **Anton** display face falls back to a serif in these images. The real typography is as specified in **Design Tokens → Typography** (Anton for the big numbers/titles/wordmark). Open the live `.dc.html` files to see the true type.
