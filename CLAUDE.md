# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What This Is

Friend Garden is a gamified CRM: friends are plants in a community garden plot, and staying in touch is "watering" them. Neglect wilts a plant; neglect the whole garden and Private Equity bulldozes it. It's designed as a cross of Animal Crossing (visiting others' spaces), Harvest Moon (tending/growth loop), and a CRM (tracking real relationships), with AI-generated flavor text (Claude Haiku) planned and eventual network-science analysis of friend-group structure.

Full architecture (current + target diagrams) and the prioritized backlog live in **`ROADMAP.md`**; the full user-interaction and data-flow walkthrough lives in **`USER_FLOWS.md`** — read both before planning any non-trivial change. This file is deliberately kept short; don't duplicate their content here.

## Current State — Read This Before Assuming Anything Exists

**This is a local-only, single-user prototype today.** There is no backend, no auth, no network calls, no Claude/Anthropic integration, and no Supabase — despite those being part of the target architecture. Everything lives in on-device SQLite. If you're asked to work on multi-user features (plots, chat, other people's gardens, calendar/contact matching against real accounts), the backend in `ROADMAP.md` Tier 1 needs to exist first — check whether it's landed before building on top of it.

## Architecture

```
Screens/Components → Hooks (useFriends, useToday, useDashboard, useLogContact...) → Drizzle queries → expo-sqlite (on-device)
```

- **App**: Expo SDK 54, Expo Router (file-based, typed routes), React 19, Reanimated 4, TypeScript. All screens under `src/app/`.
- **Persistence**: `expo-sqlite` + Drizzle ORM (`drizzle.config.ts`: `dialect: 'sqlite', driver: 'expo'`). Schema in `src/db/schema.ts`, queries in `src/db/queries/`.
- **Business logic**: pure, tested functions in `src/lib/` (`health.ts` — the wilting/decay scoring, `streak.ts`, `filters.ts`, `today.ts`, `dashboard.ts`, `birthdayNotifications.ts`). Keep logic here decoupled from the data-access layer — this is what let the target-architecture migration plan treat persistence as swappable without touching business rules.
- **State**: Zustand (`src/store/useGardenStore.ts`) is strictly limited to ephemeral UI-only state (filters, modal state, onboarding step). Server data always lives in React Query's cache via hooks, never duplicated into Zustand — this boundary is deliberate, not incidental; don't blur it.

## Common Commands

```bash
npm install
npx expo start          # dev server
npm run ios             # iOS simulator
npm run android         # Android emulator
npm run web             # web preview
npm run lint            # expo lint
npm test                # jest
```

## Database Schema (current)

SQLite via Drizzle, `src/db/schema.ts`:
- `friends` — name, tag, `plantType`, `cadenceDays` (watering interval), phone, email, bio, birthday, location, `lowTouch`, `snoozeUntil`, `archived`.
- `contactLogs` — `friendId`, timestamp, direction, channel, note. One row per logged interaction ("watering").
- `notes` — `friendId`, body, tag.
- `meta` — key/value.

Target Postgres/Supabase schema (`friends` additions, `plots`/`plot_members`, `conversations`/`conversation_members`/`messages`, `profiles`, `push_tokens`, `identifier_lookup`, RLS policies) is designed but not yet implemented — see `ROADMAP.md` Tier 1. No standalone `friend_edges` table — see `ROADMAP.md` System Design Notes for why.

## Key Design Decisions

