# Phase H — Hero rebuild + landing page structure

**Goal:** the home page currently loses its primary CTA below the fold on a
standard laptop, collides two layers on top of each other, and spends its whole
brand accent on an English job title. Fix the hero as a composition, then give
the page the middle it is missing — a reason to believe between the headline and
the CTA.

**Prerequisite:** Phase G approved (brutalist system is the baseline).
**Runs before:** Phase F (deploy). Do not deploy the current hero.
**Backend:** none. Content stays in files.

---

## 0. Read this first — the measurements

Everything below was measured live in the browser at `localhost:3000`, not
eyeballed. Kimi: re-run these same measurements after your changes and paste the
numbers in your report. "Looks better" is not an acceptance criterion here.

### The hero does not fit the screen it is designed for

| Viewport | Hero height | Primary CTA | Verdict |
|---|---|---|---|
| 1280 × 650 (common laptop) | **815px** | top `639`, bottom `687` — **fold is at 650** | ❌ CTA entirely below the fold |
| 1382 × 880 | 880px | 671 → 719 | ⚠️ fits, 6px collision (below) |
| 375 × 812 (mobile) | 812px | 538 → 646 | ⚠️ fits, 41px collision (below) |

### The skills strip is painted through the CTA buttons

`components/hero.tsx:106` positions the strip `absolute bottom-0 left-0 right-0`
inside a `min-h-screen` section, while the content column is a normal flow child
padded with `pb-40 sm:pb-32` to "make room". The padding does not track the
strip's real height (168px desktop, 207px mobile), so they overlap:

| Viewport | Strip top | Lowest CTA bottom | Overlap |
|---|---|---|---|
| 1382 × 880 | 713 | 719 | **6px** |
| 1280 × 650 | 647 | 687 | **40px** |
| 375 × 812 | 605 | 646 | **41px** |

The buttons stay clickable only because their wrapper carries `z-10` and the
strip does not. That is luck, not layout — the buttons sit *on* the strip's top
rule. This is the defect the owner is pointing at.

### The lime block breaks the project's own rule

`DESIGN.md` → *The One Voice Rule*: brand lime appears on **≤10% of any screen**.
Measured area of `.block-lime` in `h1` as a share of the viewport:

| Viewport | Lime block | Budget | Over by |
|---|---|---|---|
| 1382 × 880 | **14.3%** | 10% | +43% |
| 375 × 812 | **17.9%** | 10% | +79% |

And that is the headline block alone — it does not count the corner halftone
field in `app/page.tsx`, which is a second large lime object in the same first
screen, roughly 400px away from the first.

### The Arabic line overflows its own line box

`h1` is `leading-[1.05]` → a 100.8px line box at `font-size: 96px`. The rendered
ink box of `طريقك تبقى` measures **122px tall**. The glyphs are 21px taller than
the line they sit on. It has not visibly clipped yet only because the next line
is a solid block with its own padding. Any Arabic string with a
diacritic or a descender-heavy tail will collide. Arabic display type does not
go below ~1.15.

### `.meta-ar` renders Arabic in a fallback, not in Plex Arabic

`app/globals.css:201` — `.meta-ar { @apply font-mono … }`. The computed stack is
`plexMono, "plexMono Fallback", ui-monospace, "Courier New", monospace`. **None
of those carry Arabic except the auto-generated `plexMono Fallback`**, which is
Arial-derived. Measured widths of `المهارات اللي المسار بيغطيها` at 11px:

| Stack | Width |
|---|---|
| **as shipped** | **141.83px** ← what users see |
| `plexArabic` alone | 114.83px |
| `Arial` alone | 102.00px |

The shipped width matches neither — it is Arial carrying Plex Mono's metric
overrides. This is **T-B.10 reintroduced** by a new class. Every Arabic string
using `.meta-ar` on the site is affected.

### The corner field does not mirror in English

`app/page.tsx:23` uses physical `right-0`, `bg-right-top`, and
`linear-gradient(215deg …)`. `lib/i18n.tsx:214` flips `document.dir` to `ltr` in
the EN locale. The layout mirrors; the field does not. In English the field ends
up on the same side as the headline's entry point instead of opposite it.
`DESIGN.md` → *"Do use logical CSS properties for anything directional."*

### The conversion path contradicts itself

| Element | Points at | Problem |
|---|---|---|
| Navbar `ابدأ دلوقتي` | `/#academy` | the academy is a **قريبًا** teaser — the loudest CTA on the page leads to something nobody can buy |
| Hero CTA 1 `الخدمات` | `/services` | correct |
| Hero CTA 2 `شوف المسار` | `/#academy` | same dead end, at nearly equal visual weight |

Two CTAs of near-identical weight, one of which is a dead end, plus a nav button
of *higher* contrast pointing at the same dead end. A visitor has three
competing next actions and the loudest one goes nowhere.

