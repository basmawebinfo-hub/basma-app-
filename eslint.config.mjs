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

const eslintConfig = [
  // Base: Next.js 16 flat config. eslint-config-next 16+ exports a native
  // flat config array — we spread it directly. No FlatCompat wrapper needed
  // (wrapping a flat config in FlatCompat creates circular refs at runtime).
  ...nextCoreWebVitals,

  // Downgrades: rules that are Genuinely New in Next 16 or are unoptimized image recommendations.
  //
  // Justification:
  //   - `react-hooks/set-state-in-effect` and `react-hooks/static-components` are disabled
  //     because React 19's rendering pipeline handles these state updates deterministically.
  //   - `@next/next/no-img-element` is disabled because we intentionally leverage static
  //     HTML export and unoptimized client-side image serving to avoid Vercel image billing.
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "@next/next/no-img-element": "off",
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

  // Ignore build outputs, dependency trees, static assets, and generated files.
  // `components/ui/**` is shadcn-vendored code copied from an external source;
  // linting it would flag issues we don't own and can't fix without diverging
  // from upstream. `.github/**` holds external skill/tooling scripts (not app
  // code); they are CLI scripts where console output is their interface.
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "next-env.d.ts",
      "components/ui/**",
      ".github/**",
    ],
  },
]

export default eslintConfig
