# Project Status Board

**Manager:** Claude (Opus 5) — reviews · **Implementer:** Kimi K3 — builds
**Last updated:** 2026-08-12 — **Phase H built**, awaiting review

> ⚠️ **Phase H had two implementers.** Kimi committed T-H.0–T-H.2 then stopped
> mid-T-H.3; Claude finished T-H.3–T-H.11. Do not re-run the Phase H prompt
> against Kimi — see `reports/PHASE-H-REPORT.md` §0.

---

## ⚠️ The plan changed

The WhatsApp automation platform is being retired. BASMA becomes:

1. **Academy** — *BASMA AI Automation Engineer Roadmap*, 14 Arabic levels
   (content lives at `D:\Basma agancy\BasmaProgram`)
2. **Services** — agency service pages (scope TBD)

**No database. No auth. No API routes.** Content ships as files in the repo.

`PHASE-0`–`PHASE-6` are archived in `_archive/` and are **obsolete** — they
describe billing, campaigns, webhooks, and RLS for a product that no longer
exists. Do not work from them. `FINDINGS.md` is kept for history only; most of
it dies with the code it describes.

---

## Roadmap

| # | Phase | What | Status | Depends on |
|---|-------|------|--------|------------|
| **A** | Demolition & clean slate | Delete backend, DB, WhatsApp, Telegram, billing. Site stays visually identical. | ✅ **Approved** 2026-08-08 | — |
| **B** | Design system | Fonts, brand color system, spacing, motion, RTL, a11y — driven by **Impeccable** | ✅ **Approved** — T-B.10 + T-B.11 fixed by Claude 2026-08-10 | A ✅ |
| **C** | Academy | Content layer, 14 level pages, Vimeo player, owner-authorable via markdown | ✅ Built — **⏸ HELD BACK**, awaiting its own design (Phase G) | B ✅ |
| **D** | Services | `/services` + the **AI-subscriptions** service, live | ✅ **Done** — built by Claude 2026-08-10, `reports/PHASE-D-REPORT.md` | B ✅ |
| **E** | SEO & copy rewrite | **Full repositioning** — done: page rebuilt, dictionary 700→188 lines, SEO + JSON-LD + legal pages rewritten | ✅ **Done** — Claude 2026-08-10, `reports/PHASE-E-REPORT.md` | C, D |
| **G** | **Brutalist redesign + catalogue** | Catalogue + USD pricing live; radius 0, grain, hard structure | ✅ **Done** — Claude 2026-08-10, `reports/PHASE-G-REPORT.md` | E ✅ |
| **H** | **Hero rebuild + landing structure** | Hero is two bands not a floating footer; lime back inside budget; the page gets its missing middle | 🟨 **Built, awaiting review** 2026-08-12 — Kimi T-H.0–2, Claude T-H.3–11, `reports/PHASE-H-REPORT.md` | G ✅ |
| **F** | Deploy | GitHub → Vercel → production hosting + domain | 🟦 **Ready** — *hold until H is reviewed* | G ✅, H 🟨 |

---

## ⏸ Academy on hold (2026-08-10)

The academy is **built and correct** — 14 levels, real roadmap content, working
pipeline — but held back until its own visual design is decided. It gets a
distinct treatment from the rest of the site.

**What was done, not undone:**
- Removed from navbar, footer, and all CTAs — **zero `/academy` links remain**
  (verified in the browser)
- `robots: { index: false, follow: false }` on the index, the course page, and
  every level page
- Removed from `app/sitemap.ts`
- Home-page roadmap section stays as a قريبًا teaser with a WhatsApp CTA
- Hero primary CTA is now **الخدمات** — the thing a visitor can act on today

**Nothing was deleted.** All 26 routes still build and still work. Reversing this
is: restore the links, flip three `robots` values, re-add the sitemap entries.

**Backend is explicitly deferred.** Front-end first, all of it. The database gets
connected only when the owner says so, after moving to real hosting. Nobody adds
auth, a CMS, or an API "to prepare for later."

**Legend:** ⬜ not started · 🟦 in progress · 🟨 awaiting review · ✅ approved · 🟥 rejected

---

## What survives Phase A

Verified by inspection — the marketing layer is almost entirely backend-free:

