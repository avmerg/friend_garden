# Friend Garden — User & Data Flows

> Reference walkthrough of every user interaction designed so far, paired with the data/system operation behind each step. See `ROADMAP.md` for the architecture and backlog this depends on; ticket IDs below (T1-x, T2-x, ...) refer to it.

---

## Phase 1 — Onboarding

1. **Sign up** (email/password) → Supabase Auth creates `auth.users` → signup trigger creates matching `profiles` row.
2. **Permission prompts** (Contacts, Calendar, Notifications) — staged contextually (ask right before each is actually used, not all at once on first launch).
3. **Contacts selection** (`expo-contacts`, T2-1) → device contact list is shown as a picker; the user chooses which specific contacts to bring in. **Zero selected is a fully valid, first-class outcome** — never a forced minimum, never presented as a blocker to finishing onboarding. Nothing is hashed or sent anywhere for a contact that wasn't selected — this is what actually makes T2-2's "scoped to contacts actively being added" data-minimization design true in practice, not just in the ticket text.
4. **Selected contacts become `friends` rows** (`owner_id`, phone/email carried over, plus game fields: tag, plant type, cadence) → *then* client hashes each selected contact's phone/email → batch call to the contact-discovery Edge Function (T2-2) → checks hashes against `identifier_lookup` → matches populate `friend_user_id`/`is_app_user`. **A separate "add a friend" flow exists independent of this import step** — manual entry (name, optionally phone/email) for someone not in the phone's contacts, for anyone who skipped import entirely (0 selected), or for adding a friend later, well after onboarding. This isn't a new capability to build from scratch — the current local-only app already only supports manual adding today, so this is a "don't regress it" requirement as much as a "build it" one. Editing a friend later to add phone/email that wasn't present at creation must re-trigger the discovery lookup — not just the initial import path.
5. **Push token registered** on first launch → stored in `push_tokens`.

## Phase 2 — Core daily loop

6. **Garden grid / Today list** renders — health per friend computed from `friends.cadenceDays` vs. the most recent `contact_logs` row.
7. **User taps "Water"** on a friend → `contact_logs` insert (direction, channel, note) → health/streak recompute (`lib/health.ts`, `lib/streak.ts`) → splash animation.
8. **(Passive) Calendar sync** (T2-3) on app open/background → reads device calendar via `expo-calendar` → matches event attendees against friend emails → auto-inserts a `contact_logs` row for matched friends, no user action required.
9. **(Passive, server-side) Decay engine** (T2-4) — `pg_cron` triggers the Edge Function hourly; each run only processes friends whose owner's local hour (via `profiles.timezone`) falls in the delivery window, recomputes health, sends a push via Expo Push Service for anyone who just crossed the wilting threshold.
   - *Open item, not yet decided*: birthday notifications today are scheduled locally on-device (`expo-notifications`). Once T2-4 exists, decide whether birthdays fold into the same server-driven push system rather than remaining a separate local-only mechanism.

## Phase 3 — Reaching out

10. **Push notification tapped** → deep link into that friend's detail screen.
11. **"Reach Out" button** → reachability check branches three ways:
    - **App-user friend** → free in-app **nudge** (T3-3): Edge Function sends a push user-to-user, no external app involved.
    - **Has contact info, not (only) an app user** → Edge Function calls Claude Haiku (T2-5) for a drafted icebreaker → client probes installed messaging apps → presents deep-link hand-off (WhatsApp/Telegram/SMS/iMessage, T3-4) or clipboard fallback → user sends in that app themselves. If the friend isn't an app user, the message includes an invite link (T3-5).
    - **Neither** → plain on-screen reminder, no action button.
12. **Connection confirmation — layered, not a manual prompt by default** (resolved; see `ROADMAP.md` System Design Notes):
    - In-app nudge → automatic: a reciprocal `contact_logs`/nudge-back from the recipient within ~72h confirms both sides, no prompt.
    - iOS SMS/iMessage hand-off → automatic: `MFMessageComposeViewController`'s `.sent` result callback.
    - WhatsApp/Telegram/clipboard hand-off (no callback exists) → default-assume success if the user returns to the app shortly after backgrounding for the hand-off; shown as a dismissible "marked as reached out — tap if that's not right" affordance, never a blocking dialog.
    - Any channel → a later Calendar match (T2-3) independently corroborates after the fact.
    - A manual "did you connect?" prompt exists only as a last-resort fallback when none of the above apply — not the primary mechanism for any channel.

## Phase 4 — Groups ("plots") and in-app chat

13. **User creates a plot** (T3-1) from mutual friends → `plots`/`plot_members` rows → auto-creates a `conversations` row (N members). *Plot membership is also the source of friend-to-friend graph edges for T4-2 — see below.*
14. **In-app messaging** (T3-2) → send → `messages` insert → Supabase Realtime pushes to subscribed members instantly; offline members get a push notification. Block/report required before shipping (App Store UGC requirement).
15. **Group decay** (T3-6) — the same/companion scheduled function checks whole-plot silence → fan-out push to every member at once.
16. **(Deferred) Telegram bridge** (T4-1) — bot added to an existing Telegram group → activity-only signal (body discarded server-side) feeds the same decay check; the bot can also auto-post the nudge directly, no user tap needed. This is the one external platform where genuine reply/activity detection is possible at all.

## Phase 5 — Ongoing management

17. **Friend detail tabs**: overview, contact-log history, notes, settings (cadence, low-touch, snooze, archive).
    - *Notes tab is currently a stub* (`NotesTabStub`, "coming soon") — real guided-notes functionality (structured prompts, not free text) is scoped in `ROADMAP.md` T2-6; don't build further on top of the stub until that lands.
18. **Archive a friend** → soft delete (`archived = true`), drops out of active garden/today views but stays in history.
19. **Dashboard**: aggregated health summary, activity feed, tag breakdown — derived entirely from `friends` + `contact_logs`.

## Phase 6 — Deferred features

20. **Garden visiting** (T4-3, Animal Crossing-style) — view another user's garden read-only, RLS-gated; async only, no realtime/multiplayer infra needed unless live presence is added later.
21. **Network-science insights** (T4-2) — **resolved**: no standalone `friend_edges` table exists or is needed.
    - Owner→friend edges (weighted) are computed on the fly from `friends` + `contact_logs` (contact frequency/recency as weight).
    - Friend→friend edges — the genuinely new information needed for real centrality/community analysis — come from `plot_members` co-membership: a plot is by definition an asserted clique of mutual friends, so every plot of size N implies edges among all N members for free, with no separate graph-authoring step or user-asserted edge data required.
    - The batch job (Python/networkx) computes both at run time and writes only its output — centrality/community scores — into a small `friend_centrality_scores` table. Needs real plot data (T3-1) to exist before this is meaningful.
