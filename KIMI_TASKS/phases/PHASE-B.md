# Phase B — Design System Foundation

**Goal:** rebuild the visual foundation properly, using Impeccable as the design
authority. Everything after this phase inherits these decisions, so getting them
right here is worth more than any amount of polish later.

**Prerequisite:** Phase A approved (site is fully static, nothing behind it).
**Read first:** `KIMI_TASKS/IMPECCABLE.md` — how you access the tooling, and the
brand palette extracted from the logo.

**Findings covered:** D1, D2, D4, D5 (from `STATUS.md`)

---

## Direction

Modern, dark, high-contrast — the visual register of **impeccable.style** itself.
Brand green `#ABE707` as a disciplined accent on near-black, white type.

**Do not redesign the page structure in this phase.** Same sections, same order,
same content. You are rebuilding the *system underneath* — type, color, spacing,
motion — so the same layout renders dramatically better. Structural redesign
comes later, once the foundation is trustworthy.

---

## T-B.0 — Baseline the damage

Before changing anything:

```bash
npx impeccable detect . > KIMI_TASKS/reports/impeccable-before.txt
```

Commit that file. Every later task is measured against it. Screenshot `/` at
desktop (1440), tablet (768), and mobile (375) widths too.

---

## T-B.1 — Fix the fonts `[D1]` 🔴 highest impact in this phase

`app/layout.tsx:11-13`:

```ts
const _ptMono = { variable: "font-mono" }
const _cairo  = { variable: "font-sans" }
const _rubik  = { variable: "font-sans" }
```

These are **empty objects pretending to be fonts.** No font is loaded. The whole
Arabic site renders in whatever the OS falls back to. This was done to make
offline builds work — the fix must not reintroduce that fragility.

**Do:**
- Self-host with `next/font/local`, woff2, files committed under `app/fonts/` or
  `public/fonts/`. **Not** `next/font/google` — that's what broke the build
  before and it adds a network dependency at build time.
- Pick an Arabic face that carries a modern, technical tone and has real weight
  coverage (400/500/700 minimum). **Cairo** and **IBM Plex Sans Arabic** are both
  strong, open-licensed candidates — evaluate both against real Arabic copy from
  the site, not lorem ipsum, and say which you chose and why.
- A Latin face for `BASMA`, English UI, and code. It must sit convincingly beside
  the Arabic at the same optical size.
- A mono for code blocks — level content has fenced workflow diagrams.
- `font-display: swap`, `preload` the weights actually used above the fold, and
  set real `--font-sans` / `--font-mono` CSS variables.

**Then** work through `reference/typeset.md` to build the type scale: sizes,
line-heights, weights, tracking. **Arabic needs more line-height than Latin at
the same size** — a Latin-tuned scale looks cramped and is a common giveaway.
Verify against actual level content from `BasmaProgram/Level-01-*.md`.

**Verify:** licence permits commercial embedding, and it's noted in the report.
`pnpm build` must pass with no network access.

---

## T-B.2 — Build the color system `[D4]`

Follow `reference/colorize.md`. Do not hand-pick hex values into components.

Inputs: `#ABE707` (brand), `#000000`, `#FFFFFF`. See `IMPECCABLE.md` for the
contrast constraint — green is an **accent only**, never body text, and it fails
WCAG on white.

Produce a token set in `app/globals.css` as CSS custom properties wired to the
existing Tailwind 4 / shadcn variable names (`--background`, `--foreground`,
`--primary`, `--muted`, `--border`, `--ring`, …) so every `components/ui/*`
primitive picks it up for free:

- surface ramp (page → card → elevated → overlay)
- foreground ramp (primary / secondary / muted text)
- borders and dividers
- accent + its hover/active/disabled/focus states
- semantic: success, warning, danger, info — these must coexist with a lime
  brand without collision. Green-on-green is a real trap here; the brand lime
  and a success green will fight. Solve it deliberately.

**Every pair must pass WCAG AA** (4.5:1 body, 3:1 large text and UI boundaries).
Put the contrast table in your report. The detector checks this.

Keep dark as the default. If you add a light theme, it needs its own darkened
green — do not reuse `#ABE707` on light surfaces.

---

## T-B.3 — Spacing, layout, rhythm

Follow `reference/layout.md`.

- One spacing scale, used everywhere. No arbitrary `mt-[13px]`.
- Consistent container widths, section padding, and vertical rhythm between
  sections — right now each marketing component sets its own.