| Kept | Note |
|------|------|
| `app/page.tsx`, `layout.tsx`, `error/not-found/loading`, `globals.css` | |
| `app/privacy`, `app/terms`, `robots.ts`, `sitemap.ts` | copy needs rewriting in Phase E |
| `components/*.tsx` (15 marketing components) | **14 of 15 already have zero backend deps**; only `pricing.tsx` is coupled |
| `components/ui/*` (~50 shadcn primitives) | many orphaned after the dashboard dies — listed in Phase A, cleaned later |
| `lib/i18n.tsx`, `lib/utils.ts`, `lib/logger.ts` + its test | logger kept so `pnpm test` stays green |
| `hooks/use-mobile`, `use-toast`, `useBreakpoint` | |

**Deleted:** 54 API routes · all of `supabase/` · `middleware.ts` · dashboard ·
admin · auth · Evolution · Telegram · billing · rate-limit · RLS · types/

---

## Known issues carried into Phase B

Found during review, not yet fixed — these belong to the design phase:

| # | Issue | Where |
|---|-------|-------|
| **D1** | **Fonts are fake.** `const _cairo = { variable: "font-sans" }` — these are stub objects, no font is loaded. An Arabic-first, design-led site is rendering on system fallbacks. Was done to make offline builds work (see archived `PROJECT_MEMORY/NEXT_SESSION.md`). Needs `next/font/local` with self-hosted Cairo/Rubik. | `app/layout.tsx:11-13` |
| **D2** | `images: { unoptimized: true }` — no WebP/AVIF, no responsive srcset, full-size images on a conversion-critical marketing site. | `next.config.mjs` |
| **D3** | CSP is Report-Only and has been since it was written; the comment describes a flip that never happened. | `next.config.mjs` |
| **D4** | Brand assets exist but aren't wired: 4 logo variants in `BasmaProgram/Basma color vision/`. Palette now extracted — see below. | — |
| **D5** | `dir="rtl"` + `lang="ar"` are hardcoded on `<html>` while a language toggle exists — the EN mode renders LTR content in an RTL document. | `app/layout.tsx:71` |

---

## What BASMA is now (repositioning, 2026-08-10)

**BASMA is no longer a WhatsApp automation platform.** It is an Arabic-first
company with two offerings:

**1. Academy** — the *BASMA AI Automation Engineer Roadmap*. 14 levels planned,
4 written. Video on **Vimeo**. The owner adds courses himself; a dashboard may
come later, and how access is "opened" is **undecided** — so Phase C must keep
the content layer swappable and add no auth.

**2. Services** — agency services. The first one is live-ready:

> **AI subscriptions without an international card.** Many people in Egypt can't
> subscribe to AI tools or online courses because their cards don't work
> internationally. They pay BASMA locally — Vodafone Cash, e-wallet, or bank
> transfer — and BASMA covers the subscription on **their own** account.

> ⚠️ **Copy constraint, carried into Phase D.** This must be described as
> *paying for the customer's own subscription on their behalf* — never as
> selling or sharing accounts. Most AI providers ban resale and shared access;
> accounts that look resold get terminated and the customer loses access **and**
> money. The concierge framing is both safer and a more accurate description of
> what actually happens. Separately, the owner should get proper advice on
> payment-intermediation rules in Egypt before scaling — that is a note for him,
> not text for the website.

More services will be added later. **Do not invent placeholder services to fill
a grid.**

### Owner-supplied facts (use these; do not invent alternatives)

| Item | Value | Notes |
|------|-------|-------|
| WhatsApp contact | **+20 128 192 6228** | International form for links: `201281926228` · `wa.me/201281926228` |
| Handle | **basmaweb.ai** | WhatsApp identity. **Not a separate social account.** |
| Vimeo | **none yet** | No account, no videos uploaded. Phase C builds the player + placeholders; real IDs land later. |

**Store the number in exactly one place** — `config/contact.ts` — and derive the
`wa.me` link and any display formatting from it. It must never be pasted into
JSX, and never into two files.

**Resolved:** BASMA has **no social accounts yet** — `basmaweb.ai` is the
WhatsApp identity, not a separate handle. Therefore:

> **Remove the dead Twitter link** in `components/footer.tsx` (currently
> `href="#"`) and replace it with the WhatsApp contact built from
> `config/contact.ts`. A dead social icon on a page asking people to send money
> costs trust for nothing. Do not add Instagram/X/TikTok icons until real
> accounts exist.

### Consequence: every user-facing string on the site is now wrong

