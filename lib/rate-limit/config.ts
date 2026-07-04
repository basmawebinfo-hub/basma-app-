// Rate-limit configuration for Basma API endpoints.
//
// This file is the single source of truth for rate-limit configuration.
// All environment-variable reads happen here — no other file in
// lib/rate-limit/ or in the route handlers reads process.env directly.
//
// Add a new rate-limit target by extending RATE_LIMITS below. Do not
// duplicate config in individual route files.

export type RateLimitConfig = {
  windowMs: number
  max: number
}

function readEnvNumber(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) return fallback
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function readEnvBool(name: string): boolean {
  const raw = process.env[name]
  if (!raw) return false
  return raw === "1" || raw.toLowerCase() === "true"
}

// Runtime kill-switch. Setting BASMA_RATE_LIMIT_DISABLED=1 makes every
// call to the limiter succeed without ceremony. Useful for incident
// response when we need to disable this quickly without a redeploy.
export const RATE_LIMIT_DISABLED = readEnvBool("BASMA_RATE_LIMIT_DISABLED")

// Per-endpoint configuration. Numbers are conservative for legitimate
// traffic and immediately stop abuse patterns.
export const RATE_LIMITS = {
  send: {
    windowMs: readEnvNumber("BASMA_RATE_LIMIT_SEND_WINDOW_MS", 60_000),
    max: readEnvNumber("BASMA_RATE_LIMIT_SEND_MAX", 30),
  },
  ping: {
    windowMs: readEnvNumber("BASMA_RATE_LIMIT_PING_WINDOW_MS", 60_000),
    max: readEnvNumber("BASMA_RATE_LIMIT_PING_MAX", 60),
  },
  planRequest: {
    windowMs: readEnvNumber("BASMA_RATE_LIMIT_PLAN_REQUEST_WINDOW_MS", 60_000),
    max: readEnvNumber("BASMA_RATE_LIMIT_PLAN_REQUEST_MAX", 10),
  },
  pricing: {
    windowMs: readEnvNumber("BASMA_RATE_LIMIT_PRICING_WINDOW_MS", 60_000),
    max: readEnvNumber("BASMA_RATE_LIMIT_PRICING_MAX", 60),
  },
} as const

export type RateLimitTarget = keyof typeof RATE_LIMITS
