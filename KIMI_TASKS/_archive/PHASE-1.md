# Phase 1 — Critical Security

**Goal:** close the holes that let an unauthenticated attacker charge accounts,
forge messages, hijack a user's Telegram, or reach internal infrastructure.

**Prerequisite:** Phase 0 approved.
**Findings covered:** C2, C3, C5, C6, H1, H5, H11, H12

**Rule for this phase:** every fix gets a test. A security fix with no test is a
security fix that silently regresses in three months. Tests go in
`lib/*.test.ts` or a new `app/api/**/*.test.ts` — Vitest is already configured
(`vitest.config.ts`).

---

## T1.1 — Fail *closed* on missing secrets `[C3]` 🔴

Three routes are fully public when their secret env var is unset:

| File | Line | Env var |
|------|------|---------|
| `app/api/cron/billing/route.ts` | 19 | `CRON_SECRET` |
| `app/api/cron/subscriptions/route.ts` | 19 | `CRON_SECRET` |
| `app/api/evolution/webhook/route.ts` | 21 | `EVOLUTION_WEBHOOK_SECRET` |

All three say `if (secret) { check }` — no secret means no check.

**Create `lib/auth/cron.ts`:**

```ts
import "server-only"
import { NextResponse, type NextRequest } from "next/server"
import crypto from "crypto"

/** Constant-time string compare that is safe on length mismatch. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

/**
 * Returns a Response to return verbatim if the caller is not authorized,
 * or null if the request may proceed. Fails CLOSED: a missing secret is a
 * misconfiguration, not permission.
 */
export function guardCron(req: NextRequest): Response | null {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    return NextResponse.json(
      { error: "Service unavailable: CRON_SECRET is not configured" },
      { status: 503 },
    )
  }
  const auth = req.headers.get("authorization") ?? ""
  if (!auth.startsWith("Bearer ") || !safeEqual(auth.slice(7), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
```

Add an equivalent `guardEvolutionWebhook(req)` reading
`EVOLUTION_WEBHOOK_SECRET` from `?key=` or the `x-webhook-key` header, also
constant-time, also 503 when unset.

Replace the inline checks in all three routes.

> **⚠️ Operational warning — read this before deploying.** Making the Evolution
> webhook fail closed means that if `EVOLUTION_WEBHOOK_SECRET` is not set in
> Vercel, **all inbound WhatsApp messages stop being recorded**. Verify the var
> is set in the Vercel dashboard *before* this ships, and note it in your report
> as a deploy prerequisite.

**Tests** (`lib/auth/cron.test.ts`):
- unset secret → 503
- wrong secret → 401
- correct secret → null
- `safeEqual` returns false on length mismatch instead of throwing

---

## T1.2 — Kill the mass assignment on `PATCH /api/webhooks` `[C2]` 🔴

**File:** `app/api/webhooks/route.ts:70-78`

Replace `{ ...body }` with an explicit allowlist. Only these may be updated:

```
name · destination_type · destination_url · destination_email
events · secret · is_active · instance_id · retry_count
```

**Never** accept from the client: `user_id`, `id`, `created_at`.

Build the patch object field by field, coercing types, skipping `undefined`:

```ts
const patch: Record<string, unknown> = {}
if (typeof body.name === "string") patch.name = body.name.slice(0, 200)
if (typeof body.is_active === "boolean") patch.is_active = body.is_active
if (Array.isArray(body.events)) patch.events = body.events
// ... etc
if (body.retry_count !== undefined) {
  patch.retry_count = Math.min(Math.max(Number(body.retry_count) || 3, 1), 5) // see T1.7
}
if (Object.keys(patch).length === 0) {
  return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 })
}
patch.updated_at = new Date().toISOString()
```

Validate `destination_url` with `isSafeUrl()` (the hardened version from T1.5)
on **both** POST and PATCH — currently neither validates it at write time.

**Then audit every other route for the same pattern:**
```bash
grep -rn "\.update({ \.\.\." app/api
grep -rn "\.\.\.body" app/api
```
Fix every hit the same way. List them all in your report.

**Test:** PATCH with `{"user_id": "<other-uuid>"}` must not change `user_id`.

---

## T1.3 — Authenticate the Telegram webhook `[C5]` 🔴

**File:** `app/api/telegram/webhook/route.ts` — currently accepts any POST from anyone.

**(a) Verify Telegram's secret token.** Telegram sends
`X-Telegram-Bot-Api-Secret-Token` on every update when the webhook was registered
with a `secret_token`. Add env var `TELEGRAM_WEBHOOK_SECRET`, verify with
`safeEqual` from T1.1, fail closed (503 unset / 401 mismatch).

Document in the report the exact `setWebhook` call the owner must run:
```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=<APP_URL>/api/telegram/webhook&secret_token=<SECRET>
```
Add `TELEGRAM_WEBHOOK_SECRET` to `.env.example`.

