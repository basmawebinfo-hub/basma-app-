# Impeccable — Design Tooling Setup

**Impeccable** (github.com/pbakaus/impeccable, v4.0.4) is a design-guidance system
for AI coding agents: 23 design commands, live browser iteration, and **59
deterministic detector rules** that catch the patterns AI-generated UI keeps
falling into — overused fonts, gray text on colored backgrounds, nested cards,
bounce easing, and so on.

It is installed and ready. **This is the design authority for Phase B onward.**

---

## Where it lives

| Location | Path | Who uses it |
|----------|------|-------------|
| **Global** | `~/.claude/skills/impeccable/` | Claude (auto-loads as a skill) |
| **Project** | `.github/skills/impeccable/` | **Kimi — read these files directly** |
| **CLI** | `npx impeccable <cmd>` | Anyone, no AI harness needed |

---

## ⚠️ Kimi: read this part carefully

**Kimi Code is not a supported harness.** Impeccable ships adapters for claude,
codex, cursor, gemini, github, grok, kiro, opencode, pi, qoder, trae, rovo-dev,
and vibe — Kimi is not on that list, so `/impeccable <command>` **will not work
for you.** Don't try it.

You get at it two ways instead, and both are fully sufficient:

### 1. The detector — deterministic, harness-independent, your primary tool

```bash
npx impeccable detect .
```

Runs all 59 rules over the codebase and reports concrete violations with file
and line. **This is objective output, not opinion.** Run it before you start and
after every change.

```bash
npx impeccable detect components/hero.tsx     # single file
npx impeccable detect --help                  # options
npx impeccable ignores                        # manage false positives
```

**Rule:** if you add an ignore, justify it in your report. Silencing the
detector to make a phase pass is the same category of mistake as adding
`eslint-disable` — don't.

### 2. The reference docs — read them as plain markdown

Every command is a markdown file you can open and follow:

```
.github/skills/impeccable/reference/
```

| File | What it covers |
|------|----------------|
| `init.md` | Initial setup — produces `PRODUCT.md` + `DESIGN.md` |
| `colorize.md` | Color system construction |
| `typeset.md` | Typography scale and pairing |
| `layout.md` | Spacing, rhythm, composition |
| `animate.md` | Motion, easing, timing |
| `polish.md` | Refinement pass |
| `critique.md` | UX review |
| `audit.md` | Technical quality checks |
| `harden.md` | Accessibility and robustness |
| `craft.md`, `craft-floor.md` | Quality bar definitions |
| `distill.md`, `quieter.md`, `bolder.md` | Tuning visual intensity |
| `shape.md`, `delight.md`, `optimize.md` | Form, micro-interaction, perf |

Full list: `ls .github/skills/impeccable/reference/`

**How to use one:** open the file, follow its instructions manually against our
code. They are written as procedures, not as magic — they work fine read by a
human or by you.

### If you get stuck

Impeccable commands that genuinely require the harness (live browser iteration,
`/impeccable live`) are **Claude's job, not yours.** Write what you need in your
report under `## Blocked / Needs Decision` and Claude will run it.

---

## BASMA brand palette — extracted from the logo

Source: `D:\Basma agancy\BasmaProgram\Basma color vision\logo.png`
(sampled programmatically, filtering to saturated pixels)

| Token | Hex | Notes |
|-------|-----|-------|
| **Brand green** | `#ABE707` | The fingerprint + circuit mark. `hsl(76, 97%, 47%)` |
| **Black** | `#000000` | Logo background |
| **White** | `#FFFFFF` | The `BASMA` wordmark |

**Variance across the four logo files** — `logo.png` `#ABE707` ·
`logo 2.png` `#A5D305` · `logo2 remove bg.png` `#C3DD22` ·
`kogo3 remove.png` `#CBD73D`. These are compression and antialiasing artifacts
of the same green. **`logo.png` is the canonical source; use `#ABE707`.**

### Constraint that shapes the whole system

`#ABE707` is a high-luminance lime. Contrast against **black is excellent**;
against **white it fails WCAG for text at any normal size**. The site is already
dark-first (`colorScheme: "dark"`, `themeColor: "#141414"`), which is the right
call and should stay.

Therefore:
- Green is an **accent** — CTAs, active states, the mark, key highlights, data
  emphasis. Not body text, not large fills.
- Body text is white/near-white on near-black.
- Any green-on-light usage needs a **darkened variant**; derive it and verify
  contrast, don't eyeball it.
- Run every foreground/background pair through the detector. "Gray text on
  colored backgrounds" is rule-checked.

Build the full ramp (surfaces, borders, muted, states) in `/impeccable colorize`
— don't hand-pick hex values.

---

## Design direction

The owner wants the visual language of **impeccable.style** itself: modern,
dark, high-contrast, generous whitespace, restrained accent use, confident
typography.

Two hard constraints that make this different from copying a Western site:

1. **Arabic-first, RTL.** Type scale, line-height, letter-spacing, and icon
   direction all behave differently in Arabic. Latin-tuned values look wrong.
2. **The fonts are currently fake.** `app/layout.tsx:11-13` defines stub objects,
   not fonts. Fixing this is the single highest-impact design change available —
   see **D1** in `STATUS.md`.
