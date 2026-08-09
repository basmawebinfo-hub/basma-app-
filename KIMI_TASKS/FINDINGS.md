# Code Review — Findings

**Reviewed:** 2026-08-08 · commit `0fbe35a` (main)
**Reviewer:** Claude Opus 5
**Scope:** full repo — 70 API routes, auth/session, billing, webhooks, DB layer, config, CI

## Baseline verified locally

| Gate | Result |
|------|--------|
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm lint` | PASS — 0 errors, 0 warnings |
| `pnpm test` | PASS — 11 tests, 2 files (`lib/logger`, `lib/security`) |
| `pnpm build` | PASS — 0 errors |

**The gates being green is not the same as the app being correct.** All 30 findings
below exist in a repo that lints, tests, and builds clean. Coverage is 2 files out
of ~250.

**Severity counts:** 6 critical · 12 high · 12 medium

---

# 🔴 CRITICAL

## C1 — Campaign runner is fire-and-forget on serverless; campaigns die mid-run
**File:** `app/api/campaigns/[id]/run/route.ts:34`

`runCampaign(...)` is invoked **without `await`**, then the handler returns
immediately. On Vercel the function instance is frozen or killed once the response
is sent — the loop stops wherever it happened to be.

The loop is designed to run for a very long time:
- `sleep(humanDelay(minGap, maxGap))` — 4–12 s between every contact
- `shouldTakeBreak()` every 25 messages → `breakDuration()` = 1–3 min
- `while (isQuietHour())` → `sleep(5 * 60 * 1000)` in a loop, potentially **8 hours**

**Impact:** a 500-contact campaign needs ~1–2 hours minimum. It will be killed.
The campaign row is left at `status: "running"` **forever** (line 24 sets it, line
95 never runs), which permanently blocks re-running it (line 22 rejects
`status === "running"`). Contacts are half-sent with no resume path and no way for
the user to tell what was delivered.

**Fix direction:** durable job queue + resumable worker. See `phases/PHASE-3.md`.

---

## C2 — Mass assignment on `PATCH /api/webhooks`
**File:** `app/api/webhooks/route.ts:70-78`

```ts
const body = await req.json()
.update({ ...body, updated_at: ... })
.eq("id", id).eq("user_id", user.id)
```

The entire client-controlled body is spread into the UPDATE. The `.eq("user_id")`
only decides **which row** is matched — it does not restrict **which columns** are
written. A user can send `{"user_id": "<victim-uuid>"}` and reassign their own
webhook config row to another account, or write any other column in the table.

**Fix direction:** explicit allowlist of updatable fields.

---

## C3 — Secrets fail *open*: unset env var disables auth entirely
**Files:**
- `app/api/cron/billing/route.ts:19`
- `app/api/cron/subscriptions/route.ts:19`
- `app/api/evolution/webhook/route.ts:21`

All three use the pattern:

```ts
const secret = process.env.CRON_SECRET
if (secret) { /* check it */ }
// no secret configured -> falls through, fully public
```

If the env var is missing, empty, or typo'd in the Vercel dashboard, the endpoint
becomes **publicly callable with no authentication at all**. Nothing in the app
warns about this — and `config/env.ts` actively defaults every secret to `""`,
which makes the silent-disable *more* likely.

**What an unauthenticated caller gets:**
- `GET /api/cron/billing` — deducts balances, sets subscriptions `past_due`,
  disconnects every instance of underfunded users, sends Telegram messages
- `GET /api/cron/subscriptions` — downgrades plans, deducts daily charges,
  mass-notifies
- `POST /api/evolution/webhook` — inject forged WhatsApp events: write arbitrary
  messages into any user's inbox, flip any instance to CONNECTED/DISCONNECTED
  (matched only by `instance_name`, no ownership check), and trigger outbound
  webhook deliveries to third-party URLs

**Fix direction:** fail *closed*. Missing secret = 503, plus a boot-time assertion.

---

## C4 — Double billing: two crons charge the same subscription
**Files:** `app/api/cron/subscriptions/route.ts:73-126` + `app/api/cron/billing/route.ts:29-92`
**Config:** `vercel.json` — both run daily (06:00 and 07:00 UTC)

- `cron/subscriptions` step 3 deducts `price_monthly / 30` from `profiles.balance`
  **every single day**.
- `cron/billing` deducts the **full `price_monthly`** whenever
  `current_period_end` has passed, then extends the period 30 days.

A user on a $30/mo plan is charged $1/day (= $30) *and* $30 at rollover.
**They pay double.** Worse, the daily job runs first (06:00), so by the time
billing runs at 07:00 the balance is already drained — pushing users to `past_due`
and disconnecting their WhatsApp numbers while they are fully paid up.

There is no single source of truth for "how does this product charge". The two
crons implement two different, mutually incompatible billing models.

**Also in the same route:** step 3 loads **every** profile, **every** subscription,
and **every** plan into memory with no pagination (`select` with no `.range()`).
This breaks at a few thousand users and will exceed Vercel's function timeout well
before that, because each user gets a sequential `await sendTelegram(...)`.

---

## C5 — Telegram webhook is unauthenticated + link codes are brute-forceable
**File:** `app/api/telegram/webhook/route.ts:12`

The handler accepts **any** POST with no verification whatsoever — no Telegram
`X-Telegram-Bot-Api-Secret-Token` check, no IP allowlist, no shared secret.

Combined with the account-linking flow at line 54:

```ts
const match = text.match(/BSM-[A-F0-9]{6}/i)
```

A 6-hex-character code = **16.7 million** possibilities, with:
- no rate limiting
- no per-chat attempt counter
- no lockout
- codes are valid for 2 minutes (`telegram_link_expires_at`)

An attacker POSTs forged updates in a loop with their own `chat_id` until a live
code hits, and line 94 binds **the victim's profile** to the attacker's Telegram.
They then receive that user's balance notifications, subscription state, plan
details, and every admin message — and line 87's guard doesn't help, because the
attacker's chat isn't linked to anything yet.

Additionally anyone can spam `support_messages` and `telegram_chat_state`.

**Fix direction:** verify the secret token header, lengthen the code, add a hard
attempt limit per chat_id, rate limit the route.

---

## C6 — Rate limiting exists on 4 routes and is ineffective on all of them
**Files:** `lib/rate-limit/memory-limiter.ts` · applied only in
`app/api/{send,pricing,plan-request,ping}/route.ts`

Two separate problems.

**(a) Coverage.** These API-key endpoints have **zero** rate limiting:
`/api/media`, `/api/presence`, `/api/mark-read`, `/api/groups`,
`/api/groups/participants`, `/api/contacts`, `/api/messages`, `/api/messages/media`,
`/api/inbox/media`, `/api/analytics`, plus every admin route and both webhooks.
`/api/media` in particular returns fully decrypted WhatsApp media as base64 on
demand, unthrottled.

**(b) The limiter can't work on this platform.** `MemoryRateLimiter` holds a
`Map` in module scope. Each Vercel function instance has its own. Effective limit
is `max × (number of warm instances)`, and an attacker generating load *causes*
more instances to spin up — so the ceiling rises under exactly the conditions it
exists to defend against. The file's own header acknowledges this.

The `Map` also **never evicts**. Cleanup is "lazy" — an expired entry is only
overwritten when that *same key* is hit again. Keys that are never seen again
(one-shot IPs, rotated API keys) stay forever. On a long-lived warm instance this
is an unbounded memory leak.

**Fix direction:** shared store (Upstash Redis / Supabase table) + apply to all
authenticated endpoints.

---

# 🟠 HIGH

## H1 — SSRF filter is a string-prefix denylist and is bypassable
**File:** `lib/security.ts:7-49`
**Used by:** `app/api/evolution/webhook/route.ts:313`, `app/api/wh/[token]/route.ts:203`

`isSafeUrl()` blocks a hardcoded list of literal hostnames and three string
prefixes. Known bypasses, all of which reach internal services:

| Bypass | Why it passes |
|---|---|
| `http://127.0.0.2` | only `127.0.0.1` is listed |
| `http://0.0.0.0` | not listed |
| `http://2130706433/` | decimal-encoded `127.0.0.1` |
| `http://0x7f.0x0.0x0.0x1/` | hex-encoded |
| `http://[::ffff:127.0.0.1]` | IPv4-mapped IPv6 |
| `http://127.0.0.1.nip.io` | public DNS resolving to loopback |
| `http://[fd00::1]` | IPv6 ULA — no IPv6 private range is checked |
| `http://169.254.1.1` | only the `.169.254` metadata IP is listed |
| `http://100.64.0.1` | carrier-grade NAT / Tailscale range |
| any hostname you control | DNS rebinding — resolves public at check, private at fetch |

