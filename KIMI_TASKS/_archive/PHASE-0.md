# Phase 0 — Reproducibility & Foundations

**Goal:** make this repo something a second machine can stand up from scratch.
Right now the production database exists only as manual clicks in a Supabase
dashboard, and there is no document listing what env vars the app needs. Until
that's fixed, nothing else can be verified.

**Blocking:** yes. Phases 1–6 depend on this.
**Findings covered:** H4, M4, M5, M6, M7, M8, M11
**Do NOT change any application logic in this phase.** Schema files, docs, config
only. If you find a bug, write it in the report — don't fix it here.

---

## T0.1 — Reconstruct the database schema from the code `[H4]` ⚠️ biggest task

`supabase/schema.sql` describes an app that no longer exists. Rebuild it by
reading what the code actually queries.

**Method — do it in this order:**

1. Enumerate every table reference in the codebase:
   ```bash
   grep -rhoE '\.from\("[a-z_]+"\)' app lib | sort -u
   ```
2. For each table, find every `.select(...)`, `.insert({...})`, `.update({...})`,
   `.upsert({...}, { onConflict })` across the repo. The union of those columns is
   the minimum viable table definition.
3. Infer types from usage (`balance` → `numeric(10,2)`, `created_at` →
   `timestamptz`, ids → `uuid`, `content` in `messages` → `jsonb`).
4. Every `onConflict: "a,b"` in the code **requires** a matching
   `UNIQUE (a, b)` constraint or the upsert fails at runtime. Grep for all of
   them and add the constraints. Known ones:
   - `chats` → `UNIQUE (instance_id, remote_jid)`
   - `messages` → `UNIQUE (instance_id, message_id)`
   - `contacts` → `UNIQUE (instance_id, remote_jid)`
   - `api_keys` → `UNIQUE (user_id)`
   - `telegram_chat_state` → `UNIQUE (chat_id)`

**Tables known to be missing** (verify the list yourself, don't trust it blindly):

```
profiles (needs ~15 columns added)  api_keys              subscriptions
plans                               credit_transactions   notifications
admin_audit_log                     support_messages      telegram_chat_state
user_webhook_tokens                 api_usage_log         webhook_events
webhook_deliveries                  webhook_configs       plan_requests
campaigns                           campaign_contacts     auto_reply_rules
chats                               messages              contacts
instances
```

**`profiles` needs at minimum these columns added** (from
`lib/auth/session.ts:46-51` and admin routes):
`email, role, status, plan, plan_expires_at, balance, max_instances,
max_messages, custom_max_instances, notes, whatsapp, telegram_chat_id,
telegram_link_code, telegram_link_expires_at, telegram_linked_at`

Note the CHECK constraint referenced in `app/api/cron/billing/route.ts:71`:
`profiles.status` allows only `active | suspended | pending`.
And `plans.tier_slug` is referenced by `lib/auth/session.ts:104` and has a CHECK
constraint per the 2026_07_01 migration — read that migration, don't guess.

**Deliverables:**
- `supabase/schema.sql` — complete, idempotent (`create table if not exists`),
  runnable top-to-bottom on a **fresh empty Supabase project** with zero errors
- `supabase/SCHEMA_NOTES.md` — for each table: what it's for, which routes touch
  it, and **flag anything you had to guess**. The guesses are what Claude reviews
  hardest.

**Acceptance:** create a throwaway Supabase project (free tier), paste the whole
file into the SQL editor, run it. Zero errors. Paste the output/screenshot
evidence into your report. If you cannot create a project, say so in
`## Blocked` — do not claim it passed.

---

## T0.2 — Add RLS policies as a separate file `[H4 / prep for H5]`

Create `supabase/rls.sql`. For every table with a `user_id` (or reachable via
`instance_id → instances.user_id`):

```sql
alter table public.<t> enable row level security;

create policy "<t>_select_own" on public.<t>
  for select using (auth.uid() = user_id);
-- + insert/update/delete equivalents
```

Admin-only tables (`admin_audit_log`, `plans`, `api_usage_log`) get no
anon/authenticated policy at all — service-role only.

**This will not break anything today** — 21 routes use the service-role key which
bypasses RLS entirely. That's exactly the point: this is defence-in-depth for
when Phase 1 starts moving routes off service-role.

**Deliverable:** `supabase/rls.sql`, runnable after `schema.sql`.

---

## T0.3 — `.env.example` `[M7]`

```bash
grep -rhoE 'process\.env\.[A-Z_]+' app lib config middleware.ts | sort -u
```

Create `.env.example` at the repo root with every variable found, grouped, each
with a one-line comment saying what it's for and whether it's required.
**Values must be placeholders** — never a real secret.

Mark clearly which are required for the app to function vs. optional:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`,
`EVOLUTION_WEBHOOK_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`,
`CRON_SECRET`, `NEXT_PUBLIC_APP_URL`, `GROQ_API_KEY`, `GEMINI_API_KEY`,
`NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`.

Confirm `.env*` is in `.gitignore` (except `.env.example`).

---

## T0.4 — Boot-time env validation `[M8]`

`config/env.ts` exports `requireEnv()` and **nothing calls it** — verify:
```bash
grep -rn "requireEnv" app lib config
```

Add to `config/env.ts`:

```ts
/** Vars without which the app cannot serve a single authenticated request. */
const REQUIRED_IN_PRODUCTION = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const

export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== "production") return
  if (process.env.NEXT_PHASE === "phase-production-build") return // build has no secrets
  const missing = REQUIRED_IN_PRODUCTION.filter((k) => !process.env[k]?.trim())
  if (missing.length) {
    throw new Error(`FATAL: missing required env vars: ${missing.join(", ")}`)
  }
}
```

Call it once from `app/layout.tsx` (server component, runs once per cold start).

**Critical constraint:** `pnpm build` must still pass with **no** env vars set —
Vercel builds without secrets available. That's what the `NEXT_PHASE` guard is
for. Verify by running the build with a clean env.

**Do not** touch the `CRON_SECRET` / `EVOLUTION_WEBHOOK_SECRET` fail-open logic
here — that's `C3` in Phase 1.

---

## T0.5 — CI: add build + typecheck gates `[M4]`

In `.github/workflows/ci.yml`, after the Test step:

```yaml
      - name: Typecheck
        run: pnpm exec tsc --noEmit

      - name: Build
        run: pnpm build