- **External integrations fail independently and run in parallel, never serially** — one integration erroring (Haiku, Calendar, etc.) must never block or crash an unrelated flow; independent external calls within one action (e.g. Haiku + installed-app probing in the reach-out flow) run concurrently, not sequentially. Each has a kill-switch config flag (`ROADMAP.md` T1-12) to disable it server-side without a release. See `ROADMAP.md`'s External Integration Strategy for the full importance/maintenance ranking.
- **Schema changes are additive-only by default** — new fields/tables are nullable/backward-compatible; a genuinely breaking change needs expand-contract across two releases, never a single cutover, since the backend deploys independently of any client's update cadence (multiple app versions talking to one backend is the constant state, not an edge case). Client code must tolerate fields it doesn't recognize, and new multi-user features must degrade gracefully for an out-of-date peer, never break their core functionality. See `ROADMAP.md` T1-11 (minimum-supported-version gate) and System Design Notes.
- **Every table gets RLS enabled in the same migration that creates it, before any policy exists** — a table with RLS never enabled is openly exposed via Supabase's auto-generated API by default, regardless of intent. `profiles` read is relationship-scoped (`EXISTS` against `friends.friend_user_id` or shared `plot_members`), never owner-only (can't show a friend's name/avatar) or open to any authenticated user (enables stranger profile enumeration).
- **Backend code is never called directly by the client** — hooks call a thin typed API layer (`src/api/*.ts`, built on `supabase gen types typescript`), never `supabase-js` directly. Server-side logic (Haiku proxy, decay engine, contact-discovery) is one Edge Function per concern (`supabase/functions/<name>`, standard Supabase layout, `_shared/` for common code), not one monolithic routed function — keeps each function's secret access scoped to what it actually needs.
- **Function deploy + secrets ride the same CI job as DB migrations** — `supabase functions deploy` and `supabase secrets set` (sourced from GitHub Environments) run alongside `supabase db push` on push to `main`/`release`, migrations step first.
- **The decay engine is scheduled via Supabase's own `pg_cron`**, not an external scheduler — keeps the trigger inside Supabase, versioned in a migration.
- **DB migration tooling is hybrid** — Drizzle (`dialect: 'postgresql'`) defines the schema and generates types for the app to query against, but it never applies migrations directly. Generated SQL gets committed into `supabase/migrations/` and applied only via `supabase db push`, so Supabase's own migration history remains the single system of record. Never run `drizzle-kit push`/`migrate` (or an equivalent Prisma command) directly against the database.
- **Environments**: local Supabase CLI (Docker) for dev, one hosted project shared for beta (dev + TestFlight/Play testers). Deploy is branch-based: PRs merge to `main`, a GitHub Action pushes committed migrations to the shared/staging project. A `release` branch + separate production project comes later (`ROADMAP.md` T1-1b) — the workflow's branch→environment mapping is already written to support it via GitHub Environments, so adding it is additive, not a rewrite.
- **Auth starts at email/password only** — add Sign in with Apple before any public App Store submission; never ship Google sign-in on iOS without Apple alongside it (required by App Store Guideline 4.8). Magic link/phone OTP/social are deferred (`ROADMAP.md` T4-6), not needed for beta.
- **Auth-gated navigation uses Expo Router route groups** (`(auth)` vs `(app)`, redirect based on session in the root `_layout.tsx`) — not conditional root rendering.
- **Offline is online-required with cached reads + an indicator, not offline-first** — proportionate to a CRM check-in app; writes fail with a clear message when offline rather than silently queuing.
- **Theming stays minimal until a designer produces real visuals** — use `src/constants/theme.ts` tokens in new screens, don't hardcode values, but don't build `ThemeContext`/dark-mode/preset infrastructure before then.
- **Deep linking relies on Expo Router's automatic file-based routing** — no separate deep-link config for in-app navigation (push → friend detail, etc.). Invite links are a known open gap (a bare custom-scheme link doesn't work for someone without the app installed) — unresolved on purpose until that ticket is built; see `ROADMAP.md` T3-5.
- **`phone`/`email` on `friends` are already modeled** — deliberately, since both Calendar matching and Contacts import/messaging hand-off depend on having them. Don't treat these as throwaway fields.
- **Messaging will be unified, not forked**: when built, a 1:1 conversation and a group conversation share one `conversations`/`messages` schema (2..N members) rather than separate DM/group tables.
- **iMessage/WhatsApp/Android-SMS activity reading is explicitly out of scope** — platform API walls, not an effort tradeoff. Don't propose building it; see `ROADMAP.md` System Design Notes for why. Telegram's Bot API is the sole exception.
- **Claude Haiku, once integrated, is only ever called server-side** (a Supabase Edge Function) — never from the client.
- **Calendar/Contacts integrations use on-device APIs** (`expo-calendar`/`expo-contacts`), not OAuth cloud APIs, for v1.
- **Release target**: EAS Build + EAS Submit → TestFlight and Play internal testing track.
