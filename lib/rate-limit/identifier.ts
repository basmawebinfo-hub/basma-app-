// Single helper for extracting a stable client identifier per request.
//
// Route handlers call this instead of reading `x-forwarded-for` directly,
// so that if our extraction strategy changes (Vercel adds a new header,
// we move to Cloudflare, we add proxy trust rules, etc.), we update it
// in exactly one place.

import type { NextRequest } from "next/server"

/**
 * Extract the caller's IP address as best we can.
 *
 * Precedence:
 *   1. First non-empty entry of `x-forwarded-for` (Vercel sets this on
 *      every request; leftmost is the original client).
 *   2. `x-real-ip` (present on some proxy configurations).
 *   3. `"unknown"` fallback so we never throw and the caller always gets
 *      a stable string.
 */
export function extractClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) {
    const first = xff.split(",")[0]?.trim()
    if (first) return first
  }
  const xri = req.headers.get("x-real-ip")
  if (xri && xri.trim()) return xri.trim()
  return "unknown"
}
