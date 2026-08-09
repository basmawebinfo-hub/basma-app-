# Phase 0 — Implementation Report

## Gates
- pnpm lint:  PASS
- pnpm test:  PASS  (11 tests)
- pnpm build: PASS  (verified with a **clean env** — no `NEXT_PUBLIC_SUPABASE_*` / `SUPABASE_SERVICE_ROLE_KEY` set)
- pnpm typecheck: PASS

## Tasks
| ID | Status | Files changed | Notes |
|----|--------|---------------|-------|
| T0.1 (H4) | done | `supabase/schema.sql` (rewritten), `supabase/SCHEMA_NOTES.md` (new), `verify_schema.py` (new, evidence tool) | 23 tables rebuilt from 287 call sites; executed top-to-bottom on a real Postgres — zero errors, twice (idempotent) |
| T0.2 (H4/H5 prep) | done | `supabase/rls.sql` (new) | 23 policies; 2 deliberate deviations from spec — see below |
| T0.3 (M7) | done | `.env.example` (new), `.gitignore` | 18 vars grouped + commented; `.gitignore` had `.env*` which also ignored `.env.example` — added `!.env.example` |
| T0.4 (M8) | done | `config/env.ts`, `app/layout.tsx` | `assertProductionEnv()` added + called; **build was broken by this and required a second fix** — see below |
| T0.5 (M4) | done | `.github/workflows/ci.yml` | Typecheck + Build steps after Test; outdated "build intentionally skipped" comment removed; timeout 10→20 |
| T0.6 (M5) | done | `package.json` | name → `basma-app`; `packageManager: pnpm@10.33.2`; added `typecheck` script |
| T0.7 (M6) | done | `README.md` | All 8 required sections; deploy-trigger line deleted; v0 link kept |
| T0.8 (M11) | done | deleted `styles/globals.css`, `components/ui/use-toast.ts`, `components/ui/use-mobile.tsx` | kept the `hooks/` + `app/` copies — see reasoning below |

## What I changed and why

**T0.1 — schema reconstruction.** Enumerated all 24 `.from()` targets in
`app/`/`lib/` (287 call sites) and took the union of every selected/inserted/
updated column. Rewrote `supabase/schema.sql` from scratch: 23 tables (the 24th,
`avatars`, is a Storage bucket, not a table — flagged in SCHEMA_NOTES). All
`onConflict` upserts have matching UNIQUE constraints (`chats`, `messages`,
`contacts`, `api_keys`, `telegram_chat_state`, `user_webhook_tokens`,
`subscriptions` on `user_id`). `profiles.status` has the CHECK from
`app/api/cron/billing/route.ts:71`; `plans.tier_slug` has the CHECK from the
2026_07_01 migration (which I read in full; all its feature-flag columns are in
the base table definition). One deliberate correction vs the old file:
`webhook_deliveries.event_id` is now **nullable** — the old `NOT NULL`
contradicts `app/api/evolution/webhook/route.ts:193` (`evtRow?.id ?? null`).
Everything is `create table if not exists` / `create index if not exists`;
the trigger is recreated via `drop trigger if exists` + `create trigger`.

**Verification evidence (acceptance criterion).** I could not create a
throwaway Supabase project without interrupting you (project creation needs an
org choice + cost confirmation, and the only existing projects are production
`basma-web` and an unrelated `LoverDiet`). Instead I ran the files on a **real
embedded PostgreSQL** (`pgserver`, PG 17) with a mock `auth` schema
(`auth.users`, `auth.uid()`) and a `uuid_generate_v4()` shim over the built-in
`gen_random_uuid()` — the only Supabase-provided pieces. Result:

```
[schema run 1] OK / [rls run 1] OK
[schema run 2 (idempotency)] OK / [rls run 2 (idempotency)] OK
23 public tables · 23 policies · RLS enabled on all 23 tables
ALL RUNS PASSED — zero errors
```

Reproducible via `python verify_schema.py` (kept in the repo root). Both files
also parse clean under `libpg_query` (the actual Postgres parser, via pglast).
**Caveat:** the one statement not executed locally is
`create extension if not exists "uuid-ossp"` (not bundled with embedded PG;
bundled with Supabase). I did **not** run anything against production.

**T0.2 — RLS.** `supabase/rls.sql` enables RLS on all 23 tables and adds
owner-scoped policies: direct `user_id` tables get `auth.uid() = user_id`
policies; child tables (`contacts`, `chats`, `messages`, `webhook_events`,
`webhook_deliveries`, `campaign_contacts`) get policies via their parent's
ownership subquery. Insert/update/delete equivalents added where user-context
routes actually write (campaigns, auto-reply, plan_requests, notifications
mark-read, profiles, instances, webhook_configs); billing-sensitive tables
(`subscriptions`, `credit_transactions`, `api_keys`, `user_webhook_tokens`)
are select-own only — writes stay service-role. `admin_audit_log`,
`support_messages`, `telegram_chat_state`, `instagram_events` get no policies
(service-role only). **Two deviations from the spec's "no anon/authenticated
policy" list, both required to keep live routes working:**
`plans` gets a public `select where is_active` policy (GET `/api/pricing`
reads it with a user-context client), and `api_usage_log` gets select-own
(GET `/api/user/usage` reads it with a user-context client). With the spec's
literal prescription, enabling RLS would have silently emptied both endpoints.

