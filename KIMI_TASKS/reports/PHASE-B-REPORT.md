# PHASE-B Report — Design System

**Implementer:** Kimi K3 · **Date:** 2026-08-09 → 2026-08-10
**Commits:** `f486566` (T-B.0) → `134a90d` (T-B.8) + final gates commit
**Scope:** `KIMI_TASKS/phases/PHASE-B.md` — all nine tasks executed.

---

## 1. Gates — all green

| Gate | Result |
|------|--------|
| `next build` (offline) | ✅ 8 routes, all `○ Static`, compiles in ~32s |
| `eslint .` | ✅ PASS (see §7 for the config change) |
| `tsc --noEmit` | ✅ PASS |
| `vitest run` | ✅ 1 file, 3 tests passed |
| Impeccable detector | ✅ **1 → 0 anti-patterns** (baseline: `impeccable-before.txt`, after: `impeccable-after.txt`) |

## 2. What was done, per task

### T-B.0 — Baseline
Detector baseline captured (1 finding: `gradient-text`), full-page screenshots at
1440/768/375, snapshot tooling built (`KIMI_TASKS/tools/serve-and-snap.sh` +
`snap.mjs`, puppeteer-core + real Chrome; optional 4th arg forces `basma_lang`).

### T-B.1 — Fonts (fixes D1)
- **Decision: IBM Plex Sans Arabic, not Cairo.** Visually compared side by side
  (`shots-phase-b/font-compare.png`): Plex has a more technical voice, stays
  clearer at small sizes, and pairs naturally with IBM Plex Mono for code —
  one superfamily for Arabic + code instead of two unrelated families.
- Stack: **Space Grotesk** (Latin) → **IBM Plex Sans Arabic** (Arabic) →
  **IBM Plex Mono** (code). Latin-first ordering gives per-glyph fallback, so
  mixed Arabic/Latin lines render seamlessly.
- All three are **OFL-1.1**, self-hosted as woff2 in `app/fonts/`, loaded via
  `next/font/local` in `app/layout.tsx` with CSS variables. No Google Fonts
  request — the offline build gate is untouched.
- A `<head>` script restores `lang`/`dir` from `localStorage` before first
  paint (`suppressHydrationWarning` on `<html>`), so the EN locale never
  flashes RTL-ar.

### T-B.2 — Color system
- Brand `#ABE707` = `oklch(0.855 0.218 126.3)`; the whole palette is one hue
  family (126–130) so the accent feels grown from the surface.
- Full token set in `:root` wired to shadcn names plus additions (`--elevated`,
  `--overlay`, `--border-strong`, `--primary-hover/active/disabled/on-light`,
  semantic `--success/warning/info/destructive` clear of hue 126).
- `--accent` retuned from lime to a dark tinted hover surface (accent discipline).
- `--primary-on-light` `#5A7C08` (4.86:1 on white) reserved for any future
  light surface.
- **WCAG AA table** — `reports/contrast-table.txt`, 18/18 pairs PASS:
  - foreground/background **17.68:1**, muted-foreground/background **7.75:1**
  - primary/background **13.40:1**, primary-foreground/primary **12.89:1**
  - all four semantic hues ≥ 6.8:1 on background
- The baseline `gradient-text` violation (`.text-gradient-lime`) was removed
  and replaced with `text-primary` in 8 places.

### T-B.3 — Spacing & rhythm
Shared classes in `@layer components`: `.container-site` (one gutter
`px-4/6/8`), `.section-shell` (`py-16/24/32`), `.section-strip` (`py-12/16`),
`.glow-primary` (token-derived). Section hairline borders removed; pricing
badge fixed to `bg-elevated`.

### T-B.4 — Motion
- `lib/motion.ts`: one easing (`[0.16,1,0.3,1]`), one duration scale
  (0.15–0.6s), shared entrance variants.
- **All scroll-reveal curtains removed** from every content section (faq,
  how-it-works, testimonials, final-cta, stats, logo-cloud, pricing, use-cases,
  quick-start, video-gallery). Content is visible by default; only the hero
  keeps a single authored focal entrance.
- This also fixed the black-gap artifact that whileInView initial-opacity
  caused in full-page captures — verify `shots-phase-b/motion-check-1440.png`
  vs the baseline shots.
- `prefers-reduced-motion`: honored globally via `MotionConfig reducedMotion="user"`
  (`components/motion-provider.tsx`) + a CSS media query stopping
  marquee/pulse/spin loops.

### T-B.5 — RTL/LTR (fixes D5)
- Physical → logical properties in all marketing components: hero demo input
  (`pe-`, `start-`, `end-`, `ms-`), how-it-works badge (`-start-2`),
  quick-start (`ms-`, `ms-auto`), accordion (`text-start`).
- Directional icons flip in RTL via `rtl:-scale-x-100` (hero ×2, pricing,
  navbar, final-cta).
- Kept physical, deliberately: full-width bars (`left-0 right-0`), the centered
  pricing badge, marquee screen-edge fades, and the hero corner glow
  (symmetric decoration, reads correctly in both directions).