- Grid and breakpoint behaviour defined once, not per component.
- Radius and elevation scales (the detector flags nested cards — check for them).

Audit all 15 components in `components/*.tsx` against the scale and fix the
outliers. Report which ones were off.

---

## T-B.4 — Motion

Follow `reference/animate.md`. `framer-motion` 12 is already a dependency.

- One easing set and one duration scale. **The detector flags bounce easing** —
  if it's in there, it goes.
- Entrance animations subtle and fast; nothing that delays reading.
- **`prefers-reduced-motion` respected everywhere** — non-negotiable.
- No animation that causes layout shift (CLS is a Phase E metric but is created
  here).

---

## T-B.5 — Fix RTL/LTR properly `[D5]`

`app/layout.tsx:71` hardcodes `lang="ar" dir="rtl"` while `components/lang-toggle.tsx`
lets the user switch to English. English content currently renders inside an RTL
document — mirrored layout, wrong text alignment, wrong icon direction.

- `lang` and `dir` must follow the active locale.
- Use logical CSS properties throughout (`margin-inline-start`, not
  `margin-left`; `ps-4`, not `pl-4`). Audit every component — this is the single
  most common source of RTL bugs.
- Directional icons (arrows, chevrons) must flip.
- Test both directions at all three breakpoints.

Decide and document: is English a full locale or a partial translation? If
`lib/i18n.tsx` has gaps, list them — don't silently ship half-translated pages.

---

## T-B.6 — Accessibility pass

Follow `reference/harden.md`.

- Visible focus states on every interactive element, using the accent ring
- Keyboard navigation through the whole page, logical order, no traps
- Semantic landmarks, one `h1`, no skipped heading levels
- Real `alt` text; decorative images marked as such
- Touch targets ≥ 44px
- Forms (when they arrive in Phase D) labelled properly

---

## T-B.7 — Images `[D2]`

`next.config.mjs` sets `images: { unoptimized: true }` — no WebP/AVIF, no
responsive `srcset`, full-size images on a conversion-critical page.

- Remove it; configure `remotePatterns` if anything loads externally
- Convert `<img>` to `next/image` with explicit dimensions
- Add the logo as a proper asset (source PNGs in `BasmaProgram/Basma color vision/`)
  — **prefer SVG if you can trace it cleanly**, since it's the brand mark and will
  be used at many sizes. If you can't, use the highest-quality PNG and say so.

---

## T-B.8 — Document the system

Impeccable's `init` produces `PRODUCT.md` and `DESIGN.md`. Follow
`reference/init.md` and write them at the repo root:

- **`PRODUCT.md`** — what BASMA is now (academy + services), who it's for,
  the tone
- **`DESIGN.md`** — the design language: palette with hex + contrast ratios,
  type scale, spacing scale, motion tokens, component conventions, RTL rules

These become the contract for Phases C, D, and E. Every later phase reads
`DESIGN.md` instead of re-deciding.

---

## T-B.9 — Prove the improvement

```bash
npx impeccable detect . > KIMI_TASKS/reports/impeccable-after.txt
```

Report the before/after violation counts and explain any that remain. Screenshot
`/` again at all three widths, side by side with the T-B.0 baseline.

---

## Definition of Done

- [ ] Real self-hosted fonts; build passes offline; licence verified
- [ ] Type scale tuned against real Arabic copy, not lorem ipsum
- [ ] Color tokens in `globals.css`, wired to shadcn variables
- [ ] Full WCAG AA contrast table in the report — every pair passes
- [ ] One spacing scale; all 15 components audited
- [ ] Motion tokens defined; `prefers-reduced-motion` honoured; no bounce easing
- [ ] `lang`/`dir` follow the locale; logical properties throughout; icons flip
- [ ] Keyboard + focus + semantics pass
- [ ] `next/image` on; logo as a proper asset
- [ ] `PRODUCT.md` and `DESIGN.md` written
- [ ] `impeccable-before.txt` vs `impeccable-after.txt` — measurable drop
- [ ] Screenshots at 1440 / 768 / 375, before and after
- [ ] `pnpm lint` · `typecheck` · `test` · `build` PASS
- [ ] `KIMI_TASKS/reports/PHASE-B-REPORT.md` written

## Out of scope

- Do not restructure page sections or rewrite copy (Phase E)
- Do not build academy or services pages (Phases C, D)
- Do not add a backend, CMS, or database
- Do not silence detector rules to make the numbers look better