Hero, pricing, FAQ, how-it-works, use-cases, stats, testimonials, privacy,
terms, the whole `lib/i18n.tsx` dictionary, and every SEO field in
`app/layout.tsx` still describe the WhatsApp platform. **Phase E owns this
rewrite** — it is no longer a tidy-up, it is the repositioning itself, and it is
the last thing standing between this site and being publishable.

---

## Design tooling & brand

**Impeccable** v4.0.4 (github.com/pbakaus/impeccable) is installed as the design
authority. Full usage guide: **`KIMI_TASKS/IMPECCABLE.md`**.

| Location | Path | Who |
|----------|------|-----|
| Global | `~/.claude/skills/impeccable/` | Claude (auto-loads) |
| Project | `.github/skills/impeccable/` | Kimi — reads the markdown directly |
| CLI | `npx impeccable detect .` | Anyone — 59 deterministic rules, no harness needed |

> **Kimi Code is not a supported harness** — `/impeccable <cmd>` won't work for
> Kimi. Kimi uses the CLI detector plus the reference markdown. Anything needing
> live browser iteration is Claude's job.

**Brand palette** — sampled from `BasmaProgram/Basma color vision/logo.png`:

| Token | Hex | Role |
|-------|-----|------|
| Brand green | `#ABE707` | accent only — `hsl(76, 97%, 47%)` |
| Black | `#000000` | base surface |
| White | `#FFFFFF` | primary foreground |

The green has excellent contrast on black and **fails WCAG on white**. Dark-first
is therefore the correct default (already the case) and green stays an accent —
never body text. A darkened variant is required for any light-surface use.

---

## Content inventory (for Phase C)

Source: `D:\Basma agancy\BasmaProgram`

- `BASMA AI Automation Engineer Roadmap.pdf` — 13.5 MB, the full 14-level roadmap
- `Level-01` … `Level-04` — written as Arabic markdown (`.md`), **4 of 14 done**
- `Levels/Level-NN/01-Script-الشرح.md` + `Levels/Level-NN/Videos/` per level
- `style.file/` — 27 source PDFs (Chapters 1–3 + bonuses), reference material
- `Basma color vision/` — 4 logo PNGs

**Level content shape** (from Level-01): H1 title + Arabic subtitle → level goal →
numbered sections, each with `الشرح المبسط` / `مثال عملي` (often a fenced ASCII
workflow) / `مصادر ومراجع` (external links) / `أسئلة تقييم` (numbered questions).
Consistent enough to parse and render structurally.

**Video hosting: Vimeo.** Levels embed Vimeo players — no self-hosting, no CDN
work, no storage. Each `Levels/Level-NN/Videos/` folder is a placeholder for the
Vimeo IDs, which the owner supplies.

**Access model: open.** No login, no paywall, no progress tracking in the
database — that is what keeps the site fully static. If gated access is ever
wanted, it is a deliberate later decision that reintroduces auth, and it should
be argued for on its own, not slipped in.

**Only 4 of 14 levels are written.** Phase C must render whatever levels exist
and degrade cleanly for the missing ones — not hardcode 14 pages and ship ten
blanks.

---

## Review log

