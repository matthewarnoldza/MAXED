# MAXED — Progressive Overload

A personal, **iOS-first PWA** strength-training logger with an AI **memory layer**.
Brutalist heads-up display: the weight number is always the hero, everything else is
monospace scaffolding and 2px rules, one red signal colour. Light + true-black dark.

Two jobs:

1. **Log sets and chase PBs** — weight × reps per set, last session as a ghost target,
   a celebration when you beat a personal best, rest timer between sets.
2. **AI workout plans that remember you** — the assistant assembles your athlete
   profile (goals, banned lifts, PBs, recent sessions) from Turso and injects it into
   every OpenRouter call, then a structured plan lands in a preview/confirm flow.

> The AI doesn't have hidden memory — it's **structured state injection**. We read the
> memory tables, render a compact markdown profile, and put it in front of the model on
> every request. Small, finite, structured data → **a `WHERE` clause is the retrieval.**
> No embeddings, no vector search, no stored transcripts. (See `lib/context.ts`.)

## Stack

- **Next.js 15** (App Router, route handlers) + **React 19** + **TypeScript**
- **Zustand** for client state (offline-first; theme persisted to `localStorage`)
- **Turso / libSQL** (`@libsql/client`) — the memory substrate
- **OpenRouter** — model access (default `anthropic/claude-sonnet-4.6`)
- Self-hosted **Anton / Archivo / JetBrains Mono** via `next/font`
- PWA: web manifest + maskable icons (generated from `public/icon.svg`)

## Screens (the seven-screen flow, with real navigation)

`Launch → Home → Workout Plan → Library → Assistant → Set Logger → History`

Launch auto-advances. Home **Start** → Logger; tap the title → Plan; tap a lift → History.
Plan reorders with ▲/▼ and **+ Add from library** → Library. Library search + PUSH/PULL/LEGS
filters and **Ask Coach AI** → Assistant. Assistant generates → preview → Accept/Discard/Undo.
Set Logger has the 94px hero number, ±5 kg steppers, rep steppers, the set ledger with a ghost
target row, live rest timer, and the PB flash + celebration. History has the PB callout, the
brutalist bar chart, session list and notes.

## Project layout

```
app/
  layout.tsx            fonts, metadata, PWA hooks
  page.tsx              renders <AppShell/>
  manifest.ts           web manifest
  api/
    sets/route.ts             POST a logged set (returns pb flag)
    workout/generate/route.ts POST { prompt, draft? } → context packet → OpenRouter → JSON plan
    workout/finalize/route.ts POST accepted workout + preference write-back
components/
  AppShell.tsx          theme attr, rest-timer tick, screen router
  Phone.tsx             device viewport (status bar / island / home indicator — not the bezel)
  screens/*             the seven screens
  ui/icons.tsx          inline SVG marks incl. the OVERLOAD arrow
lib/
  db.ts                 libSQL client (server-only)
  context.ts            buildAthleteContext() — the injected markdown packet
  schema.ts             WORKOUT_SCHEMA (forced JSON) + system prompt
  openrouter.ts         the AI call
  tokens.ts format.ts exercises.ts
db/
  schema.sql seed.sql   the memory tables + starter data
scripts/
  migrate.mjs           apply schema/seed against Turso
store/useApp.ts         all client state + interactions
```

## Getting started

```bash
npm install
cp .env.example .env.local      # then fill in real values (already done locally)
npm run db:reset                 # create tables + seed starter data (needs Turso reachable)
npm run dev                      # http://localhost:3000
```

### Environment variables

Set these in `.env.local` (local) **and** in Vercel → Project Settings → Environment Variables (prod).
**Never commit secrets** — `.env.local` is git-ignored.

| Var | Purpose |
|---|---|
| `TURSO_DATABASE_URL` | libSQL URL, e.g. `libsql://<db>.turso.io` |
| `TURSO_AUTH_TOKEN` | Turso database auth token |
| `OPENROUTER_API_KEY` | OpenRouter key (`sk-or-v1-…`) |
| `OPENROUTER_MODEL` | default `anthropic/claude-sonnet-4.6` |
| `OPENROUTER_APP_URL` / `OPENROUTER_APP_TITLE` | OpenRouter attribution headers |

### Database

```bash
npm run db:migrate     # apply schema.sql (idempotent)
npm run db:seed        # + seed.sql
npm run db:reset       # drop, recreate, seed
```

## Turso MCP (manage the DB from Claude Code)

`.mcp.json` registers the [`mcp-turso`](https://www.npmjs.com/package/mcp-turso) server using
**env-var expansion** (no secret in the file). Export the two Turso vars in the shell that runs
Claude Code (e.g. `set -a; source .env.local; set +a`) and approve the server when prompted.

## Deploy (Vercel)

1. Push to GitHub (`matthewarnoldza`).
2. Import the repo in Vercel (framework auto-detected: Next.js).
3. Add the env vars above (Production + Preview).
4. Deploy. Run `npm run db:reset` once against the production Turso DB to provision it.

## Offline-first & graceful degradation

Logging a set updates the UI instantly and persists in the background; a failed write never
blocks. If the AI route is unreachable, the assistant falls back to a sample plan so the flow
stays demoable. Both behaviours are intentional (gym signal is patchy).

---

The original design exploration (HTML prototypes, logo options, font tests, the handoff spec,
and screenshots) lives in [`project/`](./project) and the conversation in [`chats/`](./chats).
The chosen logo is **02 · OVERLOAD** (Anton "MAXED" + red progressive-overload arrow).
