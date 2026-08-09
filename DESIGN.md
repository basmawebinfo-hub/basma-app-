---
name: BASMA — بصمة
description: Arabic-first WhatsApp automation platform — dark, quiet, one lime accent.
colors:
  brand-lime: "oklch(0.855 0.218 126.3)"
  brand-lime-hover: "oklch(0.9 0.2 126.3)"
  brand-lime-active: "oklch(0.795 0.198 126.3)"
  brand-lime-on-light: "oklch(0.54 0.135 126.3)"
  ink-page: "oklch(0.14 0.006 130)"
  ink-card: "oklch(0.17 0.008 130)"
  ink-elevated: "oklch(0.2 0.009 130)"
  ink-overlay: "oklch(0.24 0.01 130)"
  text-primary: "oklch(0.96 0.005 130)"
  text-secondary: "oklch(0.82 0.008 130)"
  text-muted: "oklch(0.71 0.01 130)"
  on-lime: "oklch(0.17 0.02 130)"
  accent-surface: "oklch(0.22 0.02 126.3)"
  border-default: "oklch(0.26 0.008 130)"
  border-strong: "oklch(0.35 0.01 130)"
  success: "oklch(0.82 0.15 160)"
  warning: "oklch(0.83 0.15 85)"
  info: "oklch(0.8 0.1 245)"
  destructive: "oklch(0.7 0.18 25)"
typography:
  display:
    fontFamily: "Space Grotesk, IBM Plex Sans Arabic, sans-serif"
    fontSize: "clamp(2.75rem, 1.9rem + 3.6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0"
  title:
    fontFamily: "Space Grotesk, IBM Plex Sans Arabic, sans-serif"
    fontSize: "clamp(2rem, 1.6rem + 1.8vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.35
  heading:
    fontFamily: "Space Grotesk, IBM Plex Sans Arabic, sans-serif"
    fontSize: "clamp(1.375rem, 1.25rem + 0.6vw, 1.75rem)"
    fontWeight: 600
    lineHeight: 1.5
  lead:
    fontFamily: "Space Grotesk, IBM Plex Sans Arabic, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.8
  body:
    fontFamily: "Space Grotesk, IBM Plex Sans Arabic, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.85
  mono:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  scale:
    micro: "10px"
    label: "11px"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  gutter: "16px / 24px / 32px (sm / md / lg)"
  section: "64px / 96px / 128px (sm / md / lg)"
  strip: "48px / 64px (default / lg)"
components:
  button-primary:
    backgroundColor: "{colors.brand-lime}"
    textColor: "{colors.on-lime}"
    rounded: "9999px"
    padding: "12px 32px"
  button-primary-hover:
    backgroundColor: "{colors.brand-lime-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "9999px"
    padding: "12px 32px"
  card-default:
    backgroundColor: "{colors.ink-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input-field:
    backgroundColor: "{colors.ink-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "12px 20px"
  badge-elevated:
    backgroundColor: "{colors.ink-elevated}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
---

# Design System: BASMA — بصمة

## Overview

**Creative North Star: "The Quiet Control Room"**

BASMA's interface is a dark operations room: near-black surfaces, calm typography, and a
single lime signal that only lights up where attention should go. The product promises
zero-code automation, so the site itself must feel effortless — content is visible by
default, nothing hides behind scroll reveals, and the page reads top to bottom like a
well-lit board. Density is moderate and airy; Arabic is the primary typeface environment,
with Latin glyphs sharing the same line without visual seams.

**Key Characteristics:**
- Near-black, low-chroma surfaces in a single lime-tinted hue family (hue 126–130).
- One accent — brand lime `#ABE707` — used for actions, key numbers, and focus only.
- Arabic-first typography: IBM Plex Sans Arabic carries body text; Space Grotesk carries
  Latin glyphs; IBM Plex Mono carries code.
- No gradient text, no bounce easing, no scroll-gated content.
- Dark is the only shipped theme.

## Colors

The palette is one hue family: every neutral carries a whisper of the brand hue (130),
so the lime accent feels grown from the surface, not pasted on. Every shipped
foreground/background pair passes WCAG AA (see `KIMI_TASKS/reports/contrast-table.txt`).

### Primary
- **Brand Lime** (`oklch(0.855 0.218 126.3)`, hex `#ABE707`): CTAs, key metrics, active
  states, focus ring, the fingerprint logo. Never used for body text or large fills.
- **On Lime** (`oklch(0.17 0.02 130)`): text/icons sitting on brand lime.
- **Lime on Light** (`oklch(0.54 0.135 126.3)`, `#5A7C08`): reserved darkened variant for
  any future light surface (4.86:1 on white).

### Neutral
- **Page Ink** (`oklch(0.14 0.006 130)`): the page background.
- **Card Ink / Elevated / Overlay** (`oklch(0.17…0.24)`): the tonal ladder — depth comes
  from lightness steps, not shadows.
- **Text Primary / Secondary / Muted** (`oklch(0.96 / 0.82 / 0.71)`): the reading ramp.
- **Border / Border Strong** (`oklch(0.26 / 0.35)`): hairlines and card edges.

### Semantic
Success (hue 160), Warning (85), Info (245), Destructive (25) — all deliberately clear
of the brand hue 126 so a status color never reads as brand.

