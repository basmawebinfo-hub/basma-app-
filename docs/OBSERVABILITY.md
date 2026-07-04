# Observability — Sentry + Structured Logging

Basma's observability layer has two components:

1. **Structured JSON logger** (`lib/logger.ts`) — always active, no dependencies.
2. **Sentry error monitoring** — optional, activated by setting `SENTRY_DSN`.

This document explains how to enable, configure, and read outputs from both.

---

## Structured JSON logger

### What it does

Emits every log line as a single JSON object on one line, so Vercel Logs
parses each field as a queryable column.

Example output:

```json
{"level":"warn","event":"rate_limit_hit","timestamp":"2026-07-04T14:22:31.412Z","endpoint":"pricing","identifier":"3a9f2d1e0c4b","request_id":"9c1e2a1f-...","limit":60,"resetAt":1783183309859}
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

## Sentry

### What it does

Captures uncaught server + client errors, edge-runtime exceptions, and
errors surfaced from the app's 3 error boundaries. **Error monitoring only.**
No performance tracing, no session replay, no profiling.

### How to enable

Sentry is entirely gated by the `SENTRY_DSN` environment variable. If it
is not set, `Sentry.init` never runs and every `Sentry.*` call in the
codebase is a no-op. This means:

- Local dev / preview: Sentry is OFF unless you explicitly set the env var.
- Production without Sentry: works exactly as before.
- Production with Sentry: errors flow to your Sentry project.

### Required environment variables

| Variable | Where | Purpose |
|---|---|---|
| `SENTRY_DSN` | Vercel Production | Enables server-side + edge-runtime capture |
| `NEXT_PUBLIC_SENTRY_DSN` | Vercel Production | Enables browser capture. Owner can use the same DSN or a separate one. |
| `NEXT_PUBLIC_VERCEL_ENV` | Vercel (automatic) | Reported as `environment` in Sentry |

If any of these are missing, the build does not fail and the app keeps
working.

### Source-map upload (deferred)

This PR does not wire up `withSentryConfig` in `next.config.mjs`, so Sentry
Issues will display minified stack traces until source-map upload is
enabled. When you want readable stack traces, a follow-up PR should:

1. Wrap `nextConfig` with `withSentryConfig` in `next.config.mjs`.
2. Add `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` to Vercel env.

This is a small, low-risk change that can ship after the initial Sentry
setup has been running cleanly for a few days.

### How to disable at runtime

Unset `SENTRY_DSN` (and `NEXT_PUBLIC_SENTRY_DSN`) in Vercel and redeploy.
Sentry becomes a no-op immediately. No code change or PR required.

### PII stripping

Sentry events are cleaned in the `beforeSend` hook of each config file
before leaving the process:

- Request headers: `Authorization`, `Cookie`, `Set-Cookie`, `X-Api-Key`,
  `X-Webhook-Key`, `X-Evolution-Signature` — all deleted.
- Query string parameters: `access_token`, `refresh_token`, `token`,
  `password`, `secret`, `key` — dropped from the recorded URL.
- User object: `email`, `ip_address`, `username` — deleted.

If you introduce a new sensitive parameter, add it to the `beforeSend`
filters in the 3 sentry.*.config.ts files.

### What NOT to expect from this setup

- No performance tracing. `tracesSampleRate: 0` everywhere.
- No session replay. Both replay sample rates are `0`.
- No user profiling.
- No auto-instrumentation of database queries.

If you need any of these, plan them as a separate PR with an explicit
budget discussion — they cost Sentry quota + client-bundle bytes.

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

**Sentry Issues**: each error boundary hit or uncaught exception creates
an Issue with the correlation ID as a tag (`request_id`). Search by tag
to jump between Vercel Logs and Sentry for the same request.

---

## Adding a new log event

1. Add the new event name to `LogEvent` in `lib/logger.ts`.
2. Call `logger.info/warn/error("my_new_event", { ...fields, request_id })`
   at the site.
3. If the event is a caught error that should also reach Sentry, call
   `Sentry.captureException(err)` next to the log line.
