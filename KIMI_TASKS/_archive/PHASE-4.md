# Phase 4 — Performance & Platform

**Goal:** correctness is done; now make it fast and properly configured for
production.

**Prerequisite:** Phase 3 approved.
**Findings covered:** H3, H10, M1, M2, M12

---

## T4.1 — Scope the middleware `[H3]` 🟠

**File:** `middleware.ts:8-12`

```ts
matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
```

Excludes static assets only. **Every** request pays a network round-trip to
Supabase for `auth.getUser()` — including:
- `/api/send` (authenticated by API key, cookies irrelevant) — on the hot path
- `/api/wh/[token]`, `/api/evolution/webhook`, `/api/telegram/webhook`
  (unauthenticated by design)
- `/api/cron/*`

Dashboard paths pay a **second** query for `profiles`; `/admin` pays its own.
Beyond latency and Supabase quota, this couples every endpoint's availability to
Supabase auth being fast.

**Fix:**
- Exclude `/api/` from the matcher. API routes already do their own auth — verify
  this is true for every route before removing the safety net, and list any route
  that was relying on middleware in your report.
- Cache the profile lookup within a single request rather than querying twice on
  dashboard paths.
- Early-return before `getUser()` for public marketing pages (`/`, `/privacy`,
  `/terms`, `/docs`, `/data-deletion`) — they don't need a session.

**Measure it.** Record p50/p95 for `/api/send` before and after in your report.

---

## T4.2 — Fix media delivery `[H10]` 🟠

**File:** `app/api/media/route.ts:68-74`

Returns Evolution's decrypted media as base64 inside JSON, unbounded. Base64
inflates ~33%, and **Vercel's serverless response limit is 4.5 MB** — so a 5 MB
voice note (~6.7 MB encoded) fails with an opaque platform error. The feature is
broken for the media types users actually send.

Pick one and justify it:
1. **Stream the bytes** with the real `Content-Type` and `Content-Length` instead
   of a JSON envelope. Simplest, still bounded by the response limit but ~33%
   more headroom.
2. **Upload to Supabase Storage and return a short-lived signed URL.** Removes
   the size ceiling entirely, adds storage cost and a cleanup job. Better answer
   for a product whose users send video.

Either way:
- Add an explicit size check with a clear error before hitting the platform limit
- Add `AbortSignal.timeout()` on the Evolution fetch
- Apply the same treatment to `/api/messages/media` and `/api/inbox/media` —
  check whether they share this problem

---

## T4.3 — Enforce the CSP `[M1]` 🟡

**File:** `next.config.mjs:70-118`

The header comment describes a 3–7 day Report-Only observation window followed by
a flip to enforced. The flip never happened — the policy has been Report-Only
ever since, which blocks nothing.

1. Deploy to a preview, exercise every page (marketing, auth, dashboard, admin,
   docs), and collect real violations from the browser console.
2. Fix the policy to cover what's legitimately needed. Known gaps: `connect-src`
   allows only Supabase — check whether the browser talks to Evolution, Telegram,
   or Vercel Analytics from any client component.
3. `script-src 'unsafe-inline'` makes the policy weak against the exact attack it
   exists to stop. Investigate nonce-based CSP with Next.js 16 — if it's not
   feasible without significant churn, **say so and leave `unsafe-inline`**, but
   record the residual risk. Don't silently accept it.
4. Flip the key from `Content-Security-Policy-Report-Only` to
   `Content-Security-Policy`. Update the comment block to describe reality.

**Do not flip it blind.** An enforced CSP with a wrong directive breaks the app
for every user at once. Preview evidence goes in your report.

---

## T4.4 — Enable image optimization `[M2]` 🟡

**File:** `next.config.mjs:124` — `images: { unoptimized: true }`

Every image ships full-size, no WebP/AVIF, no responsive `srcset`. This is a
marketing site whose job is conversion; LCP matters directly.

- Remove `unoptimized: true`
- Add `images.remotePatterns` for the Supabase Storage domain (avatars) and any
  other external host in use
- Audit `<img>` usage in `components/` — switch to `next/image` with explicit
  `width`/`height` where straightforward
- Verify avatars still render after the change (they come from
  `app/api/user/avatar/route.ts` → Supabase Storage public URL with a `?t=`
  cache-buster)

Report Lighthouse LCP before/after on `/`.

---

## T4.5 — Declare route runtime config `[M12]` 🟡

No route declares `runtime`, `maxDuration`, or `dynamic`. Long-running routes get
the default timeout; routes that must never be cached rely on implicit behaviour.

Go through `app/api/**` and add explicitly:
- `export const maxDuration = 300` — cron routes, the campaign worker
- `export const dynamic = "force-dynamic"` — anything reading cookies/auth that
  must never be statically optimized
- `export const runtime = "nodejs"` — anything using `crypto`, `Buffer`, or `dns`
  (that's most of them; the SSRF check from T1.5 uses `dns`, so it cannot run on
  edge)

Don't blanket-apply. Decide per route and note the reasoning in the report.

---

## T4.6 — Add caching where it's safe

Read-heavy public endpoints currently hit the DB on every request:
`/api/pricing`, `/api/ping`, and the public marketing pages.

- `revalidate` or `Cache-Control` on public, non-personalized responses
- **Never** cache anything behind auth, and verify no `Set-Cookie` response gets
  a public cache header
- Check `app/sitemap.ts` and `app/robots.ts` are static

---

## Definition of Done

- [ ] Middleware no longer runs on `/api/*`; every route's own auth verified first
- [ ] p50/p95 for `/api/send` measured before/after, in the report
- [ ] Media delivery works for a >5 MB file (proof in report)
- [ ] CSP enforced, based on real preview-deployment violation data
- [ ] Image optimization on; avatars verified; LCP before/after recorded
- [ ] Runtime/maxDuration/dynamic declared deliberately per route
- [ ] Safe caching added; nothing authenticated is cached
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` · `pnpm typecheck` PASS
- [ ] `reports/PHASE-4-REPORT.md` written

## Out of scope

Do not refactor components for style. Do not upgrade dependencies. Do not
redesign anything visual.
