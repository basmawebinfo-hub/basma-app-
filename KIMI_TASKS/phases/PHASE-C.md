# Phase C — Academy

**Goal:** build the academy section end to end, so the owner can add a course by
dropping in a markdown file and a Vimeo link — nothing else.

**Prerequisite:** Phase B approved (design system is the contract — read `DESIGN.md`).
**Backend:** none. Content is files in the repo.

---

## The one architectural rule for this phase

The owner has said there will eventually be a dashboard, and that how the academy
gets "opened up" is undecided. That means **today's file-based content is
temporary, and you must not let it leak into the UI layer.**

Everything that reads content goes through one module — `lib/content/` — exposing
a small typed interface:

```ts
export async function getCourses(): Promise<CourseSummary[]>
export async function getCourse(slug: string): Promise<Course | null>
export async function getLevel(course: string, level: string): Promise<Level | null>
```

Today those functions read the filesystem. Tomorrow they hit a CMS, an API, or a
database — and **no page, no component, and no route changes.** If a component
imports `fs`, reads a path, or parses frontmatter directly, the phase is wrong.

Define the types in `types/content.ts`. They are the contract.

---

## T-C.1 — Content model

Source material lives at `D:\Basma agancy\BasmaProgram` (Level-01 … Level-04
written; 14 planned). Read Level-01 before designing anything — the structure is
consistent and should drive the model, not the other way round.

Observed shape per level: H1 title + Arabic subtitle → level goal → numbered
sections, each with `الشرح المبسط` / `مثال عملي` (often a fenced ASCII workflow)
/ `مصادر ومراجع` (external links) / `أسئلة تقييم` (numbered questions).

**Layout** — copy the content into the repo under `content/`:

```
content/courses/<course-slug>/
  course.json            # title, subtitle, description, order, status
  levels/
    01-ai-problem-solver.md
    02-python-fundamentals.md
    …
```

**Level frontmatter** — this is the owner's authoring surface. Keep it short and
obvious:

```yaml
---
title: "AI Problem Solver"
titleAr: "محلّل المشكلات بالذكاء الاصطناعي"
subtitle: "اتعلم إزاي تفكّر قبل ما تبدأ تبني"
order: 1
status: published        # published | draft | coming-soon
vimeo: "https://vimeo.com/123456789"   # full URL or bare ID — both must work
duration: "42:10"        # optional
---
```

**Requirements:**
- `status: coming-soon` renders a locked/teaser card. **10 of 14 levels don't
  exist yet** — the site must handle that gracefully, not ship ten blank pages.
- **Missing `vimeo` is the state every level is in right now** (no Vimeo account
  yet). The level page must render text-only and look *deliberate* — a designed
  "video coming soon" block, not an empty gap where a player should be. All four
  written levels ship this way, so treat it as the primary state, not the edge case.
- Adding a level = drop a `.md` file in. **No code change, no registry to update.**
  If the owner has to edit a TypeScript file to publish a level, you built it wrong.

Use `gray-matter` for frontmatter and a markdown renderer that handles RTL,
fenced code blocks, and tables. Whatever you choose, add it to `package.json` and
justify it in the report.

---

## T-C.2 — Vimeo player

The owner pastes a Vimeo link; it plays. That's the whole requirement.