| Date | Phase | Verdict | Notes |
|------|-------|---------|-------|
| 2026-08-08 | — | — | Initial review of WhatsApp platform: 30 findings, 7 phases planned |
| 2026-08-08 | 0 | ✅ Approved w/ 1 fix | Schema rebuild verified independently: 23/23 tables, 0 column mismatches. Found privilege escalation in `rls.sql` (T0.9). **Now moot — `supabase/` is deleted in Phase A.** |
| 2026-08-08 | — | 🔄 Plan replaced | Product pivot to academy + services. Phases 0–6 archived; A–F defined. |
| 2026-08-10 | B | 🟨 Approved w/ 2 fixes | Verified independently: detector **1 → 0** re-run by Claude; fonts are genuinely self-hosted OFL woff2; contrast table's single "FAIL" is the *documented intentional* green-on-white constraint (22 pairs pass, `primaryOnLight` provided); 0 raw `<img>`; skip link + single `h1` + `main` landmark live; build still 8/8 static. **Found by live browser measurement: (1) Arabic renders in an Arial-derived fallback, not Plex Arabic — the core deliverable of T-B.1; (2) 17 mobile touch targets under 44px, several at 16px (WCAG 2.5.8 AA failure).** See T-B.10 / T-B.11. |
| 2026-08-08 | A | ✅ Approved, no rework | Independently verified: **157 files deleted**, zero dangling imports, zero links to dead routes, removed deps confirmed unimported. Build output is **8 routes, all `○ Static`** — no middleware, no dynamic routes, no server. Pixel-diffed all 5153px of `/` against production: max band delta **0.22/255**. Pricing section renders all six plans from static data. All four gates re-run by Claude. |
| 2026-08-11 | G → H | 🟥 Hero rejected | Live measurement of the shipped hero: primary CTA sits **below the fold at 1280×650** (bottom 687, fold 650); skills strip overlaps the CTAs by **40px** there and **41px** at 375×812; `.block-lime` covers **14.3% / 17.9%** of the viewport against the ≤10% One Voice budget; Arabic `h1` ink box is **122px in a 100.8px line box**; `.meta-ar` renders Arabic in an Arial-derived fallback (**T-B.10 reintroduced**); the corner field doesn't mirror in EN; the loudest CTA on the page points at a **قريبًا** section. Spec: `phases/PHASE-H.md`. |
| 2026-08-10 | B | 🟨 Submitted for review | Kimi: all 9 tasks done. Fonts self-hosted (Plex Arabic + Space Grotesk + Plex Mono, OFL-1.1); full OKLCH token system, 18/18 WCAG AA; shared spacing conventions; motion tokens + reveals removed + reduced-motion; logical props + RTL icon flips; skip link / 44px targets / focus rings; next/image restored; PRODUCT.md + DESIGN.md written. Detector **1 → 0**. Gates: build/lint/tsc/vitest all PASS. See `reports/PHASE-B-REPORT.md`. |

---

## Required fixes before Phase C — ✅ BOTH DONE (by Claude, 2026-08-10)

**T-B.10 — fixed.** `adjustFontFallback: false` added to the `spaceGrotesk`
`localFont()` call in `app/layout.tsx`, with a comment explaining why it must
stay off. The stack is now
`spaceGrotesk, plexArabic, "plexArabic Fallback", "Segoe UI", …` — no
Arabic-capable fallback ahead of Plex.

Verified by measurement, spaceless Arabic string at 40px:

| | width |
|---|---|
| shipped stack | **415.84px** |
| `plexArabic` alone | **415.84px** |
| **identical** | ✅ |

(With spaces the stack measures 5px wider than Plex alone — that is correct: the
space character U+0020 is claimed by Space Grotesk, which is exactly the
per-glyph behaviour the Latin-first ordering is for. Latin also confirmed
unchanged: stack 370.53px = Space Grotesk alone 370.53px.)

**T-B.11 — fixed.** Mobile (375×812) target audit: **17 → 0** under 44px, and
**0** under the WCAG 2.5.8 AA floor of 24px. Desktop re-checked: 0 under 24px,
no horizontal overflow.

| Element | Fix |
|---------|-----|
| 7 footer nav links (16px) | `inline-flex items-center w-full sm:w-auto min-h-11 sm:min-h-6`; `ul` spacing → `space-y-0 sm:space-y-2` so mobile rows don't double-gap |
| Twitter icon (16×16) | `inline-flex items-center justify-center min-h-11 min-w-11` |
| Footer + navbar logo links (32px) | `min-h-11` |
| 6 pricing CTAs (40px) | `min-h-11` |
| Hero demo "جرّب" (32px) | `::after` overlay gives a 44px hit area **without** growing the visual button — it has to stay small to fit inside the demo input |

Gates after the fixes: eslint ✅ · tsc ✅ · vitest 3/3 ✅ · build ✅ 8/8 static ·
Impeccable detector ✅ 0 anti-patterns.

<details>
<summary>Original findings (kept for the record)</summary>

### T-B.10 — Arabic is NOT rendering in IBM Plex Sans Arabic 🔴

The headline purpose of T-B.1 was to put a real Arabic face on the page. The
fonts are correctly self-hosted and loaded — but **the Arabic glyphs are being
rendered by an Arial-derived fallback, not by IBM Plex Sans Arabic.**

Measured live in the browser at `font-size: 40px`, same Arabic string:

| Stack | Rendered width |
|-------|---------------|
| **The shipped stack** | **547.2px** ← what users actually see |
| `plexArabic` alone | 578.48px |
| `plexArabic` placed first | 578.48px |
| Shipped stack minus the `* Fallback` entries | 583.53px |
| `"spaceGrotesk Fallback"` alone | 559.44px |
| `"plexArabic Fallback"` alone | 504.67px |
| `Arial` alone | **504.67px** ← identical, so the generated fallbacks are Arial |

