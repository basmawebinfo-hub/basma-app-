"use client"

/**
 * Root global error handler. This one fires when the app itself (including
 * the root layout / I18nProvider) fails to render. Because we may not have
 * access to any providers here, everything is pure JSX + inline styles.
 * English-only fallback — no i18n at this level.
 */

import { useEffect } from "react"
import { logger } from "@/lib/logger"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error("unexpected_exception", {
      boundary: "global-error",
      digest: error.digest ?? null,
      message: error.message.slice(0, 200),
    })
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "oklch(0.14 0.006 130)", color: "oklch(0.96 0.005 130)", minHeight: "100vh" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Application error
            </h1>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.71 0.01 130)", marginBottom: "1.5rem" }}>
              A critical error occurred. Please try again.
            </p>
            {error.digest && (
              <p style={{ fontSize: "0.6875rem", color: "oklch(0.71 0.01 130)", fontFamily: "monospace", marginBottom: "1.5rem" }}>
                Incident ID: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              style={{ padding: "0.625rem 1.25rem", borderRadius: "0.5rem", background: "oklch(0.855 0.218 126.3)", color: "oklch(0.17 0.02 130)", fontSize: "0.875rem", fontWeight: 500, border: "none", cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
