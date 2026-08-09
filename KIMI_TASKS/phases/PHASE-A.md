# Phase A — Demolition & Clean Slate

**Goal:** strip the repo down to a purely static Next.js site. No database, no
auth, no API routes, no WhatsApp, no Telegram, no billing. What survives is the
design layer and the static pages.

**This is a deletion phase.** You are not building anything. Do not add features,
do not redesign, do not rewrite copy. The site must still build and still look
the way it looks today — just with nothing behind it.

**Findings covered:** supersedes the entire old plan (see `_archive/`).

---

## Context — why this is happening

The product pivoted. The WhatsApp automation platform is being retired. The new
BASMA is:

1. **An academy** — the *BASMA AI Automation Engineer Roadmap*, 14 levels of
   Arabic course content (script + videos per level)
2. **Services** — agency service pages (scope TBD)

Neither needs a database. Course content will live as files in the repo. That
makes ~90% of the current codebase dead weight, and every finding in
`FINDINGS.md` about billing, campaigns, webhooks, and RLS moot.

**The old `PHASE-0`–`PHASE-6` specs are archived in `KIMI_TASKS/_archive/`.
Ignore them. They describe a product that no longer exists.**

---

## Scope: 54 API routes · 55 Supabase-coupled files · all of `supabase/`

---

## T-A.1 — Delete the entire backend

**Directories — delete completely:**

```
app/api/                    (54 route handlers)
app/admin/
app/dashboard/
app/(auth)/
app/auth/
app/actions/
app/pending/
app/suspended/
app/data-deletion/          (Meta/WhatsApp compliance page — product is gone)
app/docs/                   (public WhatsApp API docs)
supabase/                   (schema, rls, migrations, README, SCHEMA_NOTES)
components/dashboard/
components/providers/
lib/supabase/
lib/auth/
lib/rate-limit/
lib/adapters/
lib/registry/
lib/feature-flags/
types/                      (api.ts, auth.ts, billing.ts, common.ts, database.ts)
```

**Files — delete:**

```
middleware.ts               (was only Supabase session + route guards)
lib/evolution.ts            lib/admin.ts        lib/anti-ban.ts
lib/plan.ts                 lib/telegram.ts     lib/notify.ts
lib/security.ts             lib/security.test.ts
lib/request-id.ts
config/permissions.ts       config/tiers.ts
hooks/useCurrentUser.ts     hooks/usePermission.ts
hooks/useTier.ts            hooks/useFeatureFlag.ts
verify_schema.py            (Phase 0 evidence tool, no longer relevant)
docs/OBSERVABILITY.md       (describes the deleted logging pipeline)
```

**Before deleting `lib/security.ts`:** it is imported by webhook routes that are
also being deleted. Confirm with grep that nothing surviving imports it. Same
check for every file above — **grep before each delete, don't batch blindly.**

```bash
grep -rn "from \"@/lib/security\"" app components lib hooks config
```

**Keep `lib/logger.ts` and `lib/logger.test.ts`** — small, dependency-free, and
the only tests we have. Keeping them means `pnpm test` stays green.

---

## T-A.2 — Decouple the one coupled component

`components/pricing.tsx` fetches `/api/pricing` (plans from Postgres + a live
currency-rate API). It is the **only** marketing component with a backend
dependency — every other one is already clean.

Replace the fetch with a local typed constant in the same file (or
`config/pricing.ts`). Keep the exact same rendered output and the same plan
names/prices that the component currently displays as its loading/fallback
state. **Do not redesign the pricing section** — pricing content is a later
phase's problem; right now it just needs to render without a network call.

Remove the currency-conversion logic entirely if it depended on the API. If the
UI has a currency switcher, either keep it with static rates or hide it — say
which you chose and why.

---

## T-A.3 — Strip config and env down to nothing

With no database and no external services, there are no required secrets.

- `config/env.ts` — delete the Supabase/Evolution/Telegram/Groq/Gemini/cron
  schemas, `requireEnv`, `isSupabaseConfigured`, and `assertProductionEnv`.
  If nothing is left, **delete the file** and remove the call from
  `app/layout.tsx:9`.
- `config/constants.ts` — remove `ROUTES` entries pointing at deleted pages
  (`/login`, `/dashboard`, `/admin`, `/pending`, `/suspended`, …). Keep only what
  surviving components actually reference.
- `config/navigation.ts` — same treatment; the navbar/footer link lists must not
  point at deleted routes.
- `.env.example` — reduce to the handful of vars that still exist (likely just
  `NEXT_PUBLIC_APP_URL`, or nothing). If nothing remains, delete the file and
  drop the `!.env.example` line from `.gitignore`.
- `vercel.json` — **delete both cron entries.** They point at deleted routes; on
  deploy Vercel will 404 them daily.

