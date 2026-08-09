# Phase 5 — Quality & Regression Protection

**Goal:** lock in Phases 0–4 so nothing silently regresses, and remove the
duplication that makes every future fix a five-file chore.

**Prerequisite:** Phase 4 approved.
**Findings covered:** M3, M10

> **Why this phase matters:** every one of the 30 findings existed in a repo where
> `lint`, `test`, and `build` were all green. 11 tests over 2 utility files is not
> a safety net. Without this phase, Phases 1–4 will decay.

---

## T5.1 — Build the test foundation `[M3]`

Current state: `lib/logger.test.ts` (3 tests) + `lib/security.test.ts` (8 tests).
Zero coverage of auth, billing, ownership scoping, rate limiting, or any of the
~70 routes.

**Setup first:**
- Add `@vitest/coverage-v8`; enable coverage in `vitest.config.ts`
- Establish a Supabase mock/fixture helper (`test/helpers/`) so route tests don't
  need a live DB — most routes take `createClient()` or `createServiceClient()`,
  so a module mock is the practical seam
- Add a `test:coverage` script

**Target coverage, in priority order:**

| Area | What to assert |
|------|----------------|
| **Ownership scoping** | For every route touching a user-owned table: a request from user B cannot read or write user A's row. This is the test that would have caught H5. |
| **Auth guards** | `guardCron` / `guardEvolutionWebhook` / Telegram secret: unset → 503, wrong → 401, right → pass |
| **Mass assignment** | `PATCH /api/webhooks` with `{user_id: other}` does not change `user_id`. Same for every route fixed in T1.2. |
| **Rate limiting** | boundary (Nth ok, N+1th 429), `Retry-After` present, limiter error fails open |
| **SSRF** | every bypass from the T1.5 table, plus the redirect case |
| **Billing** | idempotency (double run charges once), balance math, `credit_transactions` written, `past_due` transition |
| **Quota atomicity** | 20 concurrent against a limit of 10 → exactly 10 succeed |
| **Campaign worker** | claim safety, resume after kill, quiet-hour scheduling, completion condition |
| **Timezone** | day/month boundaries and quiet hours correct for `Africa/Cairo` |

**Set a coverage floor in CI** — pick a realistic number based on what you
actually achieve (don't set 90% and then exclude half the repo). Fail the build
below it. State the number and the reasoning in your report.

---

## T5.2 — Deduplicate the API-key auth helper `[M10]`

`authAndInstance()` is copy-pasted **verbatim** into five files:

```
app/api/presence/route.ts          app/api/mark-read/route.ts
app/api/groups/route.ts            app/api/groups/participants/route.ts
app/api/contacts/route.ts
```

Every fix — the rate limiting from T1.4, any future auth change — has to be
applied five times, and one will get missed.

Extract to `lib/auth/api-key.ts`:

```ts
export type ApiKeyAuthResult =
  | { ok: true; userId: string; instance: {...}; db: SupabaseClient }
  | { ok: false; status: number; error: string }

export async function authenticateApiKey(
  req: NextRequest,
  opts?: { instanceId?: string; requireConnected?: boolean },
): Promise<ApiKeyAuthResult>
```

Fold in the near-identical logic from `/api/send` and `/api/media` too. Behaviour
must be **identical** — this is a pure extraction. Test it once, properly.

---

## T5.3 — Unify the two `requireAdmin` implementations `[M10]`

Two functions, same name, different contracts:

| File | Returns | Used by |
|------|---------|---------|
| `lib/admin.ts:16` | `{ok, userId, role}` result object | API routes |
| `lib/auth/guards.ts:93` | `CurrentUser`, `redirect()`s on failure | Server Components |

Both are legitimate (routes return JSON, components redirect) but the shared name
invites importing the wrong one — which in a route would throw a redirect instead
of returning 403.

- Rename to make intent unmistakable: `requireAdminApi()` / `requireAdminPage()`
- Have both delegate to one shared authorization check so the *rules* live in one
  place even though the *failure modes* differ
- Update all call sites; verify with grep that none are missed

Also reconcile: `lib/admin.ts` treats `super_admin` as admin; check
`config/permissions.ts` `normalizeRole()` agrees, and that role checks are
consistent across `middleware`, `guards`, and `admin`.

---

## T5.4 — Structured logging and error handling audit

`lib/logger.ts` exists and is used in some routes. Many others swallow errors:

```bash
grep -rn "catch {}" app lib
grep -rn "catch { /\* " app lib
grep -rn "\.catch(() => {})" app lib
```

For each hit, decide: genuinely best-effort (fine — but add a comment saying so
and log at `debug`), or a real failure being hidden (log it at `warn`/`error`).

**Never log:** API keys, `key_hash`, service-role key, Telegram tokens, message
bodies, phone numbers. Check what currently reaches the logs — `logger.warn` in
`lib/rate-limit/index.ts` already anonymizes identifiers; hold everything else to
that standard.

Ensure every route has a top-level error boundary returning a sanitized message —
several currently return `(e as Error).message` straight to the client
(`/api/send:264`, `/api/media:76`, `/api/presence:39`), which can leak internal
detail from Evolution.

---

## T5.5 — Update project documentation

- `PROJECT_MEMORY/PROJECT_STATE.md` — reflect reality after Phases 0–5
- `PROJECT_MEMORY/SECURITY.md` — document every control added in Phase 1 and the
  residual risks explicitly accepted (e.g. DNS rebinding TOCTOU, `unsafe-inline`)
- `PROJECT_MEMORY/CHANGELOG.md` — one entry per phase
- `PROJECT_MEMORY/NEXT_SESSION.md` — currently claims the repo is deployment-ready
  and lists "setup live DB" as the next step. Rewrite it to match the real state.
- `docs/OBSERVABILITY.md` — update for the new logging

Delete or clearly mark as superseded any PROJECT_MEMORY doc that now contradicts
the code. Stale docs that assert "production ready" are worse than no docs.

---

## Definition of Done

- [ ] Coverage tooling in place; floor enforced in CI; number justified
- [ ] Ownership-scoping tests exist for every user-data route
- [ ] Every Phase 1–4 fix has a regression test
- [ ] `authenticateApiKey()` extracted; 5 duplicates gone; behaviour identical
- [ ] `requireAdminApi()` / `requireAdminPage()`; all call sites updated
- [ ] Silent `catch` blocks audited; no secrets or PII in logs
- [ ] No raw internal error strings returned to clients
- [ ] PROJECT_MEMORY docs match reality
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` · `pnpm typecheck` PASS
- [ ] `reports/PHASE-5-REPORT.md` written
