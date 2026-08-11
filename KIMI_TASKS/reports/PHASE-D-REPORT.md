# Phase D — Implementation Report

**Implemented by:** Claude (Opus 5), at the owner's request — not delegated to Kimi.
**Date:** 2026-08-10

## Gates

| Gate | Result |
|------|--------|
| eslint | ✅ PASS |
| tsc --noEmit | ✅ PASS |
| vitest | ✅ 3/3 |
| next build | ✅ **10 routes, all `○ Static`** |
| Impeccable detector | ✅ 0 anti-patterns |

> `pnpm run <script>` is still broken on this machine (`cmd.exe` missing from
> System32). All gates were run through `node` directly — see `README.md`.

## What was built

| File | Purpose |
|------|---------|
| `config/contact.ts` | **Single source of truth** for the WhatsApp number + `whatsappLink()` |
| `config/services.ts` | Service catalogue + `AI_SUBSCRIPTION_TERMS` (fee/turnaround placeholders) |
| `components/services/whatsapp-cta.tsx` | The one enquiry path, prefilled per entry point |
| `app/services/page.tsx` + `services-index.tsx` | Services index, metadata |
| `app/services/ai-subscriptions/page.tsx` + `service-page.tsx` | The service page, metadata, `Service` JSON-LD |
| `components/services-teaser.tsx` | Home-page entry point |
| `lib/i18n.tsx` | ~50 new keys, ar + en, with the copy constraint documented inline |

**Wired into:** navbar, footer (product column), home page (between Stats and
Pricing), `app/sitemap.ts` (generated from `SERVICES`, so adding a service never
means remembering to edit the sitemap).

## Decisions worth reviewing

**1. Copy framing held throughout.** Verified programmatically against the
rendered page — no instance of "we sell / resell / shared account" in either
locale. The account-ownership statement appears in three places: the solution
block, FAQ 1, and FAQ 2. The `Service` JSON-LD describes it the same way;
structured data that overstates the offering is as much of a liability as body
copy that does.

**2. No invented numbers.** `AI_SUBSCRIPTION_TERMS.fee` and `.turnaround` are
`null`. The UI falls back to "بنتفق عليها في المحادثة حسب الأداة والباقة" —
verified rendering. **Replacing the two nulls is all that's needed to publish
real terms.**

**3. No payment details on the page.** Wallet/bank numbers change and belong in
the conversation. The page says so explicitly.

**4. No fabricated trust signals.** No testimonials, no customer counts. The
existing site testimonials are flagged as placeholders in `PRODUCT.md` and were
deliberately not reused here.

**5. Dead Twitter link removed.** `components/footer.tsx` had `href="#"`. Replaced
with the WhatsApp contact showing the real number. BASMA has no social accounts —
`basmaweb.ai` is the WhatsApp identity.

## Two bugs found and fixed while building

**Anchor links broke off the home page.** Navbar, footer, hero, final-CTA, and
pricing all used bare `href="#pricing"`. Those components now render on
`/services` too, where a bare fragment resolves to the *current* page and goes
nowhere. All changed to `/#pricing` etc. **This was a pre-existing latent bug** —
it only became reachable once a second page existed.

**Skip link target missing on new pages.** `app/page.tsx` has `<main id="main">`
for the Phase B skip link. New pages needed the same `id` or the skip link would
land nowhere. Added to both.

## Verified in the browser

- Both routes render; 1 `h1` each; `main#main` present
- 3 WhatsApp links on the service page, all `wa.me/201281926228`, all
  `target="_blank" rel="noopener noreferrer"`, each with a different prefilled
  message (services / ai-service / footer)
- JSON-LD: `Organization` + `Service`
- Zero untranslated i18n keys on either page in either locale
- EN renders LTR with icons flipped; AR renders RTL

Screenshots: `shots-phase-b/svc-index-*`, `svc-page-*`, `svc-page-en-*`
(1440 / 768 / 375).

## Polish applied after first review

The services index used `sm:grid-cols-2` with one card, leaving it hanging off
one side. Now adapts to `SERVICES.length` — a lone card centres, and it becomes a
real grid automatically when a second service is added.

## ⚠️ Open items for the owner

1. **Service fee and turnaround are still placeholders.** The page is honest
   without them, but "agreed in the conversation" converts worse than a number.
   Supply both and edit `config/services.ts` — two lines.
2. **Payment-intermediation rules.** Taking customer funds to purchase services
   on their behalf may carry regulatory obligations in Egypt. Worth proper advice
   before scaling. Not a website problem — a business one.
3. **Refund promise.** FAQ 3 currently commits to a refund if the subscription
   can't be completed. Confirm that matches what you actually intend to do; it is
   a written commitment on a public page.
4. **Privacy and Terms still describe the WhatsApp platform.** A page asking for
   payments links to legal pages about a product that no longer exists.
   **This should be fixed before the site is publicly promoted** — it's the
   weakest point on the path to publishing. Phase E owns it.
5. **The rest of the landing page still sells WhatsApp automation.** A visitor
   lands on "أتمت أعمالك على واتساب", then finds an AI-subscriptions service.
   Phase E is now the blocker to publishing, not a tidy-up.
