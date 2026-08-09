# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Arabic-speaking business owners and operators (small and mid-size businesses) who run their
sales and customer support on WhatsApp. Their job: respond to customers fast, run campaigns,
and connect WhatsApp to the rest of their stack — without writing code or hiring developers.
A secondary audience is the agency's own academy students learning AI automation in Arabic.

## Product Purpose

BASMA (بصمة) is an Arabic-first WhatsApp automation SaaS. It connects WhatsApp numbers,
runs bulk campaigns, sets auto-reply rules, and exposes a per-user REST API and per-user
webhooks so customers can wire WhatsApp into n8n, Make, and Zapier with zero code.
Success means a business owner can go from signup to an automated, integrated WhatsApp
presence in minutes, entirely in Arabic.

## Positioning

The marketing surface leads with "أتمت أعمالك على واتساب بدون أي كود" — zero-code WhatsApp
automation with 200+ integrations (n8n, Make, Zapier, Webhook, API), delivered Arabic-first.
Neighboring tools are English-first dashboards; BASMA's differentiator is the Arabic-first
product, support, and academy wrapped around the same plumbing.

## Operating Context

- Marketing landing page (this repo's current surface) with Arabic as the default locale and
  a full English locale toggle persisted in `localStorage` (`basma_lang`).
- Pricing is published on the page: Free, $20, $50, $100, $200/mo, and Custom tiers.
- Planned/attached surfaces (referenced in the codebase and i18n, not part of the current
  static marketing site): admin dashboard, billing/subscriptions, academy (Arabic courses
  on AI automation), Telegram bot for notifications and support.

## Capabilities and Constraints

- WhatsApp connectivity via Evolution API; per-user REST API and webhooks.
- Integrations: n8n, Make, Zapier, Webhook (200+ advertised).
- The current repo state is a fully static marketing site (no backend connected);
  README documents the fuller SaaS stack (Supabase, Evolution API, Telegram bot).
- Site must work fully offline-built: `next build` passes with no network fetches.
- Brand color is legally fixed: lime `#ABE707` (`oklch(0.855 0.218 126.3)`).
- Dark theme is the only shipped theme.

## Brand Commitments

- Name: BASMA / بصمة. Logo: lime fingerprint mark + "BASMA" wordmark
  (`public/basma-logo.png`, transparent PNG — no SVG source exists).
- Voice: confident, direct, technical-but-friendly; Arabic-first with full English parity.
- Brand lime `#ABE707` is non-negotiable (registered brand asset).

## Evidence on Hand

- Real product copy in both locales: `lib/i18n.tsx` (all marketing strings keyed, ar/en).
- Logo and icon assets: `public/basma-logo.png`, `public/basma-icon.png`.
- Testimonials and headshots on the page are placeholder/demo content
  (`public/professional-*.png`) — future work must not present them as real customers.
- README.md documents the intended full stack and feature set.

## Product Principles

1. **Arabic-first, never translated-as-afterthought** — layout, typography, and copy are
   designed RTL-first; English is a full parity locale, not the source.
2. **Zero code is the promise** — every claim on the page must stay true to a
   no-code buyer; technical depth (API, webhooks) is proof, not the pitch.
3. **One accent, used sparingly** — the brand lime is a signature, not a wash; the
   interface stays near-black and quiet so the accent means something.
4. **Content visible by default** — no scroll-gated reveals, no mystery navigation;
   the page reads top to bottom without interaction.

## Accessibility & Inclusion

- WCAG AA contrast is a hard requirement for every foreground/background pair
  (verified table: `KIMI_TASKS/reports/contrast-table.txt`).
- Full keyboard operability, visible focus rings, skip link, and 44px touch targets.
- `prefers-reduced-motion` is honored globally (framer-motion `MotionConfig` + CSS).
