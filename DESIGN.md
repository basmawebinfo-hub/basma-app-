---
name: BASMA — بصمة
description: Arabic-first AI academy and services — dark brutalist, hard-edged, one lime accent.
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
    labelArabic: "13px"
rounded:
  all: "0px"   # brutalist — --radius is 0, which de-rounds every shadcn primitive
  full: "9999px"  # circles ONLY (spinner, status dot); never a softened rectangle
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
- **Label** (500, 11px): badges, plan captions, incident IDs — the smallest readable step
  **in Latin** (`.meta`).
- **Label Arabic** (400, 13px): the Arabic sibling of Label (`.meta-ar`). Two steps larger
  because Arabic carries less optical size than Latin at the same nominal font-size — an
  11px Arabic label reads meaningfully smaller than an 11px Latin one, and Plex Arabic's
  effective x-height makes the gap wider still. Added in Phase H.
- **Micro** (400, 10px): roles/footnotes under cards; never below 10px anywhere.

### Named Rules
**The No-Tracking Rule.** Letter-spacing is never applied to Arabic letterforms
(`.tracking-display` resolves to `0`); uppercase tracked labels are Latin-only.
**The Arabic-Needs-A-Bigger-Step Rule.** Small type has two ramps, not one. Anything
below body size that carries Arabic uses the Arabic step (`.meta-ar`, 13px), never the
Latin one — and never the mono stack, which has no Arabic coverage at all and silently
falls through to a metric-adjusted Arial (this shipped twice: T-B.10, then again through
`.meta-ar` until Phase H).

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

---

## Brutalist direction (Phase G, 2026-08-10)

The visual language changed from *dark, quiet, rounded* to **dark brutalist**.
Reference: ASHFALL — heavy structure, extreme scale contrast, zero softness.
The palette did not change; the treatment did.

### Hard rules

| Rule | Why |
|------|-----|
| **`--radius: 0`** | One token de-rounds every shadcn primitive. `rounded-full` survives only on genuine circles (spinner, status dot) — a circle is a shape, not a softened rectangle. |
| **No `backdrop-blur`, no soft `box-shadow`, no radial glows** | Brutalism has no diffuse light source. `.glow-primary` is now a hard 4px offset, not a bloom. |
| **Borders raised** (`0.26 → 0.34`, strong `0.35 → 0.48`) | A hairline you can barely see is decoration; one you can read is architecture. |
| **Lime is a field, never coloured type** | `#ABE707` fails WCAG as text (1.48:1 on white, and it reads as glare on black at paragraph size). It appears as a solid block with `--primary-foreground` on top. |
| **Grain over everything** | `.grain` on `<body>` — a fixed SVG fractal-noise overlay at 3.5% opacity. The reference's paper texture, translated to a dark surface. |

### Why this is not a copy of the reference

The reference gets its force from **typographic violence**: enormous condensed
grotesques with tracking pulled tight. **That vocabulary is Latin and does not
port.** Arabic has no condensed-grotesque display tradition, the script is
connected so tracking cannot be pulled the same way, and `.tracking-display`
already enforces `letter-spacing: 0` for exactly this reason.

So the load moves to what Arabic *can* do:

- **Scale and weight contrast** instead of condensation — an 8xl headline against
  11px mono labels
- **Literal structure** — `.cell`, `.rule`, bordered grids. In Latin brutalism
  the type *is* the structure; in Arabic the structure has to be drawn.
- **Latin monospace for all meta** — indices, prices, categories (`01`, `$25`).
  Legitimate: technical Arabic writing genuinely mixes scripts. Always `dir="ltr"`
  so bidi doesn't reorder numerals.

### Primitives

| Class | Use |
|-------|-----|
| `.cell` | bordered box — the default container, replaces every card |
| `.cell-strong` | 2px border — the primary object on a screen |
| `.block-lime` | solid brand field with dark text on it |
| `.meta` | 11px uppercase mono, wide tracking — **Latin only** |
| `.meta-ar` | 11px mono, no tracking — Arabic never gets tracked or uppercased |
| `.rule` | full-bleed structural divider |
| `.grain` | noise overlay (applied once, on `<body>`) |

### Known gap

**IBM Plex Sans Arabic is a text face, not a display face.** It holds at 16px and
is merely adequate at 96px, where brutalism lives or dies. A dedicated Arabic
display cut (Almarai Black, Tajawal Black, Readex Pro) should be tested
side-by-side against real headlines before this is called finished.
