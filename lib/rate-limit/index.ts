// Public entry point for the rate-limit utility.
//
// Route handlers call `enforceRateLimit()` once per protected endpoint.
// The function returns:
//   - null: request is allowed. The route continues normally. Standard
//     RateLimit-* headers are attached to `outHeaders` (mutated in place)
//     so the route can propagate them onto its own success response.
//   - Response: request is blocked. The route MUST return this Response
//     verbatim — it already carries the correct 429 status, JSON body,
//     Retry-After header, RateLimit-* headers, and any CORS headers the
//     caller passed in.
//
// Fail-open: if the limiter throws for any reason (memory corruption,
// programming bug, whatever), we log a warning and return null so
// the request proceeds. Rate-limiting is a defence layer, not a hard
// dependency of the API.

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import crypto from "crypto"

import { RATE_LIMIT_DISABLED, RATE_LIMITS, type RateLimitTarget } from "./config"
import { limiter } from "./memory-limiter"
import { logger } from "@/lib/logger"

export { extractClientIp } from "./identifier"

/**
 * Hash a raw identifier (IP, API key, user id) for safe inclusion in
 * logs. We never write the raw value to stdout.
 */
function anonymize(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 12)
}

function attachHeaders(
  headers: Record<string, string>,
  info: { limit: number; remaining: number; resetAt: number }
): void {
  headers["RateLimit-Limit"] = String(info.limit)
  headers["RateLimit-Remaining"] = String(Math.max(0, info.remaining))
  // draft-ietf-httpapi-ratelimit-headers uses seconds-until-reset.
  const secondsUntilReset = Math.max(0, Math.ceil((info.resetAt - Date.now()) / 1000))
  headers["RateLimit-Reset"] = String(secondsUntilReset)
}

/**
 * Enforce a rate-limit for the given endpoint and identifier.
 *
 * @param target The endpoint config key (must match a RATE_LIMITS entry).
 * @param identifier A caller-derived key (already hashed if it was
 *   sensitive — e.g. the SHA-256 of an API key). The limiter treats it
 *   as an opaque string.
 * @param req The incoming request (used for logging metadata only).
 * @param outHeaders A mutable headers object. On an allowed request,
 *   RateLimit-* headers are added so the caller can spread them onto
 *   the success response. On a blocked request, the returned Response
 *   already has the headers baked in.
 * @param corsHeaders Optional CORS headers to preserve on the 429 body.
 */
export function enforceRateLimit(
  target: RateLimitTarget,
  identifier: string,
  req: NextRequest,
  outHeaders: Record<string, string>,
  corsHeaders?: Record<string, string>
): Response | null {
  if (RATE_LIMIT_DISABLED) return null

  const cfg = RATE_LIMITS[target]
  let decision: ReturnType<typeof limiter.hit>

  try {
    decision = limiter.hit(`${target}:${identifier}`, cfg.windowMs, cfg.max)
  } catch (err) {
    // Fail open. The limiter must never take down the API.
    logger.warn("rate_limit_error", {
      endpoint: target,
      identifier: anonymize(identifier),
      message: (err instanceof Error ? err.message : String(err)).slice(0, 200),
    })
    return null
  }

  if (decision.ok) {
    attachHeaders(outHeaders, decision)
    return null
  }

  // Blocked. Emit one JSON warning line with anonymized identifier only.
  logger.warn("rate_limit_hit", {
    endpoint: target,
    identifier: anonymize(identifier),
    limit: decision.limit,
    resetAt: decision.resetAt,
  })

  const retryAfterSeconds = Math.max(1, Math.ceil(decision.retryAfterMs / 1000))
  const headers: Record<string, string> = { ...(corsHeaders ?? {}) }
  attachHeaders(headers, {
    limit: decision.limit,
    remaining: 0,
    resetAt: decision.resetAt,
  })
  headers["Retry-After"] = String(retryAfterSeconds)

  return NextResponse.json(
    {
      error: "Too many requests",
      retryAfterMs: decision.retryAfterMs,
      resetAt: decision.resetAt,
    },
    { status: 429, headers }
  )
}