### Named Rules
**The One Voice Rule.** Brand lime appears on ≤10% of any screen: buttons, key numbers,
the logo, focus rings. Its rarity is the point.
**The No-Gradient-Text Rule.** Text is never filled with a gradient; emphasis is
`text-primary` (lime) on plain text. (Former `.text-gradient-lime` was removed in Phase B.)

## Typography

**Display/Body Font:** Space Grotesk (Latin) + IBM Plex Sans Arabic (Arabic), per-glyph
fallback in one stack. **Mono Font:** IBM Plex Mono (code samples, API reference).

**Character:** a technical, engineered voice. Space Grotesk's geometric Latin sits inside
Plex Arabic's calm, open forms without a size or weight mismatch; both are OFL-licensed
and self-hosted as woff2 via `next/font/local`.

### Hierarchy
- **Display** (700, `clamp(2.75rem → 4.5rem)`, line-height 1.25): hero headline only.
- **Title** (700, `clamp(2rem → 3rem)`, 1.35): section headings.
- **Heading** (600, `clamp(1.375rem → 1.75rem)`, 1.5): sub-headings, card titles.
- **Lead** (400, `clamp(1.0625rem → 1.25rem)`, 1.8): section intros.
- **Body** (400, 1rem, 1.85): Arabic prose needs more air than Latin at the same size —
  `--leading-prose: 1.85` is the default reading rhythm.
- **Label** (500, 11px): badges, plan captions, incident IDs — the smallest readable step.
- **Micro** (400, 10px): roles/footnotes under cards; never below 10px anywhere.

### Named Rules
**The No-Tracking Rule.** Letter-spacing is never applied to Arabic letterforms
(`.tracking-display` resolves to `0`); uppercase tracked labels are Latin-only.

## Layout

- `.container-site` — one gutter everywhere (`px-4 / sm:px-6 / lg:px-8`), max width 72rem
  (`max-w-6xl`) for content sections.
- `.section-shell` — full sections breathe `py-16 / sm:py-24 / lg:py-32`.
- `.section-strip` — compact bands (logo cloud, stats) breathe `py-12 / lg:py-16`.
- Sections stack without hairline dividers; separation comes from spacing rhythm alone.
- RTL is the default (`dir="rtl"` with `lang="ar"`); all spacing uses logical properties
  (`ms-/me-/ps-/pe-/start-/end-`), so the English locale mirrors correctly for free.

## Elevation & Depth

Flat by design. Depth is conveyed through the tonal ladder (page → card → elevated →
overlay) plus one signature glow: `.glow-primary`, a soft lime halo (`color-mix` of
`--primary`) behind the hero demo bar and the API console card.

### Named Rules
**The Flat-By-Default Rule.** No drop shadows on cards or buttons. Elevation is a
lightness step; glow is reserved for the two interactive showpieces.

## Shapes

- Radius scale: 4 / 8 / 12 / 16px (`--radius: 0.5rem` base).
- Buttons and the navbar pill are fully rounded (9999px); cards and inputs use 12px;
  small badges use 8px.
- Hairline borders (`--border`, `--border-strong`) define card edges — no outlines
  thicker than 1px anywhere.

## Components

### Buttons
- **Shape:** pill (9999px) for marketing CTAs; 12px radius inside consoles/cards.
- **Primary:** brand lime fill, on-lime text, generous padding (`12px 32px` at xl).
- **Hover / Focus:** hover lightens to `--primary-hover`; every interactive element has a
  visible focus ring (`ring-2 ring-primary/50` + offset on the shared Button).
- **Outline / Ghost:** transparent with a hairline border or plain text, lime on hover.

### Cards / Containers
- **Corner Style:** gently rounded (12px).
- **Background:** Card Ink; Elevated for badges and nested chips.
- **Border:** 1px `--border`; `--border-strong` on hover/emphasis.
- **Internal Padding:** 16–24px.

### Inputs / Fields
- **Style:** Card Ink fill, hairline border, 12px radius.
- **Focus:** browser outline suppressed in favor of the lime focus ring.

### Navigation
- Fixed pill navbar: `bg-background/60` + backdrop blur, hairline border, full radius.
- Touch targets are ≥44px (`min-h-11 min-w-11`); mobile menu is a full-screen sheet with
  Escape-to-close.

### Signature: Hero Demo Bar
A mock chat input with an animated typing placeholder and a lime "try it" button — the
product promise in miniature. Positions use logical properties so the placeholder sits at
the inline-start and the button at the inline-end in both locales.

## Do's and Don'ts

### Do:
- **Do** keep every foreground/background pair on the verified contrast table.
- **Do** use logical CSS properties (`ms-`, `pe-`, `start-`) for anything directional.
- **Do** flip directional icons in RTL with `rtl:-scale-x-100`.
- **Do** use motion tokens from `lib/motion.ts` (ease-out `[0.16,1,0.3,1]`, durations
  0.15–0.6s) and respect `prefers-reduced-motion` everywhere.
- **Do** render content visible by default; entrance motion is opacity + ≤12px rise only.

### Don't:
- **Don't** use gradient text, bounce/elastic easing, or scroll-gated section reveals.
- **Don't** use brand lime for body text, large backgrounds, or status colors.
- **Don't** letter-space Arabic text or force Latin uppercase styles onto Arabic labels.
- **Don't** add a second accent hue — semantic hues stay clear of hue 126.
- **Don't** introduce a light theme without deriving pairs from `--primary-on-light`.
