# Phase D — Services

**Goal:** ship the services section with the first real service live — helping
people in Egypt subscribe to AI tools and online courses when they have no
international payment card.

**Prerequisite:** Phase B approved. Can run in parallel with Phase C.
**Backend:** none. Enquiries go to a channel the owner already reads.

---

## The service, as the owner described it

> Many people can't subscribe to AI models or online courses because they don't
> have a credit card that works internationally. BASMA solves that: you pay us
> locally — Vodafone Cash, any e-wallet, or bank transfer — and we handle the
> subscription for you.

This is a real, widely-needed service in Egypt. Build it.

### ⚠️ How it is described matters — read before writing any copy

Two framings, same operation, very different exposure:

| ❌ Avoid | ✅ Use |
|---------|-------|
| "We sell you ChatGPT/Claude accounts" | "We pay for **your** subscription on your behalf" |
| "Shared accounts", "cheap accounts" | "The account is yours, in your name, on your email" |
| Provider logos implying partnership | Plain text names, no logos, no "official" claims |
| No mention of who owns what | Explicit: customer owns the account and its credentials |

Most AI providers prohibit account resale and shared access in their terms —
accounts that look resold get terminated, and the customer loses both access and
money. A **payment-facilitation / concierge** framing (the customer's own account,
BASMA covers the payment as an agent, customer reimburses locally) avoids that
entirely and is also simply what the owner actually described.

**Kimi: write the copy in the ✅ column. If you find yourself writing "we sell
accounts", stop and flag it.** This is a copy constraint, not a legal opinion —
the owner should get proper advice on payment-intermediation rules in Egypt
before scaling, and that note belongs in your report, not on the website.

---

## T-D.1 — Services index — `/services`

Built to hold many services; **only one is real today.** Don't fabricate others
to fill the grid — an honest single-service page beats a padded one.

- Section intro: what BASMA does for people now (this is no longer a WhatsApp
  company — see the repositioning note in `STATUS.md`)
- A card for the live service linking to its page
- A short, honest "more services coming" affordance — **no fake names, no
  placeholder logos, no "coming soon" cards for services that don't exist yet.**
  One line is enough.

---

## T-D.2 — The service page — `/services/ai-subscriptions`

Structure it around the questions a hesitant buyer actually asks:

1. **The problem**, in one sentence they recognise — no international card, so
   the subscribe button is a dead end
2. **What you get** — the subscription active on *your own* account
3. **How it works** — numbered, concrete:
   1. Tell us which service and plan you want
   2. We confirm the price in EGP and what's included
   3. You pay — Vodafone Cash / e-wallet / bank transfer
   4. We complete the subscription on your account
   5. You get confirmation and it's live
4. **Payment methods** — Vodafone Cash, e-wallets, bank transfer. Do **not**
   hardcode account numbers or wallet numbers into the page; they change and
   they're better shared in the conversation. Put them in one config constant if
   the owner insists on showing them.
5. **What we cover** — AI tools, online courses, and similar digital
   subscriptions. Keep it general; don't enumerate brands you can't guarantee.
6. **Timing and pricing** — how long it takes, and how the fee works. **Leave
   these as clearly-marked `TODO` placeholders in a single constants file if the
   owner hasn't given numbers.** Never invent a price or a delivery time.
7. **FAQ** — is the account mine? (yes) · what if it fails? · which currencies ·
   do you see my password? (no — the customer keeps their credentials) · refunds
8. **CTA** — start the conversation

Write in Egyptian Arabic matching the existing site voice, with English
translations through `lib/i18n.tsx` like every other component.

---

## T-D.3 — Contact / enquiry flow

No backend, so no form handler. Pick the lowest-friction route that already works:

**Decided: WhatsApp deep link.** The owner supplied the number.

```ts
// config/contact.ts — the single source of truth
export const CONTACT = {
  whatsapp: "201281926228",          // +20 128 192 6228
  whatsappDisplay: "+20 128 192 6228",
} as const

export function whatsappLink(message: string): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`
}
```

- **The number goes in this file and nowhere else.** Never pasted into JSX,
  never duplicated. Every link is built by `whatsappLink()`.
- Prefill a message that names the service so the owner knows what the enquiry
  is about before reading it — e.g. `"السلام عليكم، عايز أستفسر عن خدمة الاشتراك في أدوات الذكاء الاصطناعي"`.
  Different entry points (services index vs service page vs footer) should
  prefill different text so the owner can tell where the lead came from.
- The message must be Arabic when the locale is `ar` and English when `en`.
- `rel="noopener noreferrer"`, opens in a new tab
- The CTA must be reachable from the services index, the service page, and the
  footer
- **Replace the dead Twitter link** in `components/footer.tsx` (`href="#"`) with
  the WhatsApp contact. BASMA has no social accounts yet — `basmaweb.ai` is the
  WhatsApp identity, not a separate handle. Do not add Instagram/X/TikTok icons
  for accounts that don't exist.

---

## T-D.4 — Wire it into the site

- Navbar + footer links to `/services`
- A services section on the home page (from `DESIGN.md` patterns — no new visual
  language)
- `/services` and `/services/ai-subscriptions` in `app/sitemap.ts`
- Per-page metadata via `generateMetadata`; `Service` JSON-LD

---

## T-D.5 — Trust

People are being asked to send money to a website. The page has to earn that.

- Clear contact identity — who BASMA is, how to reach a human
- Set expectations explicitly: what happens after payment, how long, what if it
  fails
- Do **not** fabricate trust signals. No invented testimonials, no fake customer
  counts, no "trusted by 5,000+" numbers. `PRODUCT.md` already flags the existing
  testimonials as placeholders — **do not reuse them here.**
- Link privacy and terms. Note in your report that both still describe the
  WhatsApp platform and need rewriting for the new services (Phase E).

---

## Definition of Done

- [ ] `/services` index — honest about having one service
- [ ] `/services/ai-subscriptions` complete, all 8 sections
- [ ] Copy uses the ✅ framing throughout; no "we sell accounts" language anywhere
- [ ] Prices, fees, and delivery times are either owner-supplied or clearly-marked
      placeholders in one constants file — nothing invented
- [ ] Contact CTA works and the number lives in one constant
- [ ] ar/en both complete through `lib/i18n.tsx`
- [ ] Navbar, footer, home section, sitemap, metadata, JSON-LD all wired
- [ ] No fabricated trust signals
- [ ] Build output still **all `○ Static`**
- [ ] `node .github/skills/impeccable/scripts/detect.mjs .` → 0 anti-patterns
- [ ] eslint · tsc · vitest · build all PASS
- [ ] Screenshots at 1440 / 768 / 375, both locales
- [ ] `KIMI_TASKS/reports/PHASE-D-REPORT.md` — including the payment-regulation
      note for the owner and any placeholder that still needs real data

## Out of scope

- Payment processing, order tracking, dashboards
- The academy (Phase C)
- Rewriting the landing page or global SEO (Phase E)
- Legal advice — flag concerns in the report, don't put disclaimers you invented
  on the site