**Also:** `fetch()` follows redirects by default. A perfectly public URL can
respond `302 → http://169.254.169.254/latest/meta-data/` and the check is never
re-applied. There is no `redirect: "manual"` anywhere.

`lib/security.test.ts` covers 8 cases — all of them the obvious ones this code
already handles.

**Fix direction:** resolve DNS and validate the resolved IP against CIDR ranges;
`redirect: "manual"` and re-validate each hop; add a timeout.

---

## H2 — Session cookies stripped of `maxAge`/`expires`
**File:** `lib/supabase/proxy.ts:30-35`

```ts
delete (sessionOpts as { maxAge?: number }).maxAge
delete (sessionOpts as { expires?: Date }).expires
```

This is applied to **every** cookie Supabase sets, including the refresh token.
The intent (session-only cookies, comment says "cleared when the browser is
closed") is a deliberate product decision, but the consequences aren't handled:
"remember me" is impossible, and modern browsers' session-restore can resurrect
session cookies anyway — so it doesn't reliably deliver the security property it
was written for, while definitely delivering the UX cost.

**Fix direction:** decide the intended behaviour explicitly and implement it with
an absolute expiry rather than by deleting attributes.

---

## H3 — Middleware runs on every request including `/api/*`
**File:** `middleware.ts:8-12`

The matcher excludes only static assets. Every single request — including
API-key-authenticated ones like `/api/send`, and unauthenticated ones like
`/api/wh/[token]` and both webhooks — pays a network round-trip to Supabase for
`auth.getUser()`. Dashboard paths pay a **second** query for `profiles`, and
`/admin` paths pay their own.

**Impact:** added latency on the hot send path, wasted Supabase quota, and an
availability coupling — if Supabase auth is slow, *every* endpoint is slow,
including ones that don't use cookie auth at all.

**Fix direction:** exclude `/api/` from the matcher (API routes do their own auth)
or early-return before `getUser()` for those paths.

---

## H4 — `supabase/schema.sql` does not describe this application
**File:** `supabase/schema.sql` (9.8 KB, last meaningful update unclear)

`public.profiles` as defined in the schema:

```sql
create table public.profiles (
  id, full_name, company, avatar_url, created_at, updated_at
);
```

Columns the running code reads from `profiles`: `email`, `role`, `status`, `plan`,
`plan_expires_at`, `balance`, `max_instances`, `max_messages`,
`custom_max_instances`, `notes`, `whatsapp`, `telegram_chat_id`,
`telegram_link_code`, `telegram_link_expires_at`, `telegram_linked_at`.
**None of them exist in the schema.**

Tables the code queries that appear in **no** schema or migration file:

`api_keys` · `subscriptions` · `plans` · `credit_transactions` · `notifications` ·
`admin_audit_log` · `support_messages` · `telegram_chat_state` ·
`user_webhook_tokens` · `api_usage_log` · `webhook_events` · `webhook_deliveries` ·
`webhook_configs` · `plan_requests` · `campaign_contacts` · `campaigns` ·
`auto_reply_rules` · `chats` · `messages` · `contacts`

**This is the single biggest blocker to the deployment plan.** There is currently
no reproducible way to create this database. The production DB exists only as
manual clicks in someone's Supabase dashboard. You cannot stand up a staging
environment, you cannot onboard a second developer, you cannot recover from a
dropped table, and you cannot migrate to another host.

`PROJECT_MEMORY/NEXT_SESSION.md` lists "Setup live environment DB → execute schema
audits" as a next step — this finding is that step, and it must come first.

---

## H5 — RLS is not the security boundary; route code is
**Files:** 21 of ~70 routes instantiate a service-role client

`createServiceClient(URL, SUPABASE_SERVICE_ROLE_KEY)` **bypasses Row Level
Security completely**. Whatever RLS policies exist in Supabase are irrelevant on
those paths. The only thing preventing user A from reading user B's data is
whether the developer remembered `.eq("user_id", …)` in that specific query.

There is no test, no lint rule, and no review checklist enforcing that. Every new
route is a fresh chance to leak the entire user table.

Confirmed instance of the risk in `/api/evolution/webhook`: instances are looked
up by `instance_name` alone with no user scoping, and the status update
(`.eq("instance_name", instanceName)`) writes to whichever row matches — combined
with C3 this is directly exploitable.

**Fix direction:** audit all 21 service-role routes for ownership scoping; write
RLS policies as defence-in-depth; add a test that fails when a route reads a
user-owned table without a user filter.

---

## H6 — Usage limits are advisory: check-then-act with no atomicity
**Files:** `app/api/send/route.ts:90-107`, `lib/anti-ban.ts:91-107`,
`app/api/instances/route.ts:78-89`

Every limit follows the same shape:

```ts
const { count } = await db.from("messages").select(...)   // read
if (count >= max) return 429                              // decide
... send ...                                              // act
```

Between the read and the act, N concurrent requests all read the same count and
all pass. With the API key being the intended entry point for automation tools
(n8n, Make, Zapier — which fire in parallel by design), this is not a theoretical
race. Monthly message caps, warmup daily limits, and per-plan instance caps can
all be exceeded by simply sending concurrently.

`/api/send` has an additional plain logic hole at line 97: the monthly count only
runs `if (instIds.length)`. It also counts rows in `messages`, which is populated
by webhook — so a user whose webhook is misconfigured has no usage recorded and
effectively unlimited sending.

**Fix direction:** atomic counter (Postgres `UPDATE ... RETURNING` or an RPC),
not a SELECT.

---

## H7 — Webhook handlers block for seconds inside the request
**Files:** `app/api/wh/[token]/route.ts:187`, `app/api/send/route.ts:187`

```ts
await new Promise((res) => setTimeout(res, typingMs))   // 3000–8000 ms
```

This sits inside the inbound webhook handler, in a loop over messages, in a loop
over rules. Evolution API will time out waiting for the response and retry the
delivery — producing **duplicate auto-replies** to the customer. With several
messages in one batch the handler can block for 30 s+ and hit Vercel's function
timeout, at which point the whole batch is lost *and* retried.

The "typing…" delay is a legitimate anti-ban feature; running it synchronously
inside an HTTP handler is the bug.

**Fix direction:** ack the webhook immediately (200), queue the reply work.

---

## H8 — `approve`/`activate` destroys the user's real signup date
**File:** `app/api/admin/users/[id]/action/route.ts:30-32`

```ts
if (action === "approve" || action === "activate") {
  profileUpdate.created_at = new Date().toISOString()
}
```

`created_at` is the account creation timestamp. Overwriting it to implement "trial
starts at approval" corrupts an immutable audit field. Every reactivation resets
it again. Consequences: cohort analytics are wrong, "member since" is wrong,
account age is wrong — and `lib/anti-ban.ts` derives warmup limits from age, so
this can silently change send limits.

**Fix direction:** add a `trial_started_at` column; never write `created_at`.

---

## H9 — Admin user deletion is non-atomic and swallows its own failure
**File:** `app/api/admin/users/[id]/action/route.ts:143-144`

```ts
await db.auth.admin.deleteUser(targetUserId).catch(() => {})
await db.from("profiles").delete().eq("id", targetUserId)
```

If the auth deletion fails, the error is discarded and the profile is deleted
anyway. The result is an auth user with valid credentials and no profile row.
That user can still log in; `getCurrentUser()` returns `null` at
`lib/auth/session.ts:56`; `requireUser()` redirects to `/login`; the middleware
sees a valid session and redirects back to `/dashboard` — **an infinite redirect
loop the user cannot escape**, on an account that is supposed to be gone.

The same route also does not prevent an admin from deleting themselves or another
super_admin.

**Fix direction:** check the error, abort on failure, and guard self/super_admin
deletion.

---

## H10 — `/api/media` will fail on real media
**File:** `app/api/media/route.ts:68-74`

Returns Evolution's decrypted media as a base64 string inside a JSON body, with no
size check. Base64 inflates by ~33%: a 5 MB voice note becomes ~6.7 MB of JSON, a
20 MB video becomes ~27 MB.

Vercel's serverless response limit is **4.5 MB**. Anything beyond a small image
returns an opaque platform error, not a handled one. The whole feature is broken
for the media types users actually send.

**Fix direction:** stream the bytes with the correct `Content-Type`, or return a
short-lived signed URL from storage.

---

## H11 — Unbounded retry loop driven by a DB value
**File:** `app/api/wh/[token]/route.ts:206-217`

```ts
const maxAttempts = (cfg.retry_count as number) ?? 3
for (let attempt = 1; attempt <= maxAttempts; attempt++) { ...
  await new Promise((r) => setTimeout(r, attempt * 2000))
}
```

`retry_count` comes from the `webhook_configs` row with no validation at write
time (`app/api/webhooks/route.ts` doesn't validate it, and C2's mass assignment
means a user can set it to anything). `retry_count: 1000` produces a backoff
totalling well over a day of sleeping inside a function.

**Fix direction:** clamp to a sane max (e.g. 5) at both read and write.

---

## H12 — `CORS: *` on API-key endpoints encourages key leakage
**Files:** `/api/send`, `/api/media`, `/api/presence`, `/api/mark-read`,
`/api/groups`, `/api/groups/participants`, `/api/contacts`

`Access-Control-Allow-Origin: *` with `Access-Control-Allow-Headers: Authorization`
tells every developer that calling these from browser JavaScript is supported. It
is not — doing so requires shipping a `bsm_live_` key to the client, where anyone
can read it. The docs pages (`app/dashboard/docs/*`) should be checked for whether
they demonstrate this pattern.

There's no CSRF exposure (the key isn't a cookie), so this is a design/guidance
problem rather than a direct vulnerability — but a leaked key grants full send
access to the account.