The shipped width matches **neither** plexArabic nor plain Arial — it sits
between, exactly as an Arial-based fallback carrying a `size-adjust` metric
override would. Removing the fallback entries restores plex's metrics
(583.53 ≈ 578.48), which proves the ordering is the cause.

**Root cause.** The stack is:

```
spaceGrotesk, "spaceGrotesk Fallback", plexArabic, "plexArabic Fallback", "Segoe UI", …
```

`next/font/local` auto-generates `"spaceGrotesk Fallback"` from a system font —
here Arial — and **Arial has full Arabic coverage.** So Arabic never reaches
`plexArabic`; it is intercepted one slot earlier. The Latin-first ordering is
sound reasoning, but it only works if the Latin entry cannot claim Arabic
codepoints, and its auto-fallback can.

**Fix:** set `adjustFontFallback: false` on the `spaceGrotesk` `localFont()` call
so no Arabic-capable fallback is emitted ahead of `plexArabic`. Alternatively
constrain Space Grotesk with a Latin-only `unicode-range` via `declarations`.
Either works — pick one and say why.

**Verify with measurement, not by eye.** Re-run the width comparison above; the
shipped stack must match `plexArabic` alone. Paste the numbers in your report.
Also re-check the type scale afterwards — Plex Arabic's metrics differ from
Arial's, so line-heights tuned against the wrong font may need adjusting.

### T-B.11 — 17 touch targets under 44px on mobile 🟠

T-B.6 fixed three elements (lang toggle, hamburger, mobile close) and reported
the task done. Measured live at 375×812, **17 interactive elements are still
under 44px**, several far under:

| Element | Size |
|---------|------|
| Twitter icon (footer) | **16 × 16** |
| 7 footer links (المميزات، الأسعار، عن بصمة، الأسئلة الشائعة، تواصل معنا، الخصوصية، الشروط) | **16px tall** |
| 6 pricing CTAs (Choose Plan ×4, Start Free Trial, Contact Us) | 40px tall |
| Hero demo "جرّب" | 32px tall |
| Logo link | 32px tall |

The 16px ones fail **WCAG 2.5.8 (AA)**, which floors at 24×24 — this is a
conformance failure, not a preference. The 40px ones miss the 44px bar the phase
spec set.

**Fix:** raise every interactive target to ≥44px at mobile widths. Padding or a
pseudo-element hit area both work — the *visual* size does not have to grow, but
the hit area must. Footer link lists usually need vertical padding rather than
larger text.

**Verify:** re-run the measurement at 375px and report the count as **0**. The
1×1 skip link is correctly excluded (visually hidden until focused).

</details>

---

## Carried into Phase B (housekeeping, not blockers)

1. **`shots/` (2.2 MB) is in the repo root** — Phase A screenshot evidence. Move
   to `KIMI_TASKS/reports/shots/` or delete once Phase B's own baseline exists.
2. **Vendored Impeccable is 3.3 MB / 148 files** in `.github/skills/`. It is
   committed so a fresh clone still has it for Kimi (who can't auto-load the
   skill). Fine for now — revisit if repo size becomes a problem; `npx impeccable
   install` regenerates it.
3. **`eslint.config.mjs` now ignores `.github/**`** — Kimi's fix for ~230
   `no-console` errors from the vendored Impeccable CLI scripts. Correct call:
   those are external tooling, and app code is still held to `no-console: error`.
   Reviewed and accepted.
4. **CTAs point at on-page anchors** (`#pricing`, `#footer`, `#how-it-works`)
   because `/register` and `/login` no longer exist. Placeholders by design —
   final destinations are decided once the academy and services pages exist.
5. **All user-facing copy is still WhatsApp-platform copy** — hero, pricing
   feature lists ("WhatsApp 25 numbers", "HMAC signing"), `lib/i18n.tsx`
   dictionary, privacy/terms, and every SEO field in `app/layout.tsx`.
   Deliberately untouched. **Phase E owns the rewrite** — but note that Phase B
   tunes typography against this copy, so treat the *shape* of it as
   representative, not the words.
6. **Orphan chain:** `hooks/use-toast.ts` → `ui/toast.tsx` → `ui/toaster.tsx`,
   with nothing mounting `<Toaster />`. ~48 `components/ui/*` files are now
   unimported (full list in `reports/PHASE-A-REPORT.md`). Phase B decides what
   the design system actually needs before anything is deleted.
