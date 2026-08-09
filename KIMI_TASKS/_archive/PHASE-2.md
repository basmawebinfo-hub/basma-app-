# Phase 2 — Billing Correctness

**Goal:** stop charging customers twice and stop disconnecting people who have
paid. This phase touches real money — be conservative, and when the spec and
reality disagree, **stop and ask**.

**Prerequisite:** Phase 1 approved.
**Findings covered:** C4, H6, H8, H9, M9

> **⚠️ Before writing any code:** the two crons implement two *different,
> incompatible* billing models. Nobody has written down which one is intended.
> **T2.1 is a question, not a task.** Do it first and wait for the answer.

---

## T2.1 — Establish the intended billing model 🛑 BLOCKING

Read both files end to end:
- `app/api/cron/subscriptions/route.ts` (runs 06:00 UTC) — deducts
  `price_monthly / 30` from `profiles.balance` **every day**
- `app/api/cron/billing/route.ts` (runs 07:00 UTC) — deducts the **full
  `price_monthly`** when `current_period_end` passes, then extends 30 days

Both are active in `vercel.json`. A user on a $30 plan pays $1/day (=$30) **and**
$30 at rollover. Because the daily job runs first, the balance is often already
drained by the time billing runs — so paying customers get flipped to `past_due`
and **have every WhatsApp instance disconnected** (`cron/billing:68`).

**Write `PROJECT_MEMORY/BILLING.md`** documenting:
1. What each cron does today, line by line
2. The exact double-charge scenario with a worked $30 example
3. Two candidate models:
   - **A — Daily drip:** deduct `price/30` daily, no period concept. Simple wallet
     burn-down. Delete `cron/billing`'s charging logic.
   - **B — Monthly period:** deduct the full price once per period at rollover.
     Delete step 3 of `cron/subscriptions`. Matches "subscription" semantics and
     the existing `current_period_end` column.
4. Your recommendation and why

**Then stop.** Put it under `## Blocked / Needs Decision` in the report and wait
for the owner's answer. Do not pick one yourself. Implementing the wrong model
costs real customer money.

Everything below assumes a decision has been made.

---

## T2.2 — Implement the chosen model, delete the other `[C4]` 🔴

Once the owner picks:
- Implement exactly one charging path. **Delete** the other — don't leave it
  behind a flag, don't comment it out. Two code paths is how this bug happened.
- The surviving cron must be **idempotent**: running it twice in one day must not
  charge twice. Guard on a `last_charged_at` (or `current_period_end`) column,
  checked and written in the same statement.
- Every balance change writes a `credit_transactions` row — including the ones
  that currently don't (`cron/billing:63` updates `profiles.balance` with no
  transaction record, so there is no audit trail for monthly charges).

**Test:** run the cron handler twice against the same fixture state; assert the
balance changed exactly once and exactly one transaction row exists.

---

## T2.3 — Paginate and batch the cron jobs `[C4 second half]` 🔴

`app/api/cron/subscriptions/route.ts:74-81` loads **all** profiles, **all**
subscriptions, and **all** plans into memory:

```ts
const { data: paidProfiles } = await db.from("profiles").select("id, balance, telegram_chat_id")
const { data: allSubs }      = await db.from("subscriptions").select(...)
```

Then loops with a sequential `await sendTelegram(...)` per user. At 1,000 users
this exceeds Vercel's function timeout; at 10,000 it OOMs first.

- Page with `.range(offset, offset + 499)` in batches of 500.
- Query only users who actually need processing (join/filter to active paid
  subscriptions) instead of scanning every profile.
- Send Telegram notifications in bounded-concurrency batches
  (`Promise.allSettled` over chunks of ~10), not one-at-a-time.
- Add `export const maxDuration = 300` to both cron routes.
- Return real counters `{ processed, charged, skipped, failed }` and log the
  failures via `lib/logger` — right now failures vanish.

---

## T2.4 — Make usage limits atomic `[H6]` 🟠

Every limit is check-then-act with a gap in the middle:

| File | Limit |
|------|-------|
| `app/api/send/route.ts:90-107` | monthly message cap |
| `lib/anti-ban.ts:91-107` | warmup daily cap |
| `app/api/instances/route.ts:78-89` | per-plan instance cap |

N concurrent requests all read the same count and all pass. Since the API key
exists specifically for automation tools that fire in parallel (n8n, Make,
Zapier), this is routine, not exotic.

**Fix:** move the count-and-decide into a single atomic Postgres operation.
Create an RPC:

```sql
create or replace function public.consume_send_quota(
  p_user_id uuid, p_instance_id uuid, p_monthly_max int, p_daily_max int
) returns jsonb
language plpgsql security definer as $$
-- atomically increment a usage counter row and return
--   { allowed: bool, monthly_used: int, daily_used: int }
-- Use INSERT ... ON CONFLICT DO UPDATE ... RETURNING so the read and the
-- increment happen in one statement.
$$;
```