**(b) Make link codes unguessable.** `lib/`/`app/api/telegram/link/route.ts`
generates a `BSM-[A-F0-9]{6}` code — 16.7M combinations, brute-forceable in
minutes at HTTP speed with no lockout.

- Widen to **12 hex chars** (`BSM-[A-F0-9]{12}`) using `crypto.randomBytes`.
  Update the regex in the webhook to match, and any UI copy showing the format.
- Keep the 2-minute expiry.
- Add an attempt counter: track failed code attempts per `chat_id`; after **5**
  failures in 10 minutes, reject further attempts from that chat for an hour.
  Store in `telegram_chat_state` (add columns `failed_attempts int default 0`,
  `locked_until timestamptz`) — add these to `supabase/schema.sql` too.
- Rate limit the route itself per `chat_id` (see T1.4).

**Tests:** wrong secret token → 401 · code regex accepts 12 chars, rejects 6 ·
6th failed attempt within the window is rejected.

---

## T1.4 — Rate limiting: shared store + full coverage `[C6]` 🔴

**Two parts. Do (a) before (b).**

### (a) Replace the in-memory limiter with a shared store

`lib/rate-limit/memory-limiter.ts` keeps a `Map` per serverless instance. The
effective limit is `max × warm_instances`, and load *creates* instances — so the
ceiling rises under attack. The `Map` also never evicts (unbounded memory growth
on a long-lived warm instance).

Implement a shared backend behind the **existing** `enforceRateLimit()` signature
so call sites don't change. Two options — **pick one and justify it in the report:**

1. **Upstash Redis** (`@upstash/ratelimit` + `@upstash/redis`) — purpose-built,
   sliding window, works on edge. Costs money, adds a vendor.
2. **Supabase table** + a Postgres function doing an atomic
   `INSERT ... ON CONFLICT DO UPDATE ... RETURNING count`. No new vendor, reuses
   infra we already pay for. Slightly slower, adds DB load.

Keep `MemoryRateLimiter` as the **development / no-backend-configured fallback**
and add lazy eviction to it (sweep expired keys when the map exceeds ~10k
entries) so the leak is capped either way.

Keep the fail-open behaviour on limiter errors — that part is correct.

### (b) Apply it everywhere

Currently only 4 routes call `enforceRateLimit`. Add it to **every**
authenticated or public endpoint. Priority order:

| Route | Key by | Suggested limit |
|-------|--------|-----------------|
| `/api/media` | api-key hash | 20 / min — returns full media payloads |
| `/api/presence`, `/api/mark-read` | api-key hash | 120 / min |
| `/api/groups`, `/api/groups/participants` | api-key hash | 30 / min |
| `/api/contacts`, `/api/messages`, `/api/messages/media` | api-key hash | 60 / min |
| `/api/telegram/webhook` | `chat_id` | 20 / min |
| `/api/wh/[token]` | token | 300 / min |
| `/api/evolution/webhook` | instance name | 300 / min |
| `/api/user/api-key` POST | user id | 5 / hour — key regeneration |
| `/api/user/delete` POST | user id | 3 / hour |
| `/api/admin/**` | user id | 300 / min |
| auth actions (login/register) | IP | 10 / 15 min — brute force |

Add each as a `RateLimitTarget` in `lib/rate-limit/config.ts`.

**Tests:** limit boundary (Nth allowed, N+1th → 429) · `Retry-After` present ·
limiter throwing still lets the request through.

---

## T1.5 — Harden the SSRF filter `[H1]` 🟠

**File:** `lib/security.ts` — currently a string-prefix denylist. Bypassable via
`127.0.0.2`, `0.0.0.0`, decimal IPs (`http://2130706433/`), hex IPs, IPv4-mapped
IPv6 (`[::ffff:127.0.0.1]`), `nip.io`-style public-DNS-to-private, IPv6 ULA
(`fd00::/8`), `100.64.0.0/10`, and DNS rebinding.

**Rewrite as an allowlist-by-resolution:**

1. Parse the URL; require `http:`/`https:`.
2. Reject credentials in the URL (`user:pass@`).
3. **Resolve the hostname** via `dns.promises.lookup(host, { all: true })`.
4. Reject if **any** resolved address falls in a blocked range:
   - IPv4: `0.0.0.0/8`, `10/8`, `100.64/10`, `127/8`, `169.254/16`, `172.16/12`,
     `192.0.0/24`, `192.168/16`, `198.18/15`, `224/4`, `240/4`
   - IPv6: `::`, `::1`, `fc00::/7`, `fe80::/10`, and **IPv4-mapped `::ffff:0:0/96`**
     (map to v4 and re-check)
5. Return the **resolved IP** alongside the boolean so the caller can pin it.

**Then fix the callers** (`app/api/evolution/webhook/route.ts:313`,
`app/api/wh/[token]/route.ts:203`, plus `app/api/webhooks/replay/route.ts:43`
which does **no** check at all today):