```

Remove the now-inaccurate comment block at the top claiming build is intentionally
skipped. Raise `timeout-minutes` from 10 to 20 (the build takes a while).

---

## T0.6 — `package.json` metadata `[M5]`

- `"name": "my-v0-project"` → `"basma-app"`
- Add `"packageManager"` matching the pnpm version CI pins (v10). Get the exact
  version: `pnpm --version`, then set e.g. `"packageManager": "pnpm@10.x.y"`
- Add `"typecheck": "tsc --noEmit"` to scripts

---

## T0.7 — Rewrite `README.md` `[M6]`

Replace the v0 boilerplate. Required sections:

1. **What this is** — one paragraph, plain language
2. **Stack** — Next.js 16, React 19, TS, Tailwind 4, Supabase, Evolution API, Telegram
3. **Prerequisites** — Node 20, pnpm 10, a Supabase project, an Evolution API instance
4. **Local setup** — clone → `pnpm install` → `cp .env.example .env.local` → fill →
   run `supabase/schema.sql` then `supabase/rls.sql` → `pnpm dev`
5. **Environment variables** — table: name / required? / what it's for
6. **Scripts** — dev, build, start, lint, test, typecheck
7. **Architecture** — short map of `app/`, `lib/`, `config/`, `supabase/`
8. **Deploy** — Vercel + the two cron jobs in `vercel.json`

Delete the `<!-- deploy trigger 1781652456 -->` line.
Keep the v0 project link — it's real provenance.

---

## T0.8 — Resolve duplicated modules `[M11]`

Three pairs. For each: find which one is actually imported, then delete the dead
one and fix any stragglers.

```bash
grep -rn "globals.css" app components
grep -rn "use-toast" app components hooks
grep -rn "use-mobile" app components hooks
```

| Pair | Files |
|------|-------|
| globals | `app/globals.css` vs `styles/globals.css` |
| toast | `hooks/use-toast.ts` vs `components/ui/use-toast.ts` |
| mobile | `hooks/use-mobile.ts` vs `components/ui/use-mobile.tsx` |

**Careful:** `components/ui/*` files are shadcn-generated and `components.json`
may reference their paths. Check `components.json` before deleting anything under
`components/ui/`. If a shadcn file must stay for tooling reasons, keep it and
delete the `hooks/` copy instead — and say which you chose and why.

**If you can't determine which is live, leave both and report it.** Deleting the
wrong one breaks the build in a way that's annoying to trace.

---

## Definition of Done

- [ ] `supabase/schema.sql` runs clean on a fresh Supabase project (evidence in report)
- [ ] `supabase/rls.sql` runs clean after it
- [ ] `supabase/SCHEMA_NOTES.md` exists, guesses flagged
- [ ] `.env.example` covers every `process.env.*` in the repo
- [ ] `assertProductionEnv()` exists and is called; build still passes with empty env
- [ ] CI has typecheck + build steps
- [ ] `package.json` renamed, `packageManager` pinned
- [ ] `README.md` rewritten, all 8 sections present
- [ ] Duplicate modules resolved or explicitly reported as ambiguous
- [ ] `pnpm lint` PASS · `pnpm test` PASS · `pnpm build` PASS · `pnpm typecheck` PASS
- [ ] `reports/PHASE-0-REPORT.md` written

## Out of scope — do not do these here

Fixing C3 fail-open secrets · fixing any route logic · touching billing ·
changing rate limiting · anything in `phases/PHASE-1.md` or later.
