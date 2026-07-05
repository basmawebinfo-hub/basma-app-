import { describe, it, expect, vi, afterEach } from "vitest"
import { logger } from "./logger"

// Verifies the structured logger from PR #5a redacts sensitive fields
// before emitting to stdout. The scrub() function is a defence-in-depth
// layer — even if a caller accidentally passes an "authorization" or
// "password" field, the emitted log line must not contain the raw value.
//
// This is a real invariant: it exists to protect against credential leaks
// in production logs (Vercel Logs, external aggregators, future Sentry
// integration). Regressions here would be a security bug.
//
// Test strategy: spy on the underlying console method the logger writes
// through (console.log for info, console.warn for warn, console.error for
// error), then parse the emitted JSON and assert the redaction happened.

describe("logger (scrub)", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("redacts common sensitive field names on info emit", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    logger.info("rate_limit_hit", {
      authorization: "Bearer sk-secret-key-1234",
      password: "hunter2",
      api_key: "abc123",
      route: "/api/campaigns",
    })

    expect(consoleSpy).toHaveBeenCalledOnce()
    const emitted = JSON.parse(consoleSpy.mock.calls[0][0] as string)

    // Sensitive fields must be redacted
    expect(emitted.authorization).toBe("[redacted]")
    expect(emitted.password).toBe("[redacted]")
    expect(emitted.api_key).toBe("[redacted]")

    // Non-sensitive fields pass through unchanged
    expect(emitted.route).toBe("/api/campaigns")

    // The raw values must NOT appear anywhere in the emitted string
    const raw = consoleSpy.mock.calls[0][0] as string
    expect(raw).not.toContain("Bearer sk-secret-key-1234")
    expect(raw).not.toContain("hunter2")
    expect(raw).not.toContain("abc123")
  })

  it("redacts sensitive fields regardless of casing", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    logger.warn("api_error", {
      Authorization: "Bearer x",
      COOKIE: "session=y",
      "Set-Cookie": "session=z",
    })

    const emitted = JSON.parse(consoleSpy.mock.calls[0][0] as string)
    expect(emitted.Authorization).toBe("[redacted]")
    expect(emitted.COOKIE).toBe("[redacted]")
    expect(emitted["Set-Cookie"]).toBe("[redacted]")
  })

  it("emits a well-formed JSON log line with level, event, and timestamp", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    logger.error("unexpected_exception", { boundary: "app/error" })

    const emitted = JSON.parse(consoleSpy.mock.calls[0][0] as string)
    expect(emitted.level).toBe("error")
    expect(emitted.event).toBe("unexpected_exception")
    expect(emitted.boundary).toBe("app/error")
    expect(typeof emitted.timestamp).toBe("string")
    // ISO 8601 shape
    expect(emitted.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })
})
