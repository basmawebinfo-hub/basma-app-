# KIMI_TASKS — Execution Workspace

> **You are Kimi K3, the implementer on this project.**
> Claude (Opus) is the reviewer/manager. Claude finds the problems and writes the
> phase specs. You implement them. Claude reviews your work after each phase.

---

## The Loop

```
Claude writes PHASE-N.md  →  Kimi implements  →  Kimi writes reports/PHASE-N-REPORT.md
        ↑                                                        │
        └──────────  Claude reviews & approves/rejects  ←────────┘
```

---

## Rules for Kimi — read before touching any file

1. **One phase at a time.** Open `phases/PHASE-N.md`, do every task in it, stop.
   Do not start Phase N+1. Do not "helpfully" fix things from a later phase.

2. **Do not invent scope.** If a task says "add a length cap", add a length cap.
   Do not also refactor the surrounding function, rename variables, or reformat
   the file. Diff noise makes review impossible.

3. **Every task has an ID** (e.g. `C2`, `H7`). Reference the ID in your commit
   messages and in your report.

4. **Gates must pass before you report done:**
   ```bash
   pnpm lint
   ```
   ```bash
   pnpm test
   ```
   ```bash
   pnpm build
   ```
   All three green. If a task makes one of them fail and you cannot fix it,
   **stop and write it in the report** — do not disable the gate, do not add
   `eslint-disable`, do not set `ignoreBuildErrors: true`.

5. **Never weaken a security control to make something pass.** If a fix is
   blocked, say so.

6. **Do not commit or push.** Claude and the project owner handle git. Just
   leave the working tree with your changes in it.

7. **Do not touch these without an explicit task telling you to:**
   - `next.config.mjs` → `typescript.ignoreBuildErrors` (must stay `false`)
   - `.github/workflows/ci.yml` (Phase 0 only)
   - anything in `PROJECT_MEMORY/`
   - `KIMI_TASKS/phases/*.md` (specs are read-only to you)

8. **Ask, don't guess.** If a spec is ambiguous or you find that reality differs
   from what the spec assumes, write it in the report under
   `## Blocked / Needs Decision` and move to the next task.

---

## Writing your report

When a phase is done, create `reports/PHASE-N-REPORT.md` using this template:

```markdown
# Phase N — Implementation Report

## Gates
- pnpm lint:  PASS / FAIL
- pnpm test:  PASS / FAIL  (X tests)
- pnpm build: PASS / FAIL

## Tasks
| ID | Status | Files changed | Notes |
|----|--------|---------------|-------|
| C1 | done   | app/api/... :12-40 | ... |
| C2 | done   | ...           | ... |
| H3 | partial| ...           | see blockers |

## What I changed and why
(one short paragraph per task ID — what the code does now that it didn't before)

## Blocked / Needs Decision
(anything you could not do, with the reason. Empty section = write "None".)

## Things I noticed but did NOT touch
(out-of-scope issues you spotted. Do not fix them — just list them.)
```

Then tell the project owner: **"Phase N done"** so Claude can review.

---

## Project facts you need

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · shadcn/ui
- **Package manager:** `pnpm` (not npm, not yarn)
- **Product (after the pivot):** a static, content-driven site with two halves —
  an **academy** (the BASMA AI Automation Engineer Roadmap, 14 Arabic levels) and
  **agency services**. **No database, no auth, no API routes.**
- **UI language:** Arabic-first, RTL. Keep Arabic copy Arabic — do not translate
  or "clean up" Egyptian-dialect phrasing.
- **Design matters here.** This is a marketing + course site; visual quality is a
  product requirement, not polish. Don't degrade the existing look while working.

## Key files (post-Phase-A)

| Path | What it is |
|------|-----------|
| `app/page.tsx` | Home — composes the marketing components |
| `app/layout.tsx` | Root layout, metadata, JSON-LD, fonts (**fonts are stubbed — see D1**) |
| `components/*.tsx` | 15 marketing sections (hero, pricing, faq, …) |
| `components/ui/*` | ~50 shadcn primitives |
| `lib/i18n.tsx` | ar/en dictionary + provider |
| `config/navigation.ts`, `config/constants.ts` | Nav links + route constants |
| `next.config.mjs` | Security headers, CSP, image config |

Course content source (outside the repo):
`D:\Basma agancy\BasmaProgram` — level markdown, the roadmap PDF, logos.

---

## Current state (2026-08-08)

- `pnpm lint` · `typecheck` · `test` (11) · `build` — all green, verified
- Roadmap and known issues: **`STATUS.md`**
- `FINDINGS.md` = review of the *old* WhatsApp platform, kept for history only.
  Most of it is deleted along with the code it describes.
