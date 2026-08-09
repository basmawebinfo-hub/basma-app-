# Project Status Board

**Manager:** Claude (Opus 5) — reviews · **Implementer:** Kimi K3 — builds
**Last updated:** 2026-08-08 — **product pivot, plan replaced**

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
| **B** | Design system | Fonts (currently fake), brand color system, spacing, motion, RTL, a11y — driven by **Impeccable** | 🟦 **Ready — start here** | A ✅ |
| **C** | Academy | 14 levels: content pipeline from markdown, level pages, navigation, **Vimeo** embeds | ⬜ | B |
| **D** | Services | Single "الخدمات" page — **coming soon placeholder**, no detail yet | ⬜ | B |
| **E** | SEO & performance | Metadata rewrite, structured data, i18n/hreflang, CSP enforce, LCP | ⬜ | C, D |
| **F** | Deploy | GitHub → Vercel → production hosting + domain | ⬜ | E |

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
| 2026-08-08 | A | ✅ Approved, no rework | Independently verified: **157 files deleted**, zero dangling imports, zero links to dead routes, removed deps confirmed unimported. Build output is **8 routes, all `○ Static`** — no middleware, no dynamic routes, no server. Pixel-diffed all 5153px of `/` against production: max band delta **0.22/255**. Pricing section renders all six plans from static data. All four gates re-run by Claude. |

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
