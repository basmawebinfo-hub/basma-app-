// ESLint 9 flat configuration for Basma.
//
// Scope: quality gate for TypeScript / TSX source. Invoked via `pnpm lint`
// locally and in CI (PR-B0c). Not invoked at build time — `next build`
// on Next 16 does NOT run ESLint by default (that changed in Next 15).
//
// Design principles:
//   - Conservative rule set. Ship the discipline we already have.
//   - Warnings for hygienic improvements; errors only for rules that
//     guard a real invariant (no-console).
//   - Allowlists documented inline. Every allowlist is a decision, not a hack.
//
// Related documents:
//   - docs/OBSERVABILITY.md — explains the logger discipline this config enforces.
//   - architecture/adr/README.md — see ADR pattern for future rule additions.

import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

export default [
  // Base: Next.js 16 flat config. eslint-config-next 16+ exports a native
  // flat config array — we spread it directly. No FlatCompat wrapper needed
  // (wrapping a flat config in FlatCompat creates circular refs at runtime).
  ...nextCoreWebVitals,

  // Downgrades: rules from the Next.js 16 preset that fire against
  // pre-existing code we haven't refactored yet. Keep as `warn` so they
  // surface in CI output without failing the gate. To be re-enabled at
  // `error` in a follow-up milestone once the codebase is cleaned up.
  // These are unrelated to PR-B0b's scope (ESLint setup + logger discipline).
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },

  // Structured-logging discipline. Established by PR #5a: every stdout log line
  // in Basma must go through `lib/logger.ts`. Direct `console.*` calls in
  // application code are a discipline regression and MUST fail lint.
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    rules: {
      "no-console": "error",
    },
  },

  // Allowlist: lib/logger.ts is the logger. It emits stdout via `console.log`,
  // `console.warn`, and `console.error`. This is by design — the logger is
  // the ONE file authorized to touch console directly. Any other file that
  // needs to write to stdout must import `{ logger }` from "@/lib/logger"
  // instead.
  {
    files: ["lib/logger.ts"],
    rules: {
      "no-console": "off",
    },
  },

  // TEMPORARY allowlist (FOLLOW-UP CLEANUP PR):
  // `app/api/campaigns/[id]/run/route.ts` contains an inline
  // `.catch(console.error)` from before PR #5a. Removing it correctly
  // requires a small refactor (proper error boundary + logger call) that
  // is out of scope for PR-B0b (ESLint infrastructure setup). Tracked as
  // a follow-up cleanup PR after PR-B0b merges. Do NOT extend this
  // allowlist to any other file — every new file that needs to write to
  // stdout must use `lib/logger.ts` from day one.
  //
  // Note: pattern uses `**` in the `[id]` position because ESLint's flat-config
  // matcher parses square brackets as a character class. `**` is narrow enough
  // here — there is exactly one route at `app/api/campaigns/*/run/route.ts`.
  {
    files: ["app/api/campaigns/**/run/route.ts"],
    rules: {
      "no-console": "off",
    },
  },

  // Ignore build outputs, dependency trees, static assets, and generated files.
  // `components/ui/**` is shadcn-vendored code copied from an external source;
  // linting it would flag issues we don't own and can't fix without diverging
  // from upstream.
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "next-env.d.ts",
      "components/ui/**",
    ],
  },
]