### The page has no middle

Section map, top to bottom: **hero → academy teaser (قريبًا) → services (1 card)
→ FAQ → final CTA → footer.** There is no "who this is for", no "what you'll be
able to do", nothing that answers *why should I believe you* before the ask. The
conversion research is consistent on this: a benefit-led headline, a value
proposition under ~30 words, **three to five proof points**, then one CTA. The
hero's `hero.desc` is currently 40 Arabic words and there are zero proof points.

---

## 1. Decisions — do not re-litigate these

Kimi: these are settled. If you think one is wrong, write it in your report
**after** implementing it, do not silently substitute your own.

**D0 — The page leads with the roadmap, and says its honest state out loud.**
The headline already sells the academy (`طريقك تبقى AI Automation Engineer`)
while the primary CTA sells services. Pick one story: **the roadmap is the
story**, because it is the reason the brand exists and the headline is already
written for it. But it ships with its real state visible — *4 من 14 مستوى جاهزة،
والباقي بيتكتب* — and the primary CTA is **WhatsApp**, which is a real action
that works today. Services becomes a clearly-labelled second track, not a
competing CTA.
> ⚠️ **Owner decision, flagged.** If the owner wants services first instead,
> only T-H.5 and T-H.9 change; everything else holds. Build the default, note it
> in the report.

**D1 — The hero is a two-band layout, not a centered column with a floating
footer.** `min-h-svh` + `grid-rows-[1fr_auto]`. The skills strip is the second
row, a normal flow sibling. `absolute bottom-0` and the `pb-40 sm:pb-32`
compensation both go away. This is the single change that fixes the collision at
every viewport instead of at one.

**D2 — One lime event per screen.** The headline block is it. The corner field
gets dimmed and pushed to the inline-**end** so the two are not in the same
optical zone. Total lime coverage of the first viewport: **≤10%**, headline block
alone **≤8%**.

**D3 — Arabic is the display voice; the Latin job title is the subject, not the
hero.** The Arabic line is the largest type on the page. `AI Automation Engineer`
is the thing being named — it sits smaller, on one line, inside the lime block.
An Arabic-first site whose biggest object is an English phrase is not
Arabic-first.

**D4 — One primary CTA.** One filled lime button. The second action is a quiet
text link with an arrow, not an outlined button of the same size.

**D5 — No invented proof.** No testimonials, no student counts, no "%" figures,
no logos of companies that are not customers. This rule already cost the site
its stats section in Phase E; it is not being relaxed for a proof band. Proof
comes from things that exist: the 14-level roadmap, the 4 written levels, the
real reply channel, the founder.

**D6 — The skills strip stays.** The numbered `01…06` cell row is the best
structural idea in the current hero and it is genuinely brutalist rather than
decorated. It gets promoted from "thing stuck to the bottom of the viewport" to
"the band the hero rests on".

---

## 2. Tasks

### T-H.1 — Rebuild the hero as two bands

`components/hero.tsx`.

- Section becomes `min-h-svh grid grid-rows-[1fr_auto]` (`svh`, not `vh` — mobile
  browser chrome makes `100vh` taller than the visible viewport and that is part
  of why the CTA is being pushed off).
- Row 1: the content column. Row 2: the skills strip, in flow.
- Delete `absolute bottom-0 left-0 right-0` from the strip.
- Delete `pb-40 sm:pb-32` from the content wrapper.
- Content column aligns to the **inline-start** at `lg` and up (right edge in
  Arabic, left in English — use logical properties, no `text-right`); stays
  centered below `lg`. An Arabic reader enters top-right; a dead-centre column is
  the generic template look the owner is reacting to.

**Acceptance — measured at 1280×650, 1440×900, 1382×880, 768×1024, 375×812:**
1. Overlap between any CTA and the skills strip: **0px at every viewport.**
2. The primary CTA's bottom edge is **above the fold at 1280×650** (i.e. `< 650`).
3. No horizontal overflow (`scrollWidth - innerWidth === 0`).
4. The strip's top rule is a continuous line with nothing crossing it.

---

### T-H.2 — Headline typography

- Wrap the Latin span in `dir="ltr" lang="en"`. It is a Latin phrase inside an
  RTL heading and its direction is currently left to the bidi algorithm to guess.
- Arabic line: keep the `display` token from `DESIGN.md`
  (`clamp(2.75rem, 1.9rem + 3.6vw, 4.5rem)`), **line-height `1.15` minimum**.
- Latin lime line: roughly `0.6–0.7×` the Arabic size. It must render on **one
  line at every width from 320px to 1920px** — the current two-line wrap at 96px
  is what makes the block so large.
- Lime block padding stays tight (`px-3 py-1` is fine); the size reduction does
  the work.