Add the backing `usage_counters` table to `supabase/schema.sql`.

Also fix the plain logic hole at `app/api/send/route.ts:97`: the monthly check
only runs `if (instIds.length)`. And note that counting rows in `messages` means
a user whose webhook is misconfigured records no usage at all — the counter table
fixes this by incrementing at send time.

**Test:** fire 20 concurrent calls against a limit of 10; exactly 10 succeed.

---

## T2.5 — Stop overwriting `created_at` `[H8]` 🟠

**File:** `app/api/admin/users/[id]/action/route.ts:30-32`

```ts
if (action === "approve" || action === "activate") {
  profileUpdate.created_at = new Date().toISOString()
}
```

`created_at` is an immutable audit field. Every reactivation resets it, corrupting
cohort analytics, "member since", and account age — which
`lib/anti-ban.ts:warmupDailyLimit()` uses to derive send limits, so this silently
changes how much a user is allowed to send.

- Add `trial_started_at timestamptz` to `profiles` in `supabase/schema.sql`
- Write **that** column on approve/activate; never touch `created_at`
- Update any trial-remaining logic to read `trial_started_at` with a
  `coalesce(trial_started_at, created_at)` fallback for existing rows
- Write a one-off migration in `supabase/migrations/` backfilling
  `trial_started_at = created_at` where null

---

## T2.6 — Make admin user deletion safe `[H9]` 🟠

**File:** `app/api/admin/users/[id]/action/route.ts:137-147`

```ts
await db.auth.admin.deleteUser(targetUserId).catch(() => {})   // error discarded
await db.from("profiles").delete().eq("id", targetUserId)      // runs anyway
```

If auth deletion fails, the profile is deleted regardless → an auth user with
valid credentials and no profile row. That user logs in fine, `getCurrentUser()`
returns `null` (`lib/auth/session.ts:56`), `requireUser()` sends them to `/login`,
middleware sees a valid session and sends them to `/dashboard` — **an infinite
redirect loop on an account that is supposed to be deleted.**

Fix:
- Check the error. On failure return 500 and **do not** delete the profile.
- Delete the profile only after auth deletion succeeds (or rely on the
  `on delete cascade` from `auth.users`, which `schema.sql` already declares —
  verify which is true and don't do it twice).
- Guard: an admin cannot delete **themselves**, and cannot delete a
  `super_admin` unless they are one. Return 403.
- Same guards on `suspend`.
- Add a defensive redirect-loop breaker: if a session is valid but no profile
  exists, sign the user out rather than redirecting.

---

## T2.7 — Fix timezone handling `[M9]` 🟡

All time logic uses server-local time, which on Vercel is **UTC**. Users are in
Egypt (UTC+2/+3). Everything is shifted 2–3 hours:

| File | What's wrong |
|------|--------------|
| `lib/anti-ban.ts:52` | `isQuietHour()` uses `date.getHours()` — "23:00–07:00 quiet" is actually 01:00–09:00 Cairo |
| `app/api/send/route.ts:94` | `monthStart.setHours(0,0,0,0)` — monthly cap resets at 02:00 Cairo on the wrong day boundary |
| `lib/anti-ban.ts:97` | `dayStart` — same, daily warmup window is shifted |

- Add `APP_TIMEZONE` (default `Africa/Cairo`) to `config/env.ts` and `.env.example`
- Compute day/month boundaries in that zone (`Intl.DateTimeFormat` with
  `timeZone`, or `date-fns-tz` — `date-fns` is already a dependency)
- `isQuietHour()` takes the timezone as a parameter
- **Store everything in UTC** — only presentation and boundary calculation are
  zone-aware. Do not start writing local timestamps to the DB.

**Test:** `isQuietHour()` at a UTC instant that is 23:30 Cairo returns `true`.

---

## Definition of Done

- [ ] `PROJECT_MEMORY/BILLING.md` written; owner has chosen a model
- [ ] Exactly one charging path exists; the other is deleted
- [ ] Charging is idempotent (proven by a double-run test)
- [ ] Every balance change writes `credit_transactions`
- [ ] Both crons paginate, batch notifications, declare `maxDuration`
- [ ] `consume_send_quota` RPC exists; send/instance limits are atomic
- [ ] Concurrency test passes (20 parallel → exactly 10 succeed)
- [ ] `created_at` is never written; `trial_started_at` added + backfilled
- [ ] Admin delete checks errors, guards self/super_admin, no orphan possible
- [ ] Timezone-aware day/month boundaries and quiet hours
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` · `pnpm typecheck` PASS
- [ ] `reports/PHASE-2-REPORT.md` written

## Out of scope

Campaign runner (Phase 3) · performance (Phase 4) · anything not listed above.
Do not "improve" the pricing UI or plan definitions.
