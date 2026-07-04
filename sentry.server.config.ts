// Sentry server SDK initialization (Node runtime).
//
// Loaded from instrumentation.ts on server startup. DSN-gated: no DSN =
// no-op. Error monitoring ONLY.

import * as Sentry from "@sentry/nextjs"

const dsn = process.env.SENTRY_DSN

if (dsn) {
  try {
    Sentry.init({
      dsn,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",

      tracesSampleRate: 0,
      profilesSampleRate: 0,

      ignoreErrors: [
        "Non-Error promise rejection captured",
      ],

      beforeSend(event) {
        // Strip sensitive request headers.
        if (event.request?.headers) {
          const h = event.request.headers as Record<string, string>
          for (const key of [
            "authorization", "Authorization",
            "cookie", "Cookie", "set-cookie",
            "x-api-key", "X-Api-Key",
            "x-webhook-key",
            "x-evolution-signature",
          ]) {
            delete h[key]
          }
        }
        // Strip sensitive query parameters.
        if (event.request?.query_string && typeof event.request.query_string === "string") {
          event.request.query_string = event.request.query_string
            .split("&")
            .filter((p) => !/^(access_token|refresh_token|token|password|secret|key)=/i.test(p))
            .join("&")
        }
        // Strip PII from the user object.
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
