# Phase 3 — Campaign Engine (architectural)

**Goal:** make bulk campaigns actually complete. Today the core feature of the
product silently dies partway through on the platform it's deployed to.

**Prerequisite:** Phase 2 approved.
**Findings covered:** C1, H7

This phase changes architecture rather than patching lines. Expect to spend most
of it on T3.1 (the design) before writing code.

---

## The problem

**`app/api/campaigns/[id]/run/route.ts:34`**

```ts
runCampaign(id, inst.instance_name, campaign.message_text, contacts, campaign.delay_seconds)
  .catch((err) => { logger.error(...) })
return NextResponse.json({ ok: true, total: contacts.length })
```

`runCampaign` is not awaited. The handler returns, and Vercel freezes or kills the
instance. The loop stops wherever it was.

The loop is built to run for hours:
- 4–12 s between every contact (`humanDelay`)
- 1–3 min break every 25 messages (`shouldTakeBreak` → `breakDuration`)
- `while (isQuietHour()) { await sleep(5 * 60 * 1000) }` — up to **8 hours**

A 500-contact campaign needs 1–2 hours minimum. It will not survive.

**Consequences:**
- `status` is set to `"running"` at line 24 and only cleared at line 95, which is
  never reached → the campaign is stuck `"running"` **permanently**
- Line 22 rejects re-running anything already `"running"` → the user can never
  retry. The campaign is bricked.
- Contacts are half-sent with no record of where it stopped
- `sent_count` / `failed_count` freeze at whatever the last write managed

**Related — `H7`:** the same synchronous-sleep mistake appears in the webhook
handlers (`app/api/wh/[token]/route.ts:187`, `app/api/send/route.ts:187`), where
a 3–8 s `await sleep()` inside the request causes Evolution to time out and
retry, producing **duplicate auto-replies** to real customers.

---

## T3.1 — Design the queue 🛑 Write the design doc BEFORE any code

Write `PROJECT_MEMORY/CAMPAIGN_ENGINE.md` covering the points below, and get it
approved before implementing. A wrong choice here is expensive to undo.

**The shape that fits this app:** a durable queue in Postgres + a worker that
processes a small batch per invocation and is re-triggered on a schedule.

- `campaign_contacts` already has `status` (`pending`/`sent`/`failed`) — it is
  already most of a queue. Reuse it; don't invent a parallel table.
- A cron-driven worker picks up `pending` contacts for `running` campaigns,
  sends a **bounded batch** (whatever fits comfortably in one function
  invocation, e.g. 60–90 s of work), updates rows, and returns.
- The next cron tick continues where it left off. State lives in the DB, so a
  killed instance loses at most the in-flight batch.

**Decisions to make and justify in the doc:**

1. **Trigger mechanism.** Vercel cron (min granularity 1 min) vs. Supabase
   `pg_cron` calling the endpoint vs. an external scheduler. Note that
   `vercel.json` already has 2 crons; check the plan's cron limits.
2. **Pacing across invocations.** The anti-ban delays are the whole point of this
   product — they must survive batching. Store `next_send_at` per campaign (or
   per contact) so pacing is computed from timestamps, not from `sleep()`.
   *`sleep()` inside a serverless function is the bug — do not carry it over.*
3. **Quiet hours** become "don't schedule `next_send_at` inside the quiet window"
   (timezone-aware per T2.7), not a blocking `while` loop.
4. **Claiming work safely.** Two overlapping worker invocations must not send the
   same contact twice. Use `UPDATE ... WHERE status='pending' ... RETURNING`
   (or `FOR UPDATE SKIP LOCKED`) to atomically claim a batch.
5. **Terminal states.** `pending → sending → sent | failed`. A row stuck in
   `sending` past a timeout is reclaimed. Campaign completes when no
   `pending`/`sending` remain.
6. **Retries.** How many, what backoff, what counts as retryable.
7. **Control.** Pause / resume / cancel — the UI needs these and the current
   design can't offer them.

---

## T3.2 — Add the schema

To `supabase/schema.sql` (and a migration in `supabase/migrations/`):

