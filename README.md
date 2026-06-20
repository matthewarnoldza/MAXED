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
> memory (your logged sets + stated preferences), render a compact markdown profile, and
> put it in front of the model on every request. Small, finite, structured data →
> **a filter is the retrieval.** No embeddings, no vector search, no stored transcripts.
> The packet is built client-side from the signed-in user's own data — see `lib/profile.ts`
> + `lib/derive.ts` — cached on-device and synced per-user to Turso.

## Stack

- **Next.js 15** (App Router, route handlers) + **React 19** + **TypeScript**
- **Multi-user** — name-only sign-in (tap to switch). Each person's whole history is one JSON
  document in Turso, loaded on sign-in and synced on every change. Separate histories per phone.
- **Zustand** (+ `persist`) — identity lives on-device; per-user training data is cloud-backed
  with a `localStorage` cache, so logging is instant and survives refresh (even mid-session).
- **Turso / libSQL** (`@libsql/client`) — the accounts + sync backend (`users` + `user_state`).
  In local dev with no DB configured, an in-memory fallback keeps everything working.
- **OpenRouter** — model access (default `anthropic/claude-sonnet-4.6`). **Optional:** paste a
  key in **Settings** or set an env var. With no key, a built-in **on-device coach** still
  generates real, tailored plans from your history.
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
    auth/route.ts             POST { name } → create a person (users row)
    state/route.ts            GET/POST a user's whole state document (user_state)
    workout/generate/route.ts POST { prompt, context, apiKey? } → OpenRouter → JSON plan
components/
  AppShell.tsx          theme attr, auth gate, per-user cloud sync, rest tick, screen router
  Phone.tsx             device viewport (status bar / island / home indicator — not the bezel)
  screens/*             Launch · Login · Home · Plan · Library · Assistant · SetLogger · History · Settings
  ui/icons.tsx          inline SVG marks incl. the OVERLOAD arrow
lib/
  db.ts                 libSQL client (server-only)   ·   devstore.ts  in-memory dev fallback
  profile.ts            buildClientContext() — the injected markdown packet (client-side)
  derive.ts             PBs / per-lift history / home stats, computed from logged sessions
  generator.ts          the on-device coach (offline AI fallback)
  schema.ts openrouter.ts  forced-JSON contract + the AI call
  tokens.ts format.ts exercises.ts types.ts
db/
  schema.sql            users + user_state (the multi-user store)
scripts/
  migrate.mjs           apply / reset the schema against Turso
  verify-db.mjs         connect, list tables, round-trip read/write test
store/useApp.ts         all client state, auth, and cloud sync
```

## Getting started

```bash
npm install
npm run dev                      # http://localhost:3000 — works immediately, zero config
```

In local dev this runs with **no configuration** — an in-memory store backs accounts, so you can
sign in, log, switch users and refine plans immediately.

**For real multi-user / multi-device** (each phone keeping its own cloud history), set the Turso
vars and provision the schema once:

```bash
cp .env.example .env.local       # fill in TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
npm run db:reset                  # create the users + user_state tables
node scripts/verify-db.mjs        # confirm connection + read/write
```

**Live AI** (optional): open **Settings** and paste an `openrouter.ai` key (stored on-device,
used per-request), or set `OPENROUTER_API_KEY`. With no key, the on-device coach generates plans.

### Accounts (you + whoever else)

Name-only sign-in: at **Launch → Login**, tap a name or **+ Add person**. Each profile is a row
in `users`; all of that person's training data is one JSON document in `user_state`, loaded on
sign-in and synced on every change. **Switch user / Sign out** live in **Settings**. Profiles are
remembered per device, so each phone just taps in once. No password — by design (ids are random
and never listed); if you clear the browser's site data you'll re-create the profile.

### Where do I request a workout?

**Home → “✦ ASK COACH AI — NEW WORKOUT”** (or the ✦ button on Plan / Library). Describe what
you want (`"45-min push, no deadlifts, push my bench"`), generate, preview, and **Use this
plan**. Your bans/PBs/recent sessions are injected automatically, so it gets more "you" over time.

### Environment variables

Set these in `.env.local` (local) and Vercel → Project Settings → Environment Variables (prod).
**Never commit secrets** — `.env.local` is git-ignored. The Turso vars power accounts + sync
(required for real multi-device use; dev has an in-memory fallback). OpenRouter is optional.

| Var | Purpose |
|---|---|
| `TURSO_DATABASE_URL` | libSQL URL, e.g. `libsql://maxed-<org>.turso.io` — accounts + per-user sync |
| `TURSO_AUTH_TOKEN` | Turso **read-write** auth token — accounts + per-user sync |
| `OPENROUTER_API_KEY` | OpenRouter key (`sk-or-v1-…`) — server-side AI. Or paste a key in **Settings**. Without either, the on-device coach is used. |
| `OPENROUTER_MODEL` | default `anthropic/claude-sonnet-4.6` |
| `OPENROUTER_APP_URL` / `OPENROUTER_APP_TITLE` | OpenRouter attribution headers |

### Database

```bash
npm run db:migrate          # apply schema.sql (idempotent: users + user_state)
npm run db:reset            # drop + recreate the tables
node scripts/verify-db.mjs  # connect, list tables, round-trip read/write test
```

> One Turso DB is shared by local dev and production. `verify-db.mjs` is the quickest way to
> confirm the URL + token are correct and the schema is in place.

## Managing the DB from Claude Code

The `verify-db.mjs` / `migrate.mjs` scripts (above) use the same `@libsql/client` engine and are
the simplest way to inspect or migrate the DB — no MCP required. `.mcp.json` also registers the
[`mcp-turso`](https://www.npmjs.com/package/mcp-turso) server via env-var expansion; to use it,
export the Turso vars **before** launching Claude Code (`set -a; source .env.local; set +a`) and
approve the server when prompted.

## Deploy (Vercel)

1. Push to GitHub (`matthewarnoldza`). `.env.local` is git-ignored, so secrets stay local.
2. Import the repo in Vercel (framework auto-detected: Next.js).
3. Add these env vars (Production + Preview) — copy the values from your `.env.local`:
   ```
   TURSO_DATABASE_URL=libsql://maxed-matthewarnoldza.turso.io
   TURSO_AUTH_TOKEN=…
   OPENROUTER_API_KEY=…
   OPENROUTER_MODEL=anthropic/claude-sonnet-4.6
   ```
4. The Turso schema is already provisioned (one shared DB). If you ever recreate the DB, run
   `npm run db:reset` against it once.
5. Deploy.

## Offline-first & graceful degradation

Logging a set updates the UI instantly; the per-user document is cached on-device and synced to
Turso in the background (debounced, plus an immediate flush when the app is backgrounded), so a
flaky gym connection never blocks you. If the AI route is unreachable the assistant falls back to
the on-device coach; if the DB is unreachable, dev uses an in-memory store. All intentional —
gym signal is patchy.

---

The original design exploration (HTML prototypes, logo options, font tests, the handoff spec,
and screenshots) lives in [`project/`](./project) and the conversation in [`chats/`](./chats).
The chosen logo is **02 · OVERLOAD** (Anton "MAXED" + red progressive-overload arrow).