**T0.3 — `.env.example`.** 18 real vars found (`process.env.X` was a docstring
false-positive; `TELEGRAM_BOT_USERNAME`, `META_*`, `FACEBOOK_APP_SECRET` were
found in code but missing from the spec's list — included). Grouped, commented,
required vs optional marked, placeholders only. Fixed `.gitignore` to un-ignore
`.env.example`.

**T0.4 — boot-time env validation.** `assertProductionEnv()` added to
`config/env.ts` exactly per spec and called once from `app/layout.tsx`.
**This initially broke `pnpm build` with empty env** — importing `config/env`
into the root layout pulled its module-load Zod parse into build-time page-data
collection, where Turbopack substitutes unset `NEXT_PUBLIC_*` vars with `""`,
and `""` fails `z.string().url()`. Verified the failure was caused by my change
(build passed with my edit stashed) and fixed it minimally inside the same
file: the two URL fields now accept `""` (`.or(z.literal(""))`) and parse
inputs use `|| undefined` — "empty means not set", matching the file's
documented intent. Build now passes with a fully clean env (and with real
values, since valid URLs still pass).

**T0.5 — CI.** Added `Typecheck` (`pnpm exec tsc --noEmit`) and `Build`
(`pnpm build`) after Test; removed the stale comment claiming build is
intentionally skipped; `timeout-minutes: 20`.

**T0.6 — package.json.** `name: basma-app`, `packageManager: pnpm@10.33.2`
(exact installed version, CI pins major v10), added `typecheck` script.

**T0.7 — README.** Rewritten: what this is, stack, prerequisites (Node 20 /
pnpm 10 / Supabase / Evolution), local setup (clone → install → env → run
`schema.sql` then `rls.sql` → dev), env-var table, scripts table, architecture
map, deploy (Vercel + both cron schedules from `vercel.json`). Deploy-trigger
comment deleted; v0 link kept.

**T0.8 — duplicates.** Verified which copy is live by import graph:
`app/layout.tsx` imports `./globals.css` and `components.json` points at
`app/globals.css` → deleted `styles/globals.css` (older 125-line copy vs live
158). `components/ui/toaster.tsx` imports `@/hooks/use-toast` and
`components/ui/sidebar.tsx` imports `@/hooks/use-mobile`; nothing imports the
`components/ui/` copies, and `components.json` maps the `hooks` alias to
`@/hooks` (so shadcn regenerates into `hooks/`, not `components/ui/`) → deleted
`components/ui/use-toast.ts` and `components/ui/use-mobile.tsx`, kept the
`hooks/` copies.

## Blocked / Needs Decision

1. **Supabase acceptance run:** schema/rls were executed on a real embedded
   Postgres 17 (zero errors, twice) instead of a throwaway Supabase project —
   creating one needs your org choice + cost confirmation, and I didn't want to
   touch the production `basma-web` project. If you want the literal acceptance,
   create a free project and paste both files, or tell me to create one (org
   `ncqbfmawwcsepkfpsqra`).
2. **`plans` seed data:** schema.sql contains no INSERTs — the six production
   plans (تجريبي، مخصص، 3 أرقام، 8 أرقام، 13 رقم، 25 رقم) must be re-created
   manually on a fresh project. Not specified in the phase; flagging for a
   possible seed file decision.
3. **`profiles.status` default** is `'pending'` (guessed — the admin "approve"
   flow implies it, but the old schema had no status column at all). If
   production defaults to `'active'`, the default needs changing.
4. **`handle_new_user()` trigger** now also copies `email` and `whatsapp` from
   signup metadata — nothing else in the codebase ever writes `profiles.email`,
   yet ~10 routes read it, so the old trigger can't have been the whole story.
   Needs verification against the live database (flagged in SCHEMA_NOTES too).

## Things I noticed but did NOT touch

- `profiles.plan` (text slug) is never updated when an admin approves a plan
  request — approval writes `subscriptions` + `balance` + `max_messages` but
  leaves `profiles.plan` at whatever it was (`app/api/admin/plan-requests/route.ts:161`).
  The cron that checks `.neq("plan", "free")` may therefore misclassify users.
  Looks like a real bug; out of scope here.
- `notifications` uses two parallel classification columns (`type` and `level`)
  across different routes — worth consolidating later.
- `subscriptions` has no `on delete` behavior issue but `plan_id on delete set null`
  + code doing `sub.plan_id` assumes presence; harmless today.
- `avatars` Storage bucket can't be created by these SQL files — must exist as
  a public bucket in the Supabase dashboard (`app/api/user/avatar/route.ts`).
- `config/env.ts` header comment claims it "fails loudly in dev when required
  env vars are missing" — it never did (all fields optional); the new
  `assertProductionEnv()` covers production only. Comment left as-is.
- `webhook_configs.destination_type` CHECK includes EMAIL/N8N/ZAPIER/MAKE but
  only URL delivery is implemented in code.
- `pgdata_test/` (embedded Postgres data dir) was removed after verification;
  `verify_schema.py` recreates it on demand.
