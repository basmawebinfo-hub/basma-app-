# Observability — Structured Logging

Basma's observability layer currently has one component: a structured JSON
logger (`lib/logger.ts`). It is the single source of truth for stdout
logging across the codebase.

A Sentry error-monitoring layer is planned as a separate follow-up PR
(see the "Future work" section at the bottom).

---

## Structured JSON logger

### What it does

Emits every log line as a single JSON object on one line, so Vercel Logs
parses each field as a queryable column.

Example output:

```json
{"level":"warn","event":"rate_limit_hit","timestamp":"2026-07-04T14:22:31.412Z","endpoint":"pricing","identifier":"3a9f2d1e0c4b","limit":60,"resetAt":1783183309859}
```

Every line contains:

- `level` — `info` | `warn` | `error`
- `event` — one of the fixed event names in `lib/logger.ts::LogEvent`.
  New event names must be added to that union before use.
- `timestamp` — ISO 8601, added automatically.
- `request_id` — correlation ID (when the caller passes it).
- Additional custom fields per event.

### Where to use it

Anywhere you would otherwise call `console.log/warn/error`. Direct
`console.*` calls are disallowed outside `lib/logger.ts` unless there is
a clear technical reason (e.g. code samples rendered to users in the
Quick Start UI).

```ts
import { logger } from "@/lib/logger"

logger.info("api_error", {
  route: "/api/me",
  request_id: reqId,
  status: 503,
})
```

### Fixed event names (as of this PR)

Add new events to `LogEvent` in `lib/logger.ts` before using them.

| Event | Meaning |
|---|---|
| `rate_limit_hit` | Request blocked by rate limiter |
| `rate_limit_error` | Exception inside the limiter (failed open) |
| `api_error` | Route handler returned a >=500 error |
| `auth_failure` | Auth/authorization check rejected the request |
| `unexpected_exception` | Caught error boundary triggered |
| `webhook_error` | Inbound webhook handler failed |
| `instance_webhook_setup_failure` | Outbound Evolution webhook setup failed |
| `plan_tier_missing` | Plan resolution fell back to default tier |

### Sensitive-field redaction

`logger.*` automatically replaces the value of any known-sensitive field key
with `[redacted]`:

```
authorization, cookie, set-cookie, x-api-key, api_key, apikey,
access_token, refresh_token, password, secret
```

Never log raw API keys, user IDs, IP addresses, or bearer tokens directly.
Use a hash / SHA-256 prefix instead (see `lib/rate-limit/index.ts` for the
`anonymize()` helper).

---

## Correlation IDs

Every route handler that logs anything should extract a request ID first
and include it as `request_id` in log fields:

```ts
import { extractOrCreateRequestId } from "@/lib/request-id"
import { logger } from "@/lib/logger"

export async function POST(req: NextRequest) {
  const requestId = extractOrCreateRequestId(req)
  try {
    // ... work ...
  } catch (err) {
    logger.error("api_error", {
      route: "/api/example",
      request_id: requestId,
      error: (err as Error).message,
    })
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
```

The ID is either taken from an inbound `x-request-id` header (if any
upstream proxy set one) or generated fresh via `crypto.randomUUID()`.

---

## Reading the logs

**Vercel Logs**: each JSON line is parsed automatically. Filter by
`event:"rate_limit_hit"` or `level:"error"` in the log search UI.

---

## Adding a new log event

1. Add the new event name to `LogEvent` in `lib/logger.ts`.
2. Call `logger.info/warn/error("my_new_event", { ...fields, request_id })`
   at the site.

---

## Future work

A separate PR (currently planned as PR #5b) will add Sentry error
monitoring on top of this logger. That PR will:

- Add `@sentry/nextjs` v10.
- Add `instrumentation-client.ts`, `sentry.server.config.ts`,
  `sentry.edge.config.ts`, `instrumentation.ts` per the Sentry v10 docs
  for Next.js 16 + Turbopack.
- Wire `Sentry.captureException(err)` into the three error boundaries
  and every route handler that currently emits `logger.error(...)`.
- Configure `beforeSend` hooks to strip the same sensitive headers and
  PII fields already redacted by the logger.
- Stay fully optional (DSN-gated) — no `SENTRY_DSN` means no capture.

The logger's structure (fixed events, correlation IDs, redaction) makes
that PR straightforward: it will be additive only, no changes to the
event names or field shapes emitted here.
