# Phase H — Report

**Implementer:** Kimi K3 (T-H.0 → T-H.3), then Claude (Opus 5) took over at T-H.3
**Date:** 2026-08-12

---

## ⚠️ Read first — this phase had two implementers

Kimi ran the Phase H prompt, built its own measurement harness (`T-H.0`, not in
the spec — a good addition), and committed **T-H.1** and **T-H.2**. It then
stopped mid-**T-H.3** with `app/page.tsx` and the `.corner-field` rule
uncommitted, and did not resume.

Claude picked the phase up from there at the owner's instruction and finished
**T-H.3 → T-H.11**. Kimi's commits were **kept as-is** — they are on-spec and
independently verified below. Two of its decisions were changed, both recorded
in §3.

Anyone resuming this work should not re-run the Phase H prompt against Kimi
again: T-H.1 and T-H.2 are done and a second pass would fight the current tree.

---

## 1. Measurement table

All numbers measured live via `KIMI_TASKS/tools/measure-h.mjs` (Chrome via
puppeteer-core), 5 viewports × 2 locales. Raw output:
`reports/measure-h-before.json` → `reports/measure-h-after3.json`.

| # | Metric | Before | After | Target | ✓ |
|---|---|---|---|---|---|
| 1 | CTA ↔ strip overlap @ 1280×650 | 40px | **0** | 0 | ✅ |
| 2 | CTA ↔ strip overlap @ 375×812 | 41px | **0** | 0 | ✅ |
| 3 | Primary CTA bottom @ 1280×650 | 687 (fold 650) | **555.69** | < 650 | ✅ |
| 4 | Lime block area @ 1280×650 | 14.3% | **4.25% ar / 4.00% en** | ≤8% | ✅ |
| 5 | Lime block area @ 375×812 | 17.9% | **4.72% ar / 4.45% en** | ≤8% | ✅ |
| 6 | First-screen lime total, AR | — | **4.25%** | ≤10% | ✅ |
| 7 | First-screen lime total, EN | — | **4.00%** | ≤10% | ✅ |
| 8 | Arabic h1 ink box vs line box | 122 vs 100.8 | **92 vs 93.6** | ink ≤ line | ✅ |
| 9 | `.meta-ar` Arabic width @ 11px | 141.83 | **115.53** (Plex Arabic = 114.84) | ≈114.84 | ✅ |
| 10 | Touch targets < 44px @ 375px | 17 → 2 | **0** | 0 | ✅ |
| 11 | Horizontal overflow, all widths | 0 | **0** | 0 | ✅ |
| 12 | Filled-primary elements in first screen | 2 | **1** | 1 | ✅ |
| 13 | `hero.desc` word count ar / en | 40 / 62 | **18 / 24** | ≤25 / ≤25 | ✅ |
| 14 | Page screens @ 1280×650 | 7.4 | **7.88 ar / 8.31 en** | report | ⚠️ see §4 |

Overlap, CTA position, overflow, and the one-line Latin check were verified at
**all five** viewports (1280×650, 375×812, 1440×900, 1382×880, 768×1024) in
**both** locales — 0 overlap and 0 overflow everywhere.

**Row 9, on the 0.69px residual.** 115.53 against 114.84 for Plex Arabic alone
is not a miss: the measured string contains spaces, and U+0020 is claimed by
Space Grotesk, which sits first in `--font-sans`. That is the documented
per-glyph behaviour from T-B.10 — Latin-first ordering with an Arabic-capable
face behind it — and it is the same +5px-per-string effect recorded in
`STATUS.md`. The Arial fallback it replaced measured **141.83**.

