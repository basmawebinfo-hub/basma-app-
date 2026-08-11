# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, in priority order.

1. **Learners** — Arabic speakers who want to work in AI and automation and don't know
   where to start. Mostly Egypt and the Gulf. They can read English technical terms but
   learn far faster when the explanation is in Arabic. Many have no programming background.
2. **Buyers of the services** — people in Egypt who hit a wall subscribing to AI tools or
   online courses because their cards don't work internationally.

## Product Purpose

BASMA (بصمة) is an Arabic-first AI academy with an agency attached.

The academy is the *BASMA AI Automation Engineer Roadmap*: 14 progressive levels in Arabic
taking someone from how to think about a problem, through Python and developer foundations,
to APIs, webhooks, n8n, and AI agents. Four levels are written; the rest are in progress.
Video is hosted on Vimeo.

The services solve practical blockers the same audience hits. The first live one: BASMA
pays for a customer's subscription on **their own** account, and the customer pays locally
in EGP via Vodafone Cash, e-wallet, or bank transfer.

Success means someone with no background can follow the roadmap in their own language, and
isn't stopped by a payment wall on the way.

## Positioning

The marketing surface leads with "طريقك تبقى AI Automation Engineer" — a structured Arabic
path into a field whose learning material is almost entirely English-first. The
differentiator is the language and the sequencing, not the subject matter.

**BASMA is no longer a WhatsApp automation platform.** That product was retired; every
string, section, and claim describing it was removed in Phase E.

## Operating Context

- Fully static marketing site. No backend, no database, no accounts, no forms.
- Arabic default with an English toggle persisted in `localStorage` (`basma_lang`).
  English is a locale toggle, **not a route** — there is no `/en`.
- All enquiries go to one WhatsApp number, defined once in `config/contact.ts`.
- Academy pages and the Vimeo player are not built yet (Phase C). The home page presents
  the roadmap and routes interest to WhatsApp.
- **No pricing is published.** The WhatsApp plan table was removed; service pricing is
  agreed per conversation.

## Capabilities and Constraints

- Static Next.js only — every route must build as `○ Static`.
- Site must build fully offline: `next build` passes with no network fetches.
- Brand color is legally fixed: lime `#ABE707` (`oklch(0.855 0.218 126.3)`).
- Dark theme is the only shipped theme.
- **Evidence rule:** nothing on the site may state a number, credential, or outcome the
  business cannot evidence today. No student counts, no success rates, no testimonials,
  no uptime or performance figures. This rule exists because the previous copy advertised
  "200+ integrations", "99.9% uptime" and "200ms webhook latency" for a product that had
  already been deleted.
- **Services copy rule:** the subscription service pays for the customer's own account.
  Never describe it as selling, reselling, or sharing accounts.

## Brand Commitments

- Name: BASMA / بصمة. Logo: lime fingerprint mark + "BASMA" wordmark
  (`public/basma-logo.png`, transparent PNG — no SVG source exists).
- Voice: confident, direct, technical-but-friendly. Egyptian Arabic on the marketing
  surface; English is a full parity locale, not the source.
- Brand lime `#ABE707` is non-negotiable (registered brand asset).

## Evidence on Hand

- Real product copy in both locales: `lib/i18n.tsx` (all marketing strings keyed, ar/en).
- Logo and icon assets: `public/basma-logo.png`, `public/basma-icon.png`.
- Course content: `D:\Basma agancy\BasmaProgram` — four written levels plus the roadmap PDF.
- **No customer evidence of any kind exists yet.** The demo testimonials and headshots
  (`public/professional-*.png`) were removed along with their component in Phase E and must
  not be reintroduced as if they were real customers.

## Product Principles

1. **Arabic-first, never translated-as-afterthought** — layout, typography, and copy are
   designed RTL-first; English is a full parity locale, not the source.
2. **Say only what is true today** — the roadmap is unfinished and the site says so. An
   honest "four of fourteen written" outperforms a claim that collapses on contact.
3. **One accent, used sparingly** — the brand lime is a signature, not a wash; the
   interface stays near-black and quiet so the accent means something.
4. **Content visible by default** — no scroll-gated reveals, no mystery navigation;
   the page reads top to bottom without interaction.

## Accessibility & Inclusion

- WCAG AA contrast is a hard requirement for every foreground/background pair
  (verified table: `KIMI_TASKS/reports/contrast-table.txt`).
- Full keyboard operability, visible focus rings, skip link, and 44px touch targets
  (verified 0 targets under 44px at 375px).
- `prefers-reduced-motion` is honored globally (framer-motion `MotionConfig` + CSS).