**Check every surviving `<Link href="...">` and `router.push(...)`** against the
routes that still exist. A link to `/dashboard` after this phase is a 404 on a
production marketing site. Grep them all:

```bash
grep -rnoE 'href="/[a-z-]*"' app components | sort -u
```

---

## T-A.4 — Remove dead dependencies

Once the code is gone, prune `package.json`:

**Certain to be removable:** `@supabase/ssr`, `@supabase/supabase-js`

**Check each with grep before removing** — some are used by surviving UI:
`zod` · `recharts` · `date-fns` · `react-day-picker` · `input-otp` ·
`@vercel/analytics` · `cmdk` · `embla-carousel-react` · `react-hook-form` ·
`@hookform/resolvers` · `vaul` · `react-resizable-panels` · `sonner`

```bash
grep -rn "from \"<package>\"" app components lib hooks config
```

Radix packages back `components/ui/*`. **Do not remove any Radix package unless
you also delete the `components/ui` file that imports it** — and don't delete
those files in this phase; the design phase decides what stays. If a UI
component is unused today but is a standard shadcn primitive, keep it.

Run `pnpm install` after editing `package.json` so the lockfile updates.

---

## T-A.5 — Handle the orphaned `components/ui/*`

`components/ui/` has ~50 shadcn primitives. Many were only used by the dashboard
and admin panels that just got deleted.

**Do not delete them in this phase.** They cost nothing at runtime (tree-shaken
if unimported) and the design phase will want most of them. Instead:

- Produce a list in your report: which `components/ui/*` files are still
  imported by surviving code, and which are now orphaned.
- That list is the input to a later cleanup decision. Just report it.

---

## T-A.6 — Neutralize backend-shaped metadata

`app/layout.tsx` metadata is entirely WhatsApp SEO — title, description,
keywords, OpenGraph, Twitter card, and a `SoftwareApplication` JSON-LD block.

**Minimal change only in this phase:**
- Change the JSON-LD `@type` from `SoftwareApplication` with a `$0 Offer` to a
  plain `Organization` block (name, url, logo). Leaving a fake free-software
  offer in structured data is worse than having none.
- Leave title/description/keywords **as they are.** Rewriting them requires
  knowing the new positioning, which is Phase E (SEO). Note in your report that
  they are stale and deliberately untouched.

Same for `app/robots.ts` and `app/sitemap.ts` — remove entries for deleted
routes, don't invent new ones.

---

## T-A.7 — Simplify CI and next.config

- `.github/workflows/ci.yml` — keep lint / typecheck / test / build. No change
  needed unless something breaks.
- `next.config.mjs` — the CSP `connect-src` allows `https://*.supabase.co` and
  `wss://*.supabase.co`. Remove both; nothing connects to Supabase any more.
  Leave the rest of the CSP alone (Report-Only stays for now — enforcing it is
  Phase E).
- **Do not** touch `typescript.ignoreBuildErrors` — it stays `false`.

---

## T-A.8 — Verify the site still works

After all deletions:

```bash
pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Then `pnpm dev` and confirm in a browser:

| Check | Expected |
|-------|----------|
| `/` renders | Hero, video gallery, how-it-works, stats, pricing, FAQ, CTA, footer — **visually identical to before** |
| No network calls to `/api/*` | DevTools → Network tab is clean |
| No console errors | zero |
| Every navbar + footer link | resolves, no 404 |
| `/privacy`, `/terms` | still render |
| Language toggle (ar/en) | still works |
| Dark mode / RTL | unchanged |
| `/dashboard`, `/admin`, `/login` | 404 (expected — they're gone) |

**Screenshot `/` before and after** and put both in your report. "Visually
identical" is the acceptance criterion for this phase and I will check it.

---

## Definition of Done

- [ ] Every path in T-A.1 deleted; nothing surviving imports a deleted module
- [ ] `components/pricing.tsx` renders from static data, output unchanged
- [ ] `config/` and `.env.example` reduced to what still exists
- [ ] `vercel.json` crons removed
- [ ] Zero links/redirects pointing at deleted routes
- [ ] Dead deps pruned; lockfile updated; every removal grep-verified
- [ ] Orphaned `components/ui/*` **listed, not deleted**
- [ ] JSON-LD is an `Organization`; stale copy flagged but untouched
- [ ] CSP no longer references Supabase
- [ ] `pnpm lint` · `typecheck` · `test` · `build` all PASS
- [ ] Before/after screenshots of `/` in the report — visually identical
- [ ] `KIMI_TASKS/reports/PHASE-A-REPORT.md` written

## Out of scope — explicitly do NOT do these

- Do not build the academy or services pages (Phases C and D)
- Do not redesign anything, change colors, spacing, or components (Phase B)
- Do not rewrite marketing copy or SEO metadata (Phase E)
- Do not add a CMS, MDX pipeline, or content loader (Phase C)
- Do not add authentication "for later"
- Do not delete `components/ui/*` files