**Acceptance:**
1. Rendered ink box of the Arabic line **≤ its computed line box** (re-run the
   122px vs 100.8px measurement; it must invert).
2. `AI Automation Engineer` does not wrap at 320 / 375 / 768 / 1280 / 1920.
3. `.block-lime` area ≤ **8%** of the viewport at 375×812 and at 1280×650.
4. The Latin span's `dir` resolves to `ltr` (check
   `getComputedStyle` / `el.dir`, not by eye).

---

### T-H.3 — Lime budget in the first screen

`app/page.tsx` corner field.

- Convert to logical positioning so it mirrors with the locale. It currently
  hardcodes `right-0` / `bg-right-top` / `215deg` and stays put when the document
  flips to `ltr`.
- Move it to the inline-**end** (opposite the headline's entry point) and dim it:
  `bg-primary/70` is too hot next to a lime headline block. Target the field
  reading as a printed panel bleeding off the corner, not as a light source.
- Keep the hard mask falloff — that decision from Phase G is correct.

**Acceptance:** total lime-ish coverage of the first viewport (headline block +
field, measured as painted area, not opacity-weighted) ≤ **10%** at 1280×650, in
**both** locales. Report the AR and EN numbers separately — a single number means
you only checked one.

---

### T-H.4 — Hero copy

`lib/i18n.tsx`.

- `hero.desc` is 40 Arabic words. Cut to **≤ 25 words / 2 rendered lines** at
  1280px. Say who it is for and what they will be able to do. Cut the second
  sentence about services entirely — services get their own track in T-H.9.
- Add **one** honest line of state under the CTA row, as a new key
  (e.g. `hero.state`): *4 مستويات جاهزة من 14 — والباقي بيتكتب.* Numbers come
  from `WRITTEN_LEVELS.length` and `TOTAL_LEVELS` in
  `components/academy-teaser.tsx`, **not typed as literals into the string** —
  use the `{n}` interpolation pattern already used by `academy.remaining`.
- Both locales, as always. English is a parity locale, not a translation
  afterthought — the EN line must also be ≤25 words, not a longer literal
  rendering of the Arabic.

**Acceptance:** word counts reported for `ar` and `en`; the state line's numbers
change if `WRITTEN_LEVELS` changes (prove it — add a level temporarily, screenshot
or log, remove it).

---

### T-H.5 — CTA hierarchy and destinations

- Hero: **one** filled primary → WhatsApp, via `whatsappLink()` from
  `config/contact.ts` (never a pasted number — that rule is from Phase D and it
  stands). Prefill text must identify the hero as the source so the owner can
  tell where the lead came from.
- Hero secondary: `الخدمات` → `/services`, as a **text link with an arrow**, not
  an outlined button. Visually subordinate.
- Navbar `ابدأ دلوقتي` → stop pointing at `/#academy`. Point it at the same
  WhatsApp action as the hero primary, with a *different* prefill message
  (`nav` vs `hero`) so the two entry points stay distinguishable.
- Remove `شوف المسار` as a hero CTA. The roadmap section is directly below and
  the page scrolls; it does not need a button competing with the primary.

**Acceptance:** exactly **one** element in the first viewport has
`background: var(--primary)`. Zero links on the home page point at a route or
anchor whose content is `قريبًا` while carrying primary-CTA styling. All touch
targets ≥44px at 375px (the Phase B bar — re-verify, do not assume).

---

### T-H.6 — Fix `.meta-ar`

`app/globals.css:201`. `.meta-ar` applies `font-mono` to Arabic text and the mono
stack has no Arabic. Give `.meta-ar` the Arabic sans stack and keep `.meta`
mono/Latin-only, which is what the class comment already says the split is for.

**Acceptance:** measured rendered width of an Arabic `.meta-ar` string equals the
width of the same string in `plexArabic` alone (repeat the 141.83 / 114.83 /
102.00 comparison above; shipped must land on **114.83**). Then grep for every
`.meta-ar` usage and confirm none regressed in size — Plex Arabic's metrics
differ from the Arial fallback's, so 11px labels may need to go to 12–13px.
Arabic needs ~10–15% more size than Latin for equal legibility; 11px Arabic is
below comfortable.

---

### T-H.7 — Skills strip as a structural band

- Keep the numbered `01…06` grid and the `dir="ltr"` on indices and Latin skill
  names — that part is right.
- Now that it is in flow (T-H.1), give it the band treatment: full-bleed top
  rule, `section-strip` rhythm, and let the cell grid run edge to edge rather
  than sitting inside `max-w-5xl`. It is the floor the hero stands on.
- The label above it uses `.meta-ar` — recheck it after T-H.6.

**Acceptance:** at 375px the grid is 2 columns with no orphaned cell and no cell
whose label wraps to 3 lines. At 1280px, 6 columns, all cells equal height.

---

### T-H.8 — New section: who this is for / what you'll be able to do

The missing middle. Insert **between** the hero and the roadmap section.

- 3–5 short items. Concrete capabilities, not adjectives: what a person can build
  after the roadmap that they cannot build now. Draw them from the actual level
  content in `D:\Basma agancy\BasmaProgram` — the four written levels are the
  source of truth for what is actually taught.
- Same cell/rule structure as the rest of the site. No icons-in-circles, no
  gradient cards.
- **Do not write outcomes the roadmap does not deliver.** If a claim is not
  traceable to a written level, it does not ship. Note in your report which level
  each item came from.

**Acceptance:** every item cites a source level in your report. Zero items
sourced from imagination.

---

### T-H.9 — Honest proof band

The page asks for a WhatsApp message with nothing behind it. Give a visitor
something true to weigh. Permitted material, all of it real:

- The roadmap exists and is specific — 14 levels, named structure, 4 written.
- The services track is live and concrete (`/services/ai-subscriptions`).
- The reply channel is a real person on a real number.
- The founder — who is behind this, in one or two sentences.

**Forbidden, restating D5:** student counts, testimonials, ratings, partner or
tool logos implying endorsement, uptime/percentage figures, "trusted by".

**Acceptance:** every factual claim in this band maps to something in the repo or
something the owner supplied in `STATUS.md`. List the mapping in your report. If
the owner has not supplied a founder bio, ship the band without it and flag the
gap — do not write one for him.

---

### T-H.10 — Page rhythm pass

After T-H.8 and T-H.9 the section count changes. Re-check the whole page:

- Every section uses `section-shell` or `section-strip` — no bespoke padding.
- Section order tells one story: hero → what you'll be able to do → the roadmap
  and its honest state → services → proof → FAQ → final CTA.
- Final CTA and the hero primary must not be the same button twice with different
  words; the final CTA closes, it does not restart the pitch.
- Total page length: report `scrollHeight / innerHeight` at 1280×650 before and
  after. If it grew past ~7 screens, something is padding rather than saying
  anything.

---

### T-H.11 — Verification

Do not report done without these.

**Gates** (remember `pnpm run <script>` is broken on this machine — run the
binaries through node directly, per `KIMI_TASKS/README.md` rule 7):

```bash
node node_modules/eslint/bin/eslint.js .
```
```bash
node node_modules/vitest/vitest.mjs run
```
```bash
node node_modules/next/dist/bin/next build
```
```bash
npx impeccable detect .
```

Detector must be **0**. Build must stay all-static.

**Measurements to paste into `reports/PHASE-H-REPORT.md`, as a before/after
table:**

| # | Metric | Before | After | Target |
|---|---|---|---|---|
| 1 | CTA ↔ strip overlap @ 1280×650 | 40px | | 0 |
| 2 | CTA ↔ strip overlap @ 375×812 | 41px | | 0 |
| 3 | Primary CTA bottom @ 1280×650 | 687 | | < 650 |
| 4 | Lime block area @ 1280×650 | — | | ≤8% |
| 5 | Lime block area @ 375×812 | 17.9% | | ≤8% |
| 6 | First-screen lime total, AR | — | | ≤10% |
| 7 | First-screen lime total, EN | — | | ≤10% |
| 8 | Arabic h1 ink box vs line box | 122 vs 100.8 | | ink ≤ line |
| 9 | `.meta-ar` Arabic width @ 11px | 141.83 | | 114.83 |
| 10 | Touch targets < 44px @ 375px | — | | 0 |
| 11 | Horizontal overflow, all widths | 0 | | 0 |
| 12 | Filled-primary elements in first screen | 2 | | 1 |
| 13 | `hero.desc` word count ar / en | 40 / 62 | | ≤25 / ≤25 |
| 14 | Page screens @ 1280×650 | 7.4 | | report |

**Both locales.** Toggle to EN and re-check 1, 2, 3, 7, 11 — the EN strings are
longer and the corner field currently does not mirror.

---

## 3. Out of scope — do not touch

- **The academy's visual design.** Still held (Phase C / G note in `STATUS.md`).
  The roadmap section on the home page stays a teaser; `/academy` stays
  unlinked and `noindex`.
- **Deploy.** Phase F, after this.
- **The brand lime value.** `#ABE707` is legally fixed. You are changing how much
  of it appears, never which lime it is.
- **Any backend, auth, CMS, or API route.** Front-end only, still.
- **Adding a light theme.** Dark is the only shipped theme.

---

## 4. Commit and report

One commit per task ID, `T-H.N: what changed`. Never push. Write
`KIMI_TASKS/reports/PHASE-H-REPORT.md` with the measurement table filled in, the
sources for T-H.8 and T-H.9, and anything you disagreed with.