**`campaigns`:**
`next_send_at timestamptz` · `last_worker_at timestamptz` ·
`status` extended with `paused` and `failed` ·
`error text` · `started_at` · `completed_at`

**`campaign_contacts`:**
`status` extended with `sending` ·
`attempts int default 0` · `claimed_at timestamptz` ·
`error text` (exists — verify) ·
index on `(campaign_id, status)` for the claim query

Add the `CHECK` constraints for both status enums.

---

## T3.3 — Build the worker

New route, e.g. `app/api/cron/campaigns/route.ts`:

- Guarded by `guardCron()` from Phase 1 (T1.1) — fails closed
- `export const maxDuration = 300`
- Per invocation:
  1. Find `running` campaigns where `next_send_at <= now()`
  2. Atomically claim a batch of `pending` contacts (T3.1 decision 4)
  3. For each: apply `spinMessage`, send presence, send text, record result
  4. Update `sent_count` / `failed_count`
  5. Set `next_send_at` from the pacing rules (including breaks and quiet hours)
  6. Mark the campaign `completed` when nothing remains
- Reclaim rows stuck in `sending` past the timeout
- Structured logging via `lib/logger` at every stage — this runs unattended and
  needs to be debuggable from logs alone

Register it in `vercel.json`.

---

## T3.4 — Rewrite `POST /api/campaigns/[id]/run`

It becomes a small, fast enqueue endpoint:

- Validate ownership and instance connectivity (keep the existing checks)
- Set `status = "running"`, `started_at`, `next_send_at = now()`
- Return immediately

**Delete `runCampaign()` entirely** — do not leave it as dead code.

Add `POST /api/campaigns/[id]/pause`, `/resume`, `/cancel`.

**Fix the bricking bug:** the current code makes a stuck campaign unrecoverable.
Add a one-off admin/self-serve reset for campaigns already stuck in `"running"`
from before this change, and write a migration to reset existing stuck rows.

---

## T3.5 — Unblock the webhook handlers `[H7]`

**`app/api/wh/[token]/route.ts`** — `processAutoReply` awaits a 3–8 s
`setTimeout` inside the request, in a loop over messages, in a loop over rules.
Evolution times out and retries → **duplicate replies to the customer**.

- Persist the inbound event, respond `200` immediately
- Move auto-reply sending into a queued job with its own `next_send_at`
  (reuse the T3.3 worker, or a sibling)
- The typing delay is preserved as scheduling, not as blocking sleep
- Add idempotency: an auto-reply for a given `message_id` fires exactly once even
  if Evolution redelivers the webhook

**`app/api/send/route.ts:187`** — `await sleep(min(typingDuration(text), 3000))`
before every send. Adds up to 3 s to every API call. Decide: drop it for the
synchronous API (the caller controls their own pacing) or make it opt-in via a
request field. Document the choice — it's a behaviour change for existing users.

---

## T3.6 — Tests

- claim query never returns the same contact to two concurrent workers
- a worker killed mid-batch leaves rows reclaimable, not lost
- `next_send_at` never lands inside quiet hours
- campaign transitions to `completed` only when zero `pending`/`sending` remain
- auto-reply is not sent twice for a redelivered webhook
- pause stops sending; resume continues from the right contact

---

## Definition of Done

- [ ] `PROJECT_MEMORY/CAMPAIGN_ENGINE.md` written and approved
- [ ] Schema + migration for the new columns/indexes/constraints
- [ ] Worker route exists, cron-guarded, registered in `vercel.json`
- [ ] `runCampaign()` deleted; run endpoint is a fast enqueue
- [ ] pause / resume / cancel endpoints work
- [ ] Existing stuck-`running` campaigns are recoverable (migration)
- [ ] No `sleep()` longer than ~1 s remains inside any request handler
- [ ] Auto-reply is queued and idempotent
- [ ] All T3.6 tests pass
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` · `pnpm typecheck` PASS
- [ ] **Manual proof:** a 100-contact campaign against a test instance runs to
      completion across multiple worker invocations. Include the campaign row
      before/after and the worker logs in your report.
- [ ] `reports/PHASE-3-REPORT.md` written