```ts
await fetch(url, {
  redirect: "manual",              // <-- fetch follows redirects by default;
  signal: AbortSignal.timeout(10_000),  //     a public URL can 302 to 169.254.169.254
  ...
})
```

If the response is a 3xx, re-run `isSafeUrl()` on the `Location` header before
following. Cap at 3 hops.

**Note the residual risk in your report:** without pinning the connection to the
resolved IP, a TOCTOU DNS-rebinding window remains. Full mitigation needs a custom
agent/dispatcher. Say whether you closed it or left it.

**Tests — extend `lib/security.test.ts`** with every bypass in the table above,
plus the redirect case. The current 8 tests only cover cases the old code already
handled.

---

## T1.6 — Audit all 21 service-role routes for ownership scoping `[H5]` 🟠

`createServiceClient(URL, SUPABASE_SERVICE_ROLE_KEY)` **bypasses RLS entirely**.
On those routes the only thing separating user A from user B's data is whether
someone remembered `.eq("user_id", …)`.

```bash
grep -rln "SUPABASE_SERVICE_ROLE_KEY" app/api
```

For **each** of the 21 files, produce a row in your report:

| Route | Why service-role is needed | Every query scoped to the caller? | Verdict |
|-------|---------------------------|-----------------------------------|---------|

Rules:
- If service-role is **not** actually needed (the query would work under RLS as
  the logged-in user) → switch it to `lib/supabase/server.ts`'s `createClient()`.
- If it **is** needed → every query touching a user-owned table must filter by the
  authenticated user's id, or by an id already proven to belong to them.
- **Known problem to fix:** `app/api/evolution/webhook/route.ts` looks up and
  updates `instances` by `instance_name` with **no** user scoping. Combined with
  C3 that's directly exploitable. Instance names are generated as
  `${user.id.slice(0,8)}_${slug}_${Date.now()}` (`app/api/instances/route.ts:102`)
  — partially guessable. Scope the lookup and verify the instance belongs to the
  webhook's user.

Report every unscoped query you find, even ones you fix.

---

## T1.7 — Clamp the webhook retry loop `[H11]` 🟠

**File:** `app/api/wh/[token]/route.ts:206`

```ts
const maxAttempts = (cfg.retry_count as number) ?? 3
```

`retry_count` comes straight from the DB with no validation. Clamp at read:

```ts
const maxAttempts = Math.min(Math.max(Number(cfg.retry_count) || 3, 1), 5)
```

Also cap the backoff (`attempt * 2000` → max 10 s) and add
`AbortSignal.timeout(10_000)` to the `fetch`. Apply the same clamp at write time
in T1.2. Add a `CHECK (retry_count between 1 and 5)` to the schema.

---

## T1.8 — Document API keys as server-side-only `[H12]` 🟠

`Access-Control-Allow-Origin: *` plus `Allow-Headers: Authorization` on
`/api/send`, `/api/media`, `/api/presence`, `/api/mark-read`, `/api/groups`,
`/api/contacts` signals that browser calls are supported. They aren't — that
requires shipping a `bsm_live_` key to the client where anyone can read it.

1. Read `app/dashboard/docs/page.tsx`, `docs/sdk`, `docs/mcp` and the public
   `app/docs/page.tsx`. **If any example shows calling these from browser JS,
   change it to a server-side example** (curl / Node / n8n).
2. Add a clear warning in the docs UI, in Arabic, matching the surrounding copy:
   keys are server-side only, never put them in front-end code.
3. Keep `OPTIONS`/CORS as-is for now — removing it may break existing customer
   integrations. Note the recommendation in your report; the owner decides.

---

## Definition of Done

- [ ] C3: all three routes 503 on missing secret, 401 on wrong, constant-time compare
- [ ] C2: `PATCH /api/webhooks` allowlisted; every other `...body` spread found and fixed
- [ ] C5: Telegram secret token verified; codes 12 hex chars; attempt lockout live
- [ ] C6: shared rate-limit store chosen + implemented; applied to all routes in the table
- [ ] H1: `isSafeUrl` resolves DNS and checks CIDRs; callers use `redirect: "manual"` + timeout
- [ ] H5: all 21 service-role routes audited, table in report, unscoped queries fixed
- [ ] H11: retry clamped 1–5, backoff capped, fetch timeout added
- [ ] H12: docs corrected, warning added
- [ ] New tests exist for **every** item above
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` · `pnpm typecheck` all PASS
- [ ] `reports/PHASE-1-REPORT.md` written, including the **deploy prerequisites**
      list (env vars that must be set in Vercel before this ships, or things break)

## Out of scope

Billing double-charge (C4 → Phase 2) · campaign runner (C1 → Phase 3) ·
middleware scope (H3 → Phase 4) · CSP (M1 → Phase 4).
