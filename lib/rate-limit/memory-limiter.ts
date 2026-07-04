// In-memory fixed-window rate limiter.
//
// This is the only implementation we ship in this PR. When we eventually
// need a shared backend (Redis / Upstash), we will extract an interface
// from this concrete class at that point — not before.
//
// Semantics per Vercel serverless instance: the counter map lives on the
// module scope of a warm function. Cold starts recycle the map. In
// practice this means the effective limit is
//   max * number_of_warm_instances
// for a given key. Acceptable for the workload profile: a single misbehaving
// caller sticks to one warm instance and gets throttled by that instance's
// counter; legitimate distributed traffic is well below the limit anyway.
//
// No timers, no background cleanup, no LRU. Cleanup is purely lazy: an
// expired entry is overwritten on the next hit for that key.

export type RateLimitDecision =
  | { ok: true; limit: number; remaining: number; resetAt: number }
  | { ok: false; limit: number; retryAfterMs: number; resetAt: number }

type Entry = { count: number; resetAt: number }

export class MemoryRateLimiter {
  private store = new Map<string, Entry>()

  hit(key: string, windowMs: number, max: number): RateLimitDecision {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now >= entry.resetAt) {
      // Fresh window (either first hit or the previous window elapsed).
      const resetAt = now + windowMs
      this.store.set(key, { count: 1, resetAt })
      return { ok: true, limit: max, remaining: max - 1, resetAt }
    }

    if (entry.count < max) {
      entry.count += 1
      return {
        ok: true,
        limit: max,
        remaining: max - entry.count,
        resetAt: entry.resetAt,
      }
    }

    return {
      ok: false,
      limit: max,
      retryAfterMs: entry.resetAt - now,
      resetAt: entry.resetAt,
    }
  }
}

// Single shared instance. Route handlers import `limiter` directly.
export const limiter = new MemoryRateLimiter()
