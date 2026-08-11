# Phase C — Academy

**Implemented by:** Claude (Opus 5) · 2026-08-10

## Gates

| Gate | Result |
|------|--------|
| eslint | ✅ PASS |
| tsc --noEmit | ✅ PASS |
| vitest | ✅ 3/3 |
| next build | ✅ **26 pages, all prerendered** (`○` static + `●` SSG) |
| Impeccable detector | ✅ 0 anti-patterns |

## The real roadmap, recovered

The spec assumed only four level names were known. They weren't — the full
roadmap was in `BASMA AI Automation Engineer Roadmap.pdf`, unreadable because
`pdftoppm` isn't installed. Extracting the text layer with `pypdf` produced
**all 14 real level names** plus each level's "هتتعلم إيه؟" topic list.

That changed the outcome materially. Instead of 4 named levels and "10 more
coming", the site now shows the actual roadmap:

| | | |
|---|---|---|
| 01 AI Problem Solver | 06 JavaScript, TypeScript & Modern Web | 11 Deployment |
| 02 Python Fundamentals | 07 AI Engineering & LLM Applications | 12 Vibe Coding |
| 03 Developer Foundations | 08 RAG, AI Tools & AI Agents | 13 Vibe Automation |
| 04 Web, APIs & Webhooks | 09 AI Automation Engineering | 14 AI Automation Business |
| 05 Backend Development & Databases | 10 Real-World AI Automation Systems | |

**Arabic subtitles were retyped, not copied.** The PDF's text layer reverses
mixed Arabic/Latin runs — "يعني إيه Backend؟" extracts as "؟Backendيعني إيه".
Anything containing Arabic was transcribed by hand; the English topic lists were
taken verbatim.

Levels 5–14 ship as `coming-soon` **with their real topic lists**, so those pages
tell a visitor exactly what's coming rather than showing a locked blank.

## Architecture

`lib/content/` is the only module that touches the filesystem, behind four
functions typed in `types/content.ts`. Swapping to a CMS or database means
rewriting that one file — no page, component, or route changes.

**Adding a level is adding one `.md` file.** No registry, no index, no manifest.
Proven by the build: 14 level pages were generated purely from directory
contents. Slugs drop the numeric prefix (`12-vibe-coding.md` →
`/academy/…/vibe-coding`) so reordering a level never breaks its URL.

## What was built

| Path | Purpose |
|------|---------|
| `types/content.ts` | the contract |
| `lib/content/index.ts` | the only fs reader |
| `lib/progress.ts` | localStorage progress, same swap discipline |
| `content/courses/ai-automation-engineer/` | `course.json` + 14 level files |
| `content/README.md` | **Arabic authoring guide for the owner** |
| `components/academy/vimeo-player.tsx` | player + empty/error states |
| `components/academy/level-content.tsx` | markdown renderer |
| `components/academy/progress-parts.tsx` | progress bar, complete toggle, ticks |
| `app/academy/…` | index, course, level (all SSG) |

Deps added: `gray-matter` (frontmatter), `react-markdown` + `remark-gfm`
(rendering with tables; custom components let each content role be styled rather
than dumping raw HTML).

## Decisions worth reviewing

**1. Long-form Arabic was the hard part.** The source marks structure with bold
labels, not headings — `**الشرح المبسط:**`, `**مثال عملي:**`, `**مصادر:**`,
`**أسئلة تقييم:**`. Rendered as plain bold, a level is an undifferentiated wall
of Arabic. Each label now gets its own treatment; unknown labels fall back to a
normal paragraph, so new ones degrade quietly.

**2. The detector caught a real design failure.** The first version gave each
role a thick coloured side border. Impeccable flagged it (`side-tab`, "the most
recognisable tell of AI-generated UIs") and was right — six stacked down a page
read as a template. Replaced with quiet fills; sources now sit under a hairline
rule and recede like footnotes. **Fixed, not suppressed.**

**3. Video absent is the primary state, not the edge case.** No Vimeo account
exists, so every level renders the empty state. It's a designed panel explaining
the written content is complete and ready — not a gap where a player should be.

**4. Progress measures published levels only.** Counting against 14 when 10 are
unwritten would cap every student at 29%.

## Bugs found and fixed while building

**Role styling silently never fired.** The label matcher checked
`element.type === "strong"` — but `strong` is overridden in the renderer, so by
the time children arrive the type is that custom component, not the string.
Every label fell through to plain paragraph. Now matched on rendered text
instead of element type. **This was invisible without checking the DOM**; the
page looked plausible and was wrong.

**RTL reversed the progress counter.** `0 / 4` bidi-renders as `4 / 0` in an RTL
document — the opposite of its meaning. Fixed with `dir="ltr"` on the counter.

## Verified in the browser

- Level page: 1 `h1`, 17 section headings, 24 styled role blocks, code block in
  mono/LTR inside an `overflow-x-auto` wrapper, table renders, breadcrumb,
  prev/next, complete toggle
- Coming-soon page: notice + 8 real topics, `noindex, follow`, no player, no
  complete toggle, WhatsApp CTA, correct prev/next
- Zero untranslated i18n keys on any academy page

Screenshots: `shots-phase-b/c-course-*`, `c-level2-*`, `c-soon-*`.

## ⚠️ Open for the owner

1. **Vimeo, when you're ready:** create the account, upload, paste the link into
   the level file's `vimeo:` field. **If a video is unlisted, copy the whole link
   including the code after the number** (`vimeo.com/123456789/abc123def`) —
   dropping it makes the video silently fail. The player handles every format;
   `content/README.md` explains it.
2. **Vimeo privacy:** if the academy is ever paid, set videos to *"only on
   domains I choose"*. Otherwise anyone with the ID can watch outside the site.
   Worth configuring now while it's still open.
3. **Levels 5–14 topic lists came from the PDF.** Read them — if the roadmap has
   moved on, edit the files.
4. **Progress is per-browser.** Clearing storage or switching device loses it.
   That's the honest limit of having no accounts, and nothing on the page
   promises otherwise.