**Row 8, on the metric itself.** The harness reported `113.19 vs 57.2` in the EN
locale at 375px and it was not a real overflow: `hero.title1` in English ("Your
path to becoming an") wraps to two lines there, and the check was comparing a
two-line bounding box against a one-line `line-height`.
`measure-h.mjs` now divides the span box by `getClientRects().length`, so it
measures per line as the criterion intends. The corrected EN figure is
**56.6 vs 57.2**.

**Latin title, one-line check:** measured at 320 / 375 / 768 / 1280 / 1920 —
`lines=1, wraps=false` at every width.

### Remaining sub-44px targets — all deliberate

Desktop reports **9**, tablet **6**, mobile **0**. Every one of the nine is
**24px tall** — 3 navbar links and 6 footer links — which is Phase B's
deliberate `min-h-11 sm:min-h-6` pattern: 44px on touch, the WCAG 2.5.8 (AA)
floor of 24px on pointer. **Zero elements are under 24px at any viewport.**
Three navbar links were at **20px** and did fail 2.5.8; they were fixed to
`min-h-6` in this phase.

## 2. Gates

| Gate | Result |
|---|---|
| `eslint app components lib config` | ✅ clean |
| `tsc --noEmit` | ✅ exit 0 |
| `vitest run` | ✅ 9/9 passed |
| `next build` | ✅ 26 routes, all `○ Static` / `● SSG` — no dynamic, no server |
| Impeccable detector | ✅ **0 anti-patterns** |

Two notes on running the gates here:

- **`npx impeccable detect .` cannot run on this machine** — `npx` spawns
  through `C:\Windows\System32\cmd.exe`, which is missing (the same `ENOENT
  -4058` documented in `README.md` rule 7). Use the vendored copy instead:
  ```bash
  node .github/skills/impeccable/scripts/detect.mjs .
  ```
- **`eslint .` reports 497 errors that are not this repo's code.** It walks
  `.claude/worktrees/**`, which contains full copies of the project. Scope it to
  the app (`eslint app components lib config`) or add the directory to
  `eslint.config.mjs`'s ignore list. Flagged, not fixed — it is not Phase H's.
- `next build` fails with `Unterminated regular expression literal` in
  `.next/dev/types/routes.d.ts` if a dev server has run since the last build.
  Those are dev-mode artefacts being type-checked by the production build;
  `rm -rf .next` first. Not a code defect.

## 3. What was changed, task by task

**T-H.1 (Kimi) — hero as two bands.** `min-h-svh` + `grid-rows-[1fr_auto]`, the
strip in flow, `absolute bottom-0` and `pb-40 sm:pb-32` both gone. This is the
change that took the collision to 0 at every viewport rather than at one.

**T-H.2 (Kimi, then adjusted).** `dir="ltr" lang="en"` on the Latin span, the
Arabic line on the display token. **Changed:** Kimi sized the Latin title at
`clamp(1.125rem, 0.8rem + 1.8vw, 2.75rem)`, which is ~19px at 375px. That met
the ≤8% budget by a wide margin (2.7%) but turned the headline's subject into a
caption — a 5× overcorrection from 17.9%. It is now `clamp(1.6875rem, 1.18rem +
2.23vw, 2.8125rem)`, a fixed **0.62×** of the Arabic display token so the
relationship holds across the whole range instead of two independent clamps
drifting apart mid-scale. Lands at 4.0–4.7%.

**T-H.3 (Kimi, finished).** `.corner-field` with direction-aware mask angles,
logical `end-0`, `bg-primary/70` → `/40`, and a smaller box. It now mirrors with
the locale — it was physical `right-0` + `bg-right-top` + `215deg`, which stayed
put when the document flips to `ltr`.

**T-H.4 (Claude).** `hero.desc` 40 → 18 Arabic words, 62 → 24 English; the
services sentence was cut, since services have their own track further down.
Added `hero.state`, which renders the roadmap's real position next to the ask.

**T-H.5 (Claude).** Hero: one filled primary → WhatsApp via `whatsappLink()`,
services demoted from a same-size outlined button to a text link. Navbar
`ابدأ دلوقتي`: `/#academy` → the same WhatsApp action with a **different**
prefill (`wa.msg.nav` vs `wa.msg.hero`), and `variant="outline"` so the first
screen has exactly one lime fill. Mobile menu CTA changed the same way.
`شوف المسار` removed as a hero CTA — the roadmap is one scroll down.

**T-H.6 (Claude).** `.meta-ar` no longer applies `font-mono`. See §1 row 9.
Also 11px → 13px; the new step is documented in `DESIGN.md` (below).

**T-H.7 (Claude).** The strip is full-bleed: label in the container, cell grid
running to both edges with `-me-px` so the trailing border bleeds off rather
than closing like a table. 2 cols at 375, 6 at 1280, all cells equal height.

**T-H.8 (Claude).** New `components/outcomes.tsx`. Sources in §5.

**T-H.9 (Claude).** New `components/proof.tsx`. Sources in §5.

**T-H.10 (Claude).** Section order is now hero → outcomes → roadmap → services →
proof → FAQ → final CTA → footer. Outcomes sit before the roadmap because a list
of 14 level names means nothing to someone who does not yet know what it is for.
Also caught: the hero primary and the final CTA both read **كلّمنا على واتساب** —
the same button twice, which T-H.10 explicitly forbids. The hero now says
**اسألنا عن المسار**; the final CTA keeps the generic close.

**Supporting change.** `WRITTEN_LEVELS` / `TOTAL_LEVELS` moved out of
`components/academy-teaser.tsx` into **`config/roadmap.ts`**. Three surfaces now
quote the roadmap's progress (hero state line, roadmap section, proof band) and
a count retyped in three places is a count that drifts. T-H.4's requirement that
the numbers be derived rather than literal is met through this file.

**`DESIGN.md` updated.** The 13px Arabic label is a new step on the type ramp,
so it is documented rather than left as an undocumented literal: `labelArabic:
"13px"` in the scale, a **Label Arabic** entry in the hierarchy, and a new
named rule — *The Arabic-Needs-A-Bigger-Step Rule*. Without this the detector
correctly flagged it (`design-system-font-size`).

## 4. Page length — the one metric that did not improve

**7.88 screens at 1280×650 (8.31 in English), against 7.4 before.** Section
heights at that viewport:

| Section | Height |
|---|---|
| hero | 706 |
| outcomes *(new)* | 758 → 596 after the 4-column change |
| roadmap | **934** |
| services | 690 |
| proof *(new)* | 346 |
| FAQ | 773 |
| final CTA | 686 |
| footer | 334 |

The page grew because two sections were added, which is what T-H.8 and T-H.9
asked for — it is content, not padding. `outcomes` was moved to a 4-across grid
at `lg` to hold the cost down. At ordinary laptop heights the figure is
**5.9 screens at 1440×900**; 650px is a short viewport and inflates the count.

**Flagged, not fixed:** the tallest section on the page at 934px is the roadmap
teaser — the one thing a visitor cannot have yet. That is a real proportion
problem, but the academy's visual design is explicitly on hold (§3 of
PHASE-H.md, out of scope) and shrinking it properly means designing it. It
should be the first thing Phase I looks at.

