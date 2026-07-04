// Correlation / Request ID helpers.
//
// Every log line and every Sentry event should carry a request_id that ties
// together all activity for a single HTTP request. This lets us search Vercel
// Logs and Sentry Issues by the same ID and see the full request timeline.
//
// Strategy:
//   - Prefer an inbound `x-request-id` header if the caller (or upstream
//     proxy) already set one. Vercel does not currently set this header by
//     default, so most requests will hit the fallback below.
//   - Otherwise generate a fresh UUID.
//   - We do NOT keep this in AsyncLocalStorage or globals — it is passed
//     explicitly to logger calls as a field. Explicit is safer than
//     implicit; no leak across concurrent requests.

import type { NextRequest } from "next/server"
import crypto from "crypto"

/**
 * Extract or generate a request-scoped correlation ID. Safe to call once
 * per request handler; pass the returned string as `request_id` in any
 * subsequent logger.* or Sentry.setTag calls for that request.
 */
export function extractOrCreateRequestId(req: NextRequest): string {
  const existing = req.headers.get("x-request-id")
  if (existing && existing.trim().length > 0 && existing.length <= 128) {
    return existing.trim()
  }
  return crypto.randomUUID()
}