- Verified with forced-locale captures: `rtl-check-ar-1440.png` (placeholder at
  inline-start/right, button at inline-end/left) and `rtl-check-1440.png` (EN,
  mirrored correctly).
- **EN locale status:** the whole marketing surface translates; the pricing
  feature lists are English-only strings built in code (`pricing.tsx`), and the
  hero demo prompts are English demo content. Both are Phase E copy concerns,
  documented here as accepted gaps, not regressions.

### T-B.6 — Accessibility
- Skip link (`components/skip-link.tsx`, bilingual) → `main#main`.
- 44px touch targets: lang toggle, navbar hamburger, mobile-menu close
  (`min-h-11 min-w-11`).
- Visible focus rings on every custom button (lime `ring-primary/50`).
- Mobile menu: Escape-to-close; hardcoded "Get Started Free" replaced with the
  i18n key.
- Landmarks/headings verified: one `h1` (hero), `header/nav/main/footer`,
  h2 per section. Radix accordion/tabs give keyboard support by default.

### T-B.7 — Images (fixes D2)
- `images: { unoptimized: true }` **removed** from `next.config.mjs` — the
  optimizer is live again.
- All 4 `<img>` tags converted to `next/image` (navbar ×2, footer, testimonials
  avatars); hero logo marked `priority`.
- **Logo decision:** kept `public/basma-logo.png` (1005×280 transparent RGBA).
  The source variants in `BasmaProgram/Basma color vision/` are either
  background-bound or padded; none is SVG. The shipped PNG is tightly cropped,
  transparent, and ~3.5× display resolution — documented in PRODUCT.md.

### T-B.8 — Documentation
- `PRODUCT.md` (impeccable product-schema 1): platform, users, purpose,
  positioning, brand commitments (name, logo, `#ABE707` as legal constraint),
  evidence on hand (placeholders flagged so future work doesn't present them
  as real customers), product principles, accessibility requirements.
- `DESIGN.md` (official DESIGN.md spec): YAML frontmatter tokens + 8 canonical
  sections, named rules (One Voice, No-Gradient-Text, No-Tracking,
  Flat-By-Default), typography scale including the enumerated `scale`
  (`micro: 10px`, `label: 11px`).

### T-B.9 — Final verification
Detector re-run: **0 anti-patterns**. The after-state scan initially reported
16 findings — all were design-system drift checks that only exist once
DESIGN.md is present; every one was fixed for real, not suppressed:
- off-ramp font sizes (10px/11px/0.8rem) → documented `scale` steps; vendored
  calendar converged to `text-[11px]`
- hardcoded zinc colors in `global-error.tsx` → replaced with the exact
  documented oklch tokens (also made the fallback page on-brand)
- mask gradient literals → new `--mask-shade` token
- `error.tsx`/`pricing.tsx`/`footer.tsx`/… micro sizes → on-ramp steps

## 3. Fixed violations list (components touched in Phase B)

| Violation | Where | Fix |
|-----------|-------|-----|
| gradient-text | globals.css + 8 usages | removed, `text-primary` |
| fake fonts | layout.tsx | next/font/local ×3 |
| hardcoded physical props | hero, how-it-works, quick-start, accordion | logical props |
| unflipped directional icons | hero, pricing, navbar, final-cta | `rtl:-scale-x-100` |
| scroll-reveal curtains | 11 components | removed; hero focal entrance only |
| no reduced-motion | app-wide | MotionConfig + CSS media query |
| sub-44px targets | lang-toggle, navbar buttons | `min-h-11 min-w-11` |
| no skip link | layout | SkipLink → `#main` |
| `<img>` + unoptimized | navbar, footer, testimonials, config | next/image + optimizer on |
| off-ramp sizes/colors | error pages, calendar, masks | tokens + documented scale |

## 4. Remaining advisories (accepted)

- **em-dash-overuse** (1 advisory, not a failure): fires on
  `KIMI_TASKS/tools/font-compare.html`, a disposable comparison fixture — not
  shipped UI. Accepted; the file can be deleted with the tools later.
- Detector's design-system checks now guard against future drift — any new
  off-ramp size or undocumented color fails the scan.

## 5. Evidence

- Screenshots: `shots-phase-b/` — `baseline-*`, `motion-check-*`,
  `rtl-check-ar-*`, `rtl-check-*` (EN), `after-*` (ar, 1440/768/375),
  `after-en-*` (EN, 1440/768/375).
- Contrast: `reports/contrast-table.txt` (18/18 PASS).
- Detector: `reports/impeccable-before.txt` (1) → `reports/impeccable-after.txt` (0).

## 6. Explicitly out of scope (unchanged by design)

- WhatsApp-platform copy (hero, pricing features, privacy/terms, SEO fields) —
  **Phase E owns the rewrite** (STATUS.md carried item 5).
- CSP Report-Only flip (D3) — Phase E.
- CTA anchor placeholders (`#pricing` etc.) — final destinations after C/D.
- Orphaned `components/ui/*` pruning — deferred until C picks what it needs.
