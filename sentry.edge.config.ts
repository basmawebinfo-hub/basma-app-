// Sentry Edge runtime initialization (used by middleware.ts and edge routes).
//
// Loaded from instrumentation.ts on edge worker cold-start. DSN-gated:
// no DSN = no-op. Error monitoring ONLY.

import * as Sentry from "@sentry/nextjs"

const dsn = process.env.SENTRY_DSN

if (dsn) {
  try {
    Sentry.init({
      dsn,
      environment: process.env.VERCEL_ENV ?? "development",
      tracesSampleRate: 0,

      beforeSend(event) {
        if (event.request?.headers) {
          const h = event.request.headers as Record<string, string>
          for (const key of [
            "authorization", "Authorization",
            "cookie", "Cookie", "set-cookie",
            "x-api-key", "X-Api-Key",
          ]) {
            delete h[key]
          }
        }
        if (event.user) {
          delete event.user.email
          delete event.user.ip_address
          delete event.user.username
        }
        return event
      },
    })
  } catch {
    // Never break the app because Sentry failed to initialize.
  }
}
