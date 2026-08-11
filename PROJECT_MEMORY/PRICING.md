# Pricing model — AI subscriptions service

**Decided (2026-08-10):** prices are **quoted in USD**, and the EGP equivalent is
**computed automatically**. Owner's call, and it's the right one — see §3.

**Still needed from the owner:** three numbers — `RATE`, `FLOOR_USD`, `PCT`.
Everything else follows from them.

---

## 1. Why the obvious answer breaks

"Add 200–300 EGP per person" fails at both ends:

| Order | Cost | +250 flat | Effective margin |
|-------|------|-----------|------------------|
| Kimi $10/mo | ~520 EGP | 770 EGP | **48%** — priced out of the market |
| Claude Pro $20/mo | ~1,040 EGP | 1,290 EGP | 24% — about right |
| OpenRouter $100 credit | ~5,200 EGP | 5,450 EGP | **4.8%** — barely pays for the work |

A flat fee assumes every order costs the same to serve. It doesn't: a $200 order
carries more FX exposure and more money at risk than a $10 one — but takes the
same ten minutes of your time.

A pure percentage fails the other way: 12% of a $10 subscription is $1.20, which
doesn't pay for the conversation.

---

## 2. ⚠️ The list price is NOT what you are charged

**Real data point from the owner (2026-08-10): Claude Pro is advertised at $20.
Anthropic charged him $22.80.**

That difference is **14% Egyptian VAT**, applied at the provider's checkout for
customers billing from Egypt. It is not optional and it is not visible on the
pricing page you'd scrape.

**Any model built on the $20 list price loses 14% of margin on every single
order, silently.** On a 20% target margin, that's most of the profit gone.

## 3. The model

```
charged_usd = usd × (1 + VAT)                 ← what the provider actually bills
cost_usd    = charged_usd × (1 + FEES)        ← plus getting the money there
margin_usd  = max(FLOOR_USD, usd × PCT)       ← what you keep
sell_usd    = cost_usd + margin_usd
sell_egp    = sell_usd × RATE                 ← indicative, computed for display
```

| Constant | Value | Why |
|----------|-------|-----|
| `VAT` | **14%** | Egyptian VAT added at provider checkout. **Confirmed against a real charge**, not assumed. Varies by provider — see §4. |
| `FEES` | **2%** | Bybit P2P → card funding, withdrawal fees. *Not* an FX spread — that's already inside `RATE`. |
| `PCT` | **20%** | Owner's decision. Applied to the list price, not the VAT-inflated one. |
| `FLOOR_USD` | **$5** | Minimum worth handling an order for, end to end |
| `RATE` | **52** | EGP per USD. Owner buys USDT on **Bybit P2P at ~52**. This is the real acquisition rate, so it already carries the parallel-market premium. |

### Worked examples

| Item | List | +VAT | Cost | Margin | **Sell** | ≈ EGP |
|------|------|------|------|--------|----------|-------|
| Kimi | $10 | $11.40 | $11.63 | $5 (floor) | **$17** | ~884 |
| Claude Pro | $20 | $22.80 | $23.26 | $5 (floor) | **$29** | ~1,508 |
| ChatGPT Plus | $20 | $22.80 | $23.26 | $5 (floor) | **$29** | ~1,508 |
| Midjourney | $30 | $34.20 | $34.88 | $6 (pct) | **$41** | ~2,132 |
| OpenRouter credit | $100 | $114.00 | $116.28 | $20 (pct) | **$137** | ~7,124 |
| Coursera course | $150 | $171.00 | $174.42 | $30 (pct) | **$205** | ~10,660 |

Gross margin lands at ~20% as intended; net after residual costs is ~16–17% —
which is what the owner asked for.

## 3b. Show the breakdown — it *defends* the price

A customer who knows Claude costs $20 and sees **$29** reads a 45% markup and
leaves. The same customer shown this does not:

```
اشتراك Claude Pro          $20.00
ضريبة القيمة المضافة ١٤٪    $2.80
رسوم الخدمة                $5.00
─────────────────────────────────
الإجمالي                   $27.80   ≈ ١٤٤٥ ج.م
```

Now the service fee reads as **$5**, not $9 — because $2.80 of it was never
yours. **Transparency here is not an ethical nicety, it's the single strongest
conversion argument available**, and it costs nothing because it's all true.

---

## 3. Why quoting in USD is the right call

The pound moves. A published EGP price goes underwater and a customer who saw
1,300 EGP will expect 1,300 EGP.

Quoting in USD moves that risk to where it belongs:

- **The USD price never has to change.** Claude is $20 today and $20 next month,
  so your `$25` stays correct regardless of what the pound does.
- **The EGP figure is derived, labelled as indicative, and confirmed at order
  time** — which is already what the service page says happens.
- **Your margin is protected by construction.** It's a USD margin on a USD cost.
  An EGP margin on a USD cost is a currency bet you didn't intend to place.

