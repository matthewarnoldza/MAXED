# Design Brief — Personal Gym Tracker (web app, iOS-first)

Design a personal strength-training companion web app. It's a PWA used by one person (me) mid-workout, so it has to be fast, glanceable, and usable one-handed with sweaty hands and a short attention span. Speed and legibility beat density and polish-for-polish's-sake.

I want **5 distinct design directions** — different aesthetics *and* different interaction models, not five recolours of one layout.

## What the app does

Two core jobs:

1. **Log sets and chase PBs.** For each exercise I record weight + reps per set. The app remembers last session's numbers, surfaces my personal best, and makes it obvious whether I'm beating it. Progressive overload is the whole point — the design should make "did I beat last time?" answerable in a glance.
2. **Receive AI-generated workout plans.** I'll ask an assistant to generate a workout; it arrives in the app as a structured plan I can preview, accept, and start. Design needs a clean "new plan incoming" flow.

## Context of use (design for this, not a desk)

- Standing in a gym, phone held in one hand or propped against a bench
- Sweaty fingers, gloves sometimes — large tap targets, forgiving hit areas
- Between sets, ~30–90 seconds of attention, often glancing not reading
- Variable lighting: bright daylight gym and dim dark gym both happen
- Patchy signal — should feel instant, never wait on network to log a set

## Screens to design

Design all of these; show at least the **Home** and **Active Workout / Set Logger** screens for every one of the 5 directions.

1. **Home / Today** — what am I training today, a big start button, recent activity, quick glance at streak/progress.
2. **Active Workout — Set Logger (the hero screen).** Current exercise up top, sets listed as rows (set 1, 2, 3…), fast weight + reps entry, last-session numbers shown as ghost targets, PB flag when I beat it, a rest timer, and a clear way to move to the next exercise. This screen earns or loses the whole app — give it the most attention.
3. **Exercise Detail / History** — weight-over-time chart, current PB, last session, set history, optional notes.
4. **Workout Plan view** — the prescribed plan: exercises with target sets/reps/weight, reorderable, with a start button.
5. **Exercise Library** — searchable list of exercises to add to a workout.
6. **New Workout from Assistant** — how an AI-suggested plan lands: a preview/confirm state showing the plan before I accept it into my list.

## Interactions to nail

- **Weight & reps entry is the critical interaction.** Show me two approaches across the directions so I can judge which is faster in practice:
  - **Wheel/scroll pickers** (iOS-native feel, scrub to value)
  - **Big +/- steppers** with a configurable increment (default 2.5kg, plate-aware) and a tap-to-type fallback
  Whichever a direction uses, it must be operable with one thumb without precision.
- **One-thumb reachability** — primary actions live in the bottom third of the screen, within thumb arc.
- **Logging a set is one tap** and gives immediate, satisfying confirmation (motion/colour/haptic-style feedback). Beating a PB deserves a moment of celebration.
- **Rest timer** is glanceable — readable across the gym, easy to start/skip.
- **Swipe or single-tap to advance** to the next exercise.

## The 5 directions — make them genuinely different

I want a real spread. As a starting palette of ideas (you can substitute better ones):

- **Apple-native** — clean, airy, SF Pro, soft cards, light mode, feels like an Apple Health/Fitness extension.
- **Dark-first / neon** — OLED black, high contrast, one electric accent colour, built for glanceability in a dark gym.
- **Big-number brutalist** — the weight number is the hero, huge typography, minimal chrome, almost a heads-up display.
- **Warm editorial** — softer, less clinical, friendlier type and colour, feels human rather than sterile.
- **Pro-athlete data** — for someone who loves the numbers; denser, charts and PBs forward, stat-line energy.

For each direction give: a name, a one-line mood, the palette, the typography, and specifically how the **set-logger screen** looks and behaves.

## Platform & technical constraints (they shape the visuals)

- PWA running in iOS Safari, added to home screen — design for that, including a launch/splash feel.
- Respect iOS safe areas: notch/Dynamic Island at top, home-indicator gap at bottom. Keep nothing critical under either.
- Minimum 44pt tap targets; prefer larger for in-gym use.
- Must stay legible in bright sun and in a dark gym — consider contrast and an optional dark mode per direction.
- Snappy, native-feeling transitions; no web-page scroll jank.

## Deliverable

5 distinct directions. For each: the Home and Active Workout / Set Logger screens at minimum, plus a one-paragraph rationale covering who it's for and why the logging interaction works. Treat the set logger as the screen that decides everything.
