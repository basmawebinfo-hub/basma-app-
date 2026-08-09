# Phase 6 — Deployment

**Goal:** local → GitHub → Vercel → production hosting, in that order, with a
verification gate at each step.

**Prerequisite:** Phases 0–5 all approved and green.

> **This phase is mostly the owner's, not Kimi's.** Kimi prepares and verifies;
> the owner performs anything involving credentials, DNS, billing, or the
> production database. Kimi must **not** create accounts, enter payment details,
> buy domains, or push to a production branch.

---

## Stage A — Local verification (Kimi)

Full clean-room run. The point is to prove Phase 0's reproducibility claim
actually holds.

```bash
rm -rf node_modules .next
pnpm install --frozen-lockfile
```
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Then, against a **fresh throwaway Supabase project**:
1. Run `supabase/schema.sql`, then `supabase/rls.sql`, then every file in
   `supabase/migrations/` in order. Zero errors.
2. Fill `.env.local` from `.env.example` only — no undocumented variable may be
   needed. If you need one that isn't in `.env.example`, that's a Phase 0 bug;
   fix `.env.example`.
3. `pnpm dev` and walk the full user journey:

| # | Flow | Verify |
|---|------|--------|
| 1 | Register → email confirm → login | lands correctly, profile row created |
| 2 | Pending → admin approves | `trial_started_at` set, `created_at` untouched |
| 3 | Link Telegram | 12-char code, expiry works, wrong code locks out after 5 |
| 4 | Create instance → QR | Evolution called, webhook auto-registered |
| 5 | Send/receive a message | inbox updates, webhook records it |
| 6 | Auto-reply rule fires | exactly **once** — no duplicate |
| 7 | Bulk campaign, ~100 contacts | completes across worker ticks, pause/resume work |
| 8 | Generate API key → `/api/send` | works; rate limit returns 429 at the boundary |
| 9 | Webhook config → delivery | fires; SSRF-blocked URL is rejected |
| 10 | Billing cron (manual, with secret) | charges **once**; second run is a no-op |
| 11 | Admin panel | users, balance, plans, suspend, delete — all correct |
| 12 | Suspended + past_due users | correctly blocked from sending |

**Deliverable:** `reports/PHASE-6A-LOCAL-VERIFICATION.md` — a row per flow with
PASS/FAIL and evidence. **Any FAIL stops the phase.**

---

## Stage B — GitHub (owner, with Kimi's prep)

**Kimi prepares:**
- `.gitignore` covers `.env*` (except `.env.example`), `node_modules`, `.next`
- **Scan the entire history for leaked secrets** — the repo predates this review
  and may already contain them:
  ```bash
  git log -p --all | grep -nE "(SUPABASE_SERVICE_ROLE|eyJ[A-Za-z0-9_-]{20,}|bsm_live_|bot[0-9]{8,}:AA)"
  ```
  Report **every** hit with commit SHA and file. Do not attempt history rewriting.
- Branch protection recommendations for `main`: require CI green, require PR
- A PR description summarizing all six phases
- Confirm CI passes on a feature branch first

**Owner performs:**
- Reviews the diff
- Merges to `main`
- If Kimi's scan found leaked secrets: **rotate every one of them** — Supabase
  service role key, Evolution API key, Telegram bot token, `CRON_SECRET`,
  `EVOLUTION_WEBHOOK_SECRET` — before anything goes public. Consider whether the
  repo should be private.

---

## Stage C — Vercel (owner, with Kimi's prep)

**⚠️ Deploy prerequisites — set these in Vercel BEFORE deploying**, or the app
breaks. Phase 1 made these fail *closed* on purpose:

| Variable | If missing |
|----------|-----------|
| `CRON_SECRET` | both cron routes return 503 — no billing, no campaigns |
| `EVOLUTION_WEBHOOK_SECRET` | **all inbound WhatsApp messages stop being recorded** |
| `TELEGRAM_WEBHOOK_SECRET` | Telegram bot stops responding |
| `SUPABASE_SERVICE_ROLE_KEY` | app fails at boot (`assertProductionEnv`) |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | app fails at boot |
| `EVOLUTION_API_URL` / `_API_KEY` | sending fails |
| `NEXT_PUBLIC_APP_URL` | webhook URLs registered against the wrong host |

**Kimi prepares:** the full env var checklist (name, which environments, what
breaks without it) plus a post-deploy smoke checklist.

**Owner performs:**
1. Set every variable for Production **and** Preview
2. Deploy to **Preview first** — never straight to production
3. Point Evolution's webhook and Telegram's `setWebhook` at the preview URL and
   re-run the Stage A journey against it
4. Confirm both crons appear in the Vercel dashboard and fire on schedule
5. Only then promote to Production
6. Re-point Evolution + Telegram webhooks at the production URL

**Kimi verifies after each deploy:** security headers present, CSP enforced (not
Report-Only), no secrets in the client bundle
(`grep -r "service_role\|bsm_live_" .next/static`), all 12 flows pass.

---

## Stage D — Production hosting & domain (owner only)

The owner mentioned moving to a stronger host after Vercel. Decide with real data
from Stages A–C rather than in advance.

**Kimi's deliverable — a written comparison, not a decision:**

| Option | Fits because | Costs / risks |
|--------|--------------|---------------|
| Stay on Vercel Pro | zero migration; crons, edge, and the Next.js build are first-party | function timeout ceiling; bandwidth pricing at scale |
| VPS (Hetzner/DO) + Docker | full control; cheap; Evolution API can be co-located to cut latency | you own uptime, patching, backups, TLS, CI/CD |
| Railway / Render / Fly.io | middle ground; managed but longer-running processes allowed | fewer Next.js-specific optimizations |

Points that should drive the choice: the campaign worker's runtime needs (Phase 3
measurements), where Evolution API is hosted, expected message volume, and
whether the team can operate a VPS.

**Owner performs all of:** account creation, payment, domain purchase/transfer,
DNS records for `basmaweb.com`, TLS.

**Do not ask Kimi or Claude to enter payment details, buy a domain, or create
hosting accounts.**

**Cutover checklist (owner, Kimi prepares):** DNS TTL lowered in advance ·
Supabase project decision (reuse vs migrate — if migrating, dump/restore plan and
a maintenance window) · Evolution + Telegram webhooks re-pointed · rollback plan ·
`NEXT_PUBLIC_APP_URL` updated · Supabase Auth redirect URLs updated · full
Stage A journey re-run on production.

---

## Stage E — Post-launch (ongoing)

- Uptime monitoring on `/api/ping` and both webhook endpoints
- Error tracking (Sentry or equivalent) — `docs/OBSERVABILITY.md` should say which
- Alerts: cron failed, webhook delivery failure rate, instance mass-disconnect,
  balance-depletion spikes
- **Automated Supabase backups verified by an actual test restore.** An untested
  backup is not a backup.
- A written runbook: WhatsApp number banned · Evolution down · billing cron
  failed · rollback procedure

---

## Definition of Done

- [ ] Stage A: clean-room build + fresh-DB setup + all 12 flows PASS
- [ ] Stage B: history scanned for secrets; findings reported; any leak rotated
- [ ] Stage C: env checklist delivered; preview verified before production
- [ ] Post-deploy: headers correct, CSP enforced, no secrets in client bundle
- [ ] Stage D: hosting comparison written; owner has decided
- [ ] Stage E: monitoring, alerting, tested backups, runbook in place
- [ ] `reports/PHASE-6-REPORT.md` written