**Display both.** USD is the stable anchor; EGP is what the customer actually
pays and thinks in. Showing only USD makes an Egyptian buyer do mental
arithmetic before they can decide.

```
$25 / شهرياً
≈ ١٣٠٠ ج.م — بسعر الصرف اليوم، بيتأكد وقت الطلب
```

---

## 4. The engineering rule

**Store `usd` in the catalogue. Never store EGP. Never store the sell price.**

```ts
// config/pricing.ts — the ONLY place these five numbers exist
export const RATE = 52          // EGP per USD — Bybit P2P acquisition rate
export const VAT = 0.14         // Egyptian VAT, added at provider checkout
export const FEES = 0.02        // P2P → card funding + withdrawal fees
export const PCT = 0.20         // target gross margin, on the list price
export const FLOOR_USD = 5

// content/catalog — what an item knows about itself
{
  slug: "claude-pro",
  usd: 20,                      // LIST price — what the customer sees advertised
  period: "monthly",
  vat: true,                    // does this provider charge Egyptian VAT?
  checkedAt: "2026-08-10",      // so a stale price is visible
}
```

**`vat` is per item, not global.** It is confirmed true for Claude. Whether
Coursera, OpenRouter, or Midjourney charge it depends on the provider and how the
card is issued — **each one must be verified against a real receipt before that
item goes live.** Defaulting everything to `true` overprices; defaulting to
`false` eats the margin. Neither guess is acceptable on a page that takes money.

Both the sell price and the EGP figure are computed. When the pound moves you
change **one number** and the whole catalogue reprices. If prices are typed into
the catalogue, every rate move becomes forty manual edits — and the day you miss
one, you sell at a loss.

Same discipline as `lib/content/`: one module owns it, so the admin dashboard
later replaces that module and nothing else.

---

## 5. Keeping prices current — and why full auto-scraping is the wrong tool

**The request:** a hidden agent that scrapes every AI tool's price from the web
and updates the catalogue automatically.

**The instinct is right. The mechanism is dangerous, and it's aimed at the wrong
number.**

### Why not auto-publish a scrape

- **The failure mode is the worst one available.** A scraper that silently breaks
  doesn't show nothing — it shows a *wrong price* on a page where people send you
  money. You find out from an angry customer, not from a log.
- **These prices barely move.** Claude Pro has been $20 for years. ChatGPT Plus
  the same. You'd be running fragile machinery permanently to catch an event that
  happens maybe twice a year per tool.
- **Pricing pages are hostile to scraping.** Rendered by JavaScript, varied by
  geography, A/B tested, restructured without warning. A price scraped from a
  US-geo A/B variant is not your price.
- **Most providers' terms prohibit it.** On a site whose entire pitch is "we do
  this properly, your account stays yours", scraping their sites is the wrong
  posture.
- **The site is static by design.** A live scraper needs a runtime, which
  reintroduces the backend the whole project deliberately removed.

### What to build instead — same benefit, no risk

**A scheduled job that alerts instead of publishing.**

```
GitHub Action, daily
   ↓
fetch FX rate  →  update rates.json  →  commit  →  Vercel rebuilds
   ↓
check tool prices against the catalogue
   ↓
anything changed?  →  Telegram/WhatsApp: "Claude Pro looks like $20 → $25.
                       Confirm?"  →  owner edits one number
```

- **You still never have a stale price** — you get told the day it changes.
- **A wrong reading never reaches a customer.** A human confirms anything that
  touches money. That is the entire difference.
- **The site stays 100% static.** A GitHub Action commits a file and Vercel
  rebuilds — no server, no database, no runtime.

### Automate the number that actually moves

Claude's $20 is stable. **The EGP rate moves every single day.** That's where
automation pays for itself, and it's safe to auto-publish because it's a public
market rate from a reliable source, not a guess parsed out of someone's
marketing page.

**Recommendation:**

| Number | How it updates |
|--------|----------------|
| `RATE` (EGP/USD) | **Automatic, daily** — public FX API, auto-committed |
| Tool prices | **Alert + one-click confirm** — never auto-published |
| `PCT`, `FEES`, `FLOOR` | Manual. These are business decisions, not data. |

Add a `checkedAt` date to every catalogue item so a price that hasn't been
verified in months is visible to you — and, if you want, to the customer.

---

## 6. Two things to settle before publishing

1. **Don't imply a partnership.** Listing "Claude", "ChatGPT", "Midjourney" as
   things you can pay for is fine. Using their logos, or wording like "وكيل
   معتمد" / "official reseller", is not — that's a trademark problem on top of
   the provider-terms one already noted in `PRODUCT.md`. **Text names, no
   third-party logos.**
2. **Decide the refund position per category.** `app/terms` already commits to a
   refund if a subscription can't be completed. An API credit top-up is harder to
   unwind than a monthly subscription — if the position differs by category, the
   terms have to say so.
