/// <reference types="vitest" />
import { defineConfig } from "vitest/config"

// Vitest configuration for Basma.
//
// Scope: unit tests for pure functions and utilities. Not for React
// components or hooks (that would require jsdom + @testing-library/react —
// deferred until we actually need to test a component).
//
// Environment: `node` — smallest possible. Vitest's default is `node`
// but we set it explicitly so future readers know it's a decision, not
// an accident.

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
})
