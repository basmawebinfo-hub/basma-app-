# Phase E — Repositioning, Copy & SEO

**Implemented by:** Claude (Opus 5) · 2026-08-10
**Decisions taken by the owner:** remove pricing · remove the WhatsApp-product
sections · position on the academy ("طريقك تبقى AI Automation Engineer")

## Gates

| Gate | Result |
|------|--------|
| eslint | ✅ PASS |
| tsc --noEmit | ✅ PASS |
| vitest | ✅ 3/3 |
| next build | ✅ 9 routes, all `○ Static` |
| Impeccable detector | ✅ 0 anti-patterns |

## What changed

### Removed — a product that no longer exists

Deleted outright: `video-gallery` · `stats` · `how-it-works` · `pricing` ·
`testimonials` · `use-cases` · `quick-start` · `logo-cloud`.

The `stats` section is the one worth naming: it advertised **"200+ integrations",
"99.9% uptime", "200ms webhook latency"** — measurements of infrastructure that
had already been deleted in Phase A. Those weren't stale strings, they were false
claims, sitting one scroll above a page that asks people to send money.

The pricing table sold WhatsApp number plans ($20–$200/mo) for a retired product.

### The new page

`Hero → Academy → Services → FAQ → Final CTA → Footer`

- **Hero** — "طريقك تبقى AI Automation Engineer". The fake WhatsApp support-chat
  demo (typewriter cycling "What is the price?", "n8n / Zapier / Make" logos) is
  gone. The bottom strip now lists skills the roadmap genuinely covers —
  Python, APIs & Webhooks, n8n, AI Agents, RAG, Prompt Engineering — every one
  taken from the level content, none aspirational.
- **Academy** (new) — the 14-level roadmap. **Only the four written levels are
  named.** The remaining ten are counted, not invented. Naming levels that don't
  exist would be the same failure as the copy this replaced.
- **FAQ** — five new questions. `faq.a3` says plainly that four of fourteen
  levels are written and "مش هنقولك إنه جاهز وهو مش جاهز".
- **Final CTA** — routes to WhatsApp and to services.

### Dictionary rebuilt

`lib/i18n.tsx`: **700 lines → 188**. Every surviving key is used by live code;
every dead platform string is gone. A rule is documented at the top: nothing may
state a number, credential, or outcome the business cannot evidence.

### SEO

| Field | Before | After |
|-------|--------|-------|
| Title | "أول منصة عربية لأتمتة واتساب" | "بصمة \| طريقك تبقى AI Automation Engineer" (~57 chars) |
| Description | WhatsApp automation pitch | Learning intent + the no-card differentiator (~150 chars) |
| Keywords | 20 WhatsApp terms | Intent-led: "تعلم الذكاء الاصطناعي بالعربي", "الاشتراك في ChatGPT من مصر", … |
| JSON-LD | `Organization` | `EducationalOrganization` + description + `contactPoint` + `areaServed` |
| OG / Twitter | WhatsApp copy | Rewritten |

**Bug fixed:** `alternates.languages` declared an `hreflang` alternate at
`/en` — **a route that has never existed.** The ar/en toggle is client-side
`localStorage`, not routing. Advertising a 404 as a language alternate is worse
than declaring none, so the map was removed with a comment explaining when to
add it back.

### Legal pages rewritten

Both described the retired platform — sign-up accounts, message storage, webhook
delivery, plan limits, API keys, uptime.

- **Privacy** now describes what the site actually is: static, no accounts, no
  database, no forms; the only data flow is a WhatsApp conversation the visitor
  starts, plus anonymous analytics. Explicit that payment happens entirely
  off-site and no card data is ever received.
- **Terms** cover the two real offerings. §3 states the account-ownership
  position and §4 the refund commitment — **deliberately worded to match the
  service page**, so the marketing claim and the legal page cannot drift apart.

### Design-system docs realigned

`PRODUCT.md` rewritten (users, purpose, positioning, constraints). `DESIGN.md`
description updated. Two rules are now written into `PRODUCT.md` as constraints
for every future phase: the **evidence rule** and the **services copy rule**.

## Verified in the browser

- **Zero** untranslated i18n keys on the page
- **Zero** WhatsApp-product remnants in user-facing copy (the only repo matches
  are code comments explaining the removal; "Webhooks" survives only as a
  genuine roadmap topic)
- All 9 internal links resolve; all 4 anchor targets (`#main`, `#academy`,
  `#faq`, `#footer`) exist
- 1 `h1`, correct `h2` outline
- ar renders RTL, en renders LTR

Screenshots: `shots-phase-b/e-home-*` (ar) and `e-home-en-*` (en) at
1440 / 768 / 375.

## ⚠️ Open for the owner

1. **The academy CTA goes to WhatsApp, not to `/academy`** — those pages are
   Phase C. Nothing links to a 404, but the roadmap is currently a promise with
   no page behind it. **Phase C is now the highest-value work**: the whole site
   positions on a roadmap that can't yet be read.
2. **Service fee and turnaround are still placeholders** (`config/services.ts`).
   Two lines to fill.
3. **`public/professional-*.png`** (demo headshots) are now unreferenced —
   deletable. Left in place because deleting assets wasn't in scope.
4. **Terms §4 commits to a refund** if a subscription can't be completed, and
   §5 limits liability to the amount paid. Read both and confirm they match how
   you actually intend to operate — they are now public commitments.