**Fix direction:** document server-side-only clearly; consider dropping the
wildcard for the write endpoints.

---

# 🟡 MEDIUM

| ID | Finding | File |
|----|---------|------|
| **M1** | CSP is still `Report-Only`. The header comment describes a 3–7 day observation window then a flip to enforced — that never happened. `script-src 'unsafe-inline'` also makes the policy weak against XSS even once enforced, and `connect-src` omits Evolution/Telegram origins. | `next.config.mjs:113-118` |
| **M2** | `images: { unoptimized: true }` — every image is served at full size, no WebP/AVIF, no responsive srcset. Directly hurts LCP on the marketing pages this product needs for conversion. | `next.config.mjs:124` |
| **M3** | Test coverage is 11 tests across 2 utility files. Zero tests for auth, billing, ownership scoping, rate limiting, or any of the 70 routes. Every finding in this document could have been a failing test. | `lib/*.test.ts` |
| **M4** | CI runs `lint` + `test` but never `pnpm build` or `tsc --noEmit`. The comment says Vercel covers it — meaning `main` can hold a broken build until someone deploys. | `.github/workflows/ci.yml:52-56` |
| **M5** | `package.json` name is still `my-v0-project`. No `packageManager` field, while CI pins pnpm 10 and uses `--frozen-lockfile` — a version drift will fail CI with a confusing error. | `package.json:2` |
| **M6** | `README.md` is v0 boilerplate: no env var list, no setup steps, no DB bootstrap, no deploy notes. Still contains `<!-- deploy trigger 1781652456 -->`. | `README.md` |
| **M7** | No `.env.example`. Every required secret must be discovered by grepping `process.env`. | — |
| **M8** | `config/env.ts` defaults all secrets to `""` and exports `requireEnv()` — which is **never called anywhere in the repo**. Misconfiguration surfaces as a runtime 500 deep in a request instead of a clear failure at boot. This is the mechanism that makes C3 dangerous. | `config/env.ts:81` |
| **M9** | All time logic uses server-local time (`new Date().getHours()`, `setHours(0,0,0,0)`). On Vercel that's UTC; users are in Egypt (UTC+2/+3). Quiet hours, daily warmup windows, and monthly message counts are all shifted 2–3 hours. | `lib/anti-ban.ts:52`, `app/api/send/route.ts:94` |
| **M10** | `authAndInstance()` is copy-pasted **verbatim** across `presence`, `mark-read`, `groups`, `groups/participants`, `contacts`. Any fix (e.g. adding rate limiting per C6) must be applied 5×. Two different `requireAdmin` implementations also exist with different return semantics — `lib/admin.ts` returns a result object, `lib/auth/guards.ts` redirects. | `app/api/*/route.ts`, `lib/admin.ts` vs `lib/auth/guards.ts` |
| **M11** | Duplicated modules: `app/globals.css` + `styles/globals.css`; `hooks/use-toast.ts` + `components/ui/use-toast.ts`; `hooks/use-mobile.ts` + `components/ui/use-mobile.tsx`. Unclear which is live. | — |
| **M12** | No `export const runtime` / `maxDuration` / `dynamic` declared on any route. Long-running routes get the default timeout; routes that must never be cached rely on implicit behaviour. | `app/api/**` |

---

# Suggested execution order

| Phase | Theme | Findings | Why this order |
|-------|-------|----------|----------------|
| **0** | Reproducibility & foundations | H4, M4, M5, M6, M7, M8, M11 | Nothing can be verified or deployed until the DB can be recreated from source. Everything downstream depends on this. |
| **1** | Critical security | C2, C3, C5, C6, H1, H5, H11, H12 | Highest blast radius. Must land before anything is exposed publicly. |
| **2** | Billing correctness | C4, H6, H8, H9, M9 | Real money. Currently double-charging and disconnecting paying customers. |
| **3** | Campaign engine | C1, H7 | Architectural — needs its own phase. The core product feature is broken on the target platform. |
| **4** | Performance & platform | H3, H10, M1, M2, M12 | Correctness first, then speed. |
| **5** | Quality & hardening | M3, M10, plus regression tests for every fix above | Lock in the fixes so they can't silently regress. |
| **6** | Deploy | — | GitHub → Vercel → production hosting. Only after 0–5 are green. |