> **There is no Vimeo account and no uploaded video yet.** Build the player and
> the empty state now; real IDs land later. This is the normal case, not a
> blocker — but it means **you cannot verify playback**, so the empty/placeholder
> state is the part that must be genuinely finished, and the player has to be
> written so that pasting a real link later Just Works with no code change.
>
> To prove the player itself functions, test against a public Vimeo video (e.g.
> Vimeo's own staff picks) in dev, then remove it. Say in your report which ID
> you tested with and confirm it isn't left in the content.

- `components/academy/vimeo-player.tsx` — accepts a URL **or** a bare ID and
  normalises it. Handles `vimeo.com/ID`, `player.vimeo.com/video/ID`, and
  unlisted links with a hash (`vimeo.com/ID/HASH` → `?h=HASH`). Unlisted links
  are the common case for course video; if you don't handle the hash, private
  videos silently fail to load.
- Responsive 16:9, lazy-loaded, `loading="lazy"`, poster/skeleton before load.
- `title` attribute on the iframe (a11y), keyboard reachable.
- Graceful failure: no ID, bad ID, or blocked embed → a clear message, never a
  blank black box.

**⚠️ CSP will block this.** `next.config.mjs` currently has `frame-src 'self'`.
Add `https://player.vimeo.com`. If you use Vimeo thumbnails, `img-src` already
allows `https:`. Do **not** widen the policy further than needed, and note the
change in your report.

> **Flag for the owner (put this in your report, don't act on it):** if the
> academy is ever gated behind payment, Vimeo privacy must be set to
> *"only on domains I choose"* — otherwise anyone with the video ID can watch
> outside the site. Worth configuring now even while it's open.

---

## T-C.3 — Routes and pages

```
/academy                                  course index
/academy/[course]                         course overview + level list
/academy/[course]/[level]                 the level itself
```

All statically generated (`generateStaticParams`). The build must stay
**all `○ Static`** — verify in the build output.

**Course overview:** title, description, what you'll learn, level list with
status, total duration, progress affordance *(see T-C.5)*.

**Level page:** video player (if present) → level goal → the content sections →
references → assessment questions → prev/next navigation.

Long-form Arabic reading is the core job here. Measure line length, spacing, and
heading rhythm against `DESIGN.md`. **A wall of undifferentiated Arabic text is
a failed level page** — the sections (`الشرح المبسط` / `مثال عملي` / `مصادر` /
`أسئلة تقييم`) each have a distinct role and should be visually distinguishable.

Fenced workflow diagrams need the mono font and must not overflow horizontally on
mobile — wrap them in an `overflow-x-auto` container.

---

## T-C.4 — Navigation and entry points

- Academy link in the navbar and footer
- A section on the home page introducing the academy (design it from `DESIGN.md`;
  don't invent new visual patterns)
- Breadcrumbs on level pages
- Sticky level sidebar or a level switcher on desktop; a sensible mobile equivalent

---

## T-C.5 — Progress, without a backend

The owner wants a dashboard later. Until then, "progress" can only be local.

- `localStorage`-backed "mark as complete" per level, and a progress bar on the
  course page
- Must degrade silently if storage is unavailable
- **Keep it behind a tiny module** (`lib/progress.ts`) with the same discipline as
  `lib/content/` — when the dashboard arrives, this becomes a server call and
  nothing else changes
- Do **not** build accounts, login, or any auth affordance. No "Sign in to save
  progress" buttons that don't work.

---

## T-C.6 — Authoring documentation

Write `content/README.md` for the owner, **in Arabic**, covering:

1. How to add a new level (create file, fill frontmatter, done)
2. Every frontmatter field and its allowed values
3. How to get a Vimeo link and where to paste it
4. How to mark a level `coming-soon` vs `published`
5. How to add a whole new course

Assume no programming knowledge. This file is the deliverable that makes the
"leave it open so I can add courses" requirement real — if it isn't clear enough
for the owner to follow alone, the phase isn't done.

---

## T-C.7 — SEO for course pages

Full metadata rewrite is Phase E, but pages created here must not ship
metadata-less:

- Per-page `title` / `description` from frontmatter via `generateMetadata`
- `Course` JSON-LD on course pages, `VideoObject` on level pages with a video
- Levels added to `app/sitemap.ts` — generated from content, not hardcoded
- `coming-soon` levels: `noindex`

---

## Definition of Done

- [ ] `lib/content/` is the only module touching the filesystem; types in `types/content.ts`
- [ ] Adding a level = adding one `.md` file, no code edit (demonstrate this in the report)
- [ ] All 4 written levels render correctly from real content
- [ ] The 10 unwritten levels render as `coming-soon`, not blanks
- [ ] Vimeo player handles URL, bare ID, and unlisted `/HASH` links; fails gracefully
- [ ] CSP updated for `player.vimeo.com` only
- [ ] Build output still **all `○ Static`**
- [ ] Long-form Arabic typography checked at 1440 / 768 / 375; code blocks don't overflow
- [ ] localStorage progress works and degrades silently
- [ ] `content/README.md` written in Arabic, followable by a non-programmer
- [ ] Per-page metadata + JSON-LD + generated sitemap entries
- [ ] `node .github/skills/impeccable/scripts/detect.mjs .` → 0 anti-patterns
- [ ] eslint · tsc · vitest · build all PASS (see README for the node commands —
      `pnpm run` is broken on this machine)
- [ ] Screenshots: course index, course overview, a level with video, a
      `coming-soon` level — at 1440 / 768 / 375
- [ ] `KIMI_TASKS/reports/PHASE-C-REPORT.md`

## Out of scope

- Auth, accounts, payments, gating (undecided — the owner will specify)
- Rewriting landing-page copy or global SEO (Phase E)
- The services section (Phase D)
- Any database or CMS integration
