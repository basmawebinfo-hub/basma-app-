// Sentry client SDK initialization.
//
// This file is loaded automatically by @sentry/nextjs at browser startup.
// It ONLY does anything if NEXT_PUBLIC_SENTRY_DSN is set. Absent DSN =
// silent no-op — Sentry.init never runs, all Sentry.* calls become no-ops.
//
// Error monitoring ONLY: no performance tracing, no session replay,
// no profiling.

import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  try {
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",

      // Error monitoring only. Explicit zeros so a future dependency bump
      // that flips defaults cannot silently enable expensive features.
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,

      // Common browser noise we do not want to track.
      ignoreErrors: [
        "ResizeObserver loop limit exceeded",
        "ResizeObserver loop completed with undelivered notifications",
        "Non-Error promise rejection captured",
        "Load failed",
      ],

      beforeSend(event) {
        // Strip sensitive request headers if the framework attached any.
        if (event.request?.headers) {
          const h = event.request.headers as Record<string, string>
          delete h["authorization"]
          delete h["Authorization"]
          delete h["cookie"]
          delete h["Cookie"]
          delete h["set-cookie"]
          delete h["x-api-key"]
          delete h["X-Api-Key"]
        }
        // Strip cookies from the URL query if any.
        if (event.request?.query_string && typeof event.request.query_string === "string") {
          event.request.query_string = event.request.query_string
            .split("&")
            .filter((p) => !/^(access_token|refresh_token|token|password|secret)=/i.test(p))
            .join("&")
        }
        // Never send user identifying data.
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
