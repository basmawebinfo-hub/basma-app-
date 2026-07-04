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
//   - Zero allowlists except for the single technical exception below.
//
// Related documents:
//   - docs/OBSERVABILITY.md — explains the logger discipline this config enforces.
//   - architecture/adr/README.md — see ADR pattern for future rule additions.

import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat({
  baseDirectory: process.cwd(),
})

export default [
  // Base: Next.js 16 required rules (React Hooks, next/image, next/link, etc.).
  // eslint-config-next transitively brings in @typescript-eslint,
  // eslint-plugin-react, eslint-plugin-react-hooks, and jsx-a11y rules.
  ...compat.extends("next/core-web-vitals"),

  // Structured-logging discipline. Established by PR #5a: every stdout log line
  // in Basma must go through `lib/logger.ts`. Direct `console.*` calls in
  // application code are a discipline regression and MUST fail lint.
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    rules: {
      "no-console": "error",
    },
  },

  // Technical exception (single allowlist, documented):
  // `lib/logger.ts` IS the logger. It emits stdout via `console.log`,
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
