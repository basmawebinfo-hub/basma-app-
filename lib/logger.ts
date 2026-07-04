// Structured JSON logger — the single source of truth for stdout logging.
//
// All logs across the app should go through this module. No `console.log`,
// `console.warn`, or `console.error` calls should exist elsewhere unless
// there is a clear technical reason (e.g. code samples rendered to users).
//
// Every emitted line is a single JSON object on one line, so Vercel Logs,
// external log aggregators, and future error-monitoring integrations can
// parse it directly.
//
// Fixed event names ensure log lines are queryable. Add a new event name
// to LogEvent below before using it — never pass an arbitrary string.

/**
 * Fixed set of log event names. Adding a new event? Extend this list
 * intentionally — don't invent arbitrary strings at call sites.
 */
export type LogEvent =
  // Rate limiter
  | "rate_limit_hit"
  | "rate_limit_error"
  // API surface
  | "api_error"
  | "auth_failure"
  // App-wide
  | "unexpected_exception"
  // Webhooks and integrations
  | "webhook_error"
  | "instance_webhook_setup_failure"
  // Plan / subscription resolution
  | "plan_tier_missing"

type Primitive = string | number | boolean | null | undefined
type LogFields = Record<string, Primitive>

type LogLevel = "info" | "warn" | "error"

/**
 * Sensitive field names we always redact if they somehow end up in a log
 * fields object. Defence-in-depth alongside handler-side scrubbing.
 */
const REDACTED_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "api_key",
  "apikey",
  "access_token",
  "refresh_token",
  "password",
  "secret",
])

function scrub(fields: LogFields): LogFields {
  const out: LogFields = {}
  for (const [k, v] of Object.entries(fields)) {
    if (REDACTED_KEYS.has(k.toLowerCase())) {
      out[k] = "[redacted]"
    } else {
      out[k] = v
    }
  }
  return out
}

function emit(level: LogLevel, event: LogEvent, fields: LogFields = {}) {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...scrub(fields),
  }
  const line = JSON.stringify(payload)
  if (level === "error") console.error(line)
  else if (level === "warn") console.warn(line)
  else console.log(line)
}

export const logger = {
  info: (event: LogEvent, fields?: LogFields) => emit("info", event, fields),
  warn: (event: LogEvent, fields?: LogFields) => emit("warn", event, fields),
  error: (event: LogEvent, fields?: LogFields) => emit("error", event, fields),
}
