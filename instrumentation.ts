// Next.js instrumentation hook.
//
// Runs once per runtime start. We use it to import the appropriate Sentry
// config file for the runtime we are in. Sentry's init is DSN-gated inside
// each config file, so this is safe to load even when Sentry is disabled.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  } else if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config")
  }
}