## 5. Source mapping — required by T-H.8 and T-H.9

### T-H.8 — every outcome traced to a written level

Sources are cited in the component's header comment as well, so they travel with
the code. Levels read from `D:\Basma agancy\BasmaProgram`.

| Item | Level | Sections |
|---|---|---|
| Turn a business problem into technical requirements | **01** AI Problem Solver | §5 finding the real problem, §6 breaking it down, §10 business → technical requirements, §11 mapping the workflow, §12 what can be automated |
| Build with code, not just wire up tools | **02** Python Fundamentals | §11 files, §12 JSON, §13 CSV, §20 calling APIs from Python |
| Work like a developer | **03** Developer Foundations | §1 terminal, §5 Git, §6 GitHub, §7–9 commits/branches/PRs, §10 `.env`, §12 reading errors |
| Make two systems talk to each other | **04** Web, APIs & Webhooks | §8 REST APIs, §9 authentication, §10 webhooks, §11 webhook security, §14 rate limits, §15 pagination |

Four written levels, four outcomes. **Zero items sourced from imagination**, and
no fifth item was invented to balance the grid.

### T-H.9 — every proof claim traced to something that exists

| Claim | Maps to |
|---|---|
| "The roadmap is written, not promised" — 4 of 14, each with explanation / worked example / references / assessment questions | `config/roadmap.ts` + the four level files in `BasmaProgram`; the structure claim is the actual shape of `Level-01`…`Level-04`. Counts interpolated from the config, not typed. |
| "One service is live today" — page, terms, and fee published | `app/services/ai-subscriptions/` and `AI_SUBSCRIPTION_TERMS.fee` in `config/services.ts` ("٢٠٪ من سعر الاشتراك، بحد أدنى $5", settled 2026-08-10) |
| "You reach a person" — real number, no form, no ticket queue | `config/contact.ts`; there is no form handler and no ticketing anywhere in the repo (no backend at all) |
| "We tell you the actual state" | `academy.levelSoon` renders for unwritten levels; `AI_SUBSCRIPTION_TERMS.turnaround` is `null` and renders an honest fallback instead of an invented figure |

**Nothing invented:** no student counts, no testimonials, no ratings, no partner
or tool logos, no percentages, no "trusted by".

**⚠️ Gap left open deliberately.** There is **no founder line** in the proof
band. The owner has not supplied a bio, and writing one would be exactly the
invented credibility the band exists to avoid. When he supplies one it belongs
here — the placeholder note is in `components/proof.tsx`'s header comment.

## 6. Open items for the owner / review

1. **D0 is still unanswered.** The default was built: the roadmap is the story,
   the hero primary is WhatsApp, services are a second track. If the owner wants
   services first, only T-H.5 and T-H.9 change.
2. **The founder line** (§5).
3. **The roadmap teaser is the tallest section on the page** (§4) — first item
   for whatever phase designs the academy.
4. **`eslint .` walks `.claude/worktrees/**`** (§2) — one line in
   `eslint.config.mjs` fixes it; left alone as out-of-scope.

## 7. Disagreements with the spec

One, and it was implemented as written before being raised, per the rules:

**Row 14's "~7 screens" flag reads as a length budget, and length is the wrong
proxy here.** The page is longer than before because it now answers two
questions it previously skipped. The number worth watching is the *ratio* — the
roadmap teaser at 934px against a 346px proof band says something about
priorities that "7.88 screens" does not. The section-height table in §4 is the
more useful artefact and is offered as a replacement metric for the next phase.
