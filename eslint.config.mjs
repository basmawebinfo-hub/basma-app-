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

  // Downgrades: two rules that are GENUINELY NEW in eslint-plugin-react-hooks
  // v6/v7 (shipped bundled with eslint-config-next 16). These rules did not
  // exist in the react-hooks 4.x/5.x line that Next 15 pinned. They fire
  // against pre-existing Basma code that predates any lint gate. Keep as
  // `warn` so they surface in CI output for follow-up cleanup without
  // failing the gate today.
  //
  // Only NEW-in-Next-16 rules are downgraded here — long-standing rules
  // like `no-html-link-for-pages` and `no-unescaped-entities` are left at
  // their preset severity ('error'). The two source-code violations they
  // surfaced were fixed in this same PR.
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
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
