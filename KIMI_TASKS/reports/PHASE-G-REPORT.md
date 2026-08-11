# Phase G — Catalogue + brutalist redesign

**Implemented by:** Claude (Opus 5) · 2026-08-10

## Gates

| Gate | Result |
|------|--------|
| eslint · tsc · vitest | ✅ PASS (3 tests) |
| next build | ✅ all routes static |
| Impeccable detector | ✅ 0 anti-patterns |

---

## 1. The finding that changed the pricing model

The owner reported a real receipt: **Claude Pro lists at $20; Anthropic charged
$22.80.** That gap is **14% Egyptian VAT**, applied at the provider's checkout
and invisible on the pricing page.

**A model built on the list price would have lost 14% on every order, silently.**
On a 20% target margin that is most of the profit — and it is exactly what the
requested price-scraper would have produced, because the scraper reads the list
page, not the receipt.

So `vat` is a **per-item flag verified against a receipt**, and `chargedUsd`
(a real observed charge) overrides the computed estimate wherever we have one.

## 2. Pricing

Five constants in `config/pricing.ts`, nothing else anywhere:

```
RATE = 52   VAT = 14%   FEES = 2%   PCT = 20%   FLOOR_USD = $5
```

```
charged = usd × (1 + VAT)          ← or the receipt, when we have it
cost    = charged × (1 + FEES)
margin  = max(FLOOR_USD, usd × PCT)
sell    = cost + margin
```

| Item | List | VAT | Fee | **Total** | ≈ EGP |
|------|------|-----|-----|-----------|-------|
| Claude Pro | $20 | $2.80 | $5 | **$28.26** | ~1,470 |
| Kimi | $19 | — | $5 | **$24.38** | ~1,270 |

**Prices are quoted in USD** (owner's call) so they don't move when the pound
does; EGP is derived from one constant and labelled indicative.

**The breakdown is shown, not just the total.** A customer who knows Claude is
$20 and sees $28.26 reads a 41% markup and leaves; the same customer shown that
$2.80 is government VAT reads a $5 service fee. Same number, opposite reaction,
and every line is true. Kimi's card **omits the VAT row entirely** rather than
printing $0.00 — the breakdown never invents a line item.

## 3. Why the price scraper was not built

Requested: a hidden agent that scrapes every tool's price and auto-updates.
**Recommended against** — reasoning in `PROJECT_MEMORY/PRICING.md` §5:

- A scraper that breaks silently doesn't show nothing, it shows a **wrong price
  on a page that takes money**. You find out from a customer.
- These prices barely move. Claude Pro has been $20 for years.
- **It reads the list price — the exact number the VAT finding proves is wrong.**
- Most providers' terms prohibit it, on a site whose pitch is "we do this
  properly".
- It needs a runtime, reintroducing the backend the project deliberately removed.

**Built instead (proposed, not yet implemented):** a scheduled job that
auto-publishes only the **FX rate** — public market data, and the number that
actually moves daily — and *alerts* on tool-price changes for one-click human
confirmation. Same benefit, and a wrong reading never reaches a customer. Stays
100% static: a GitHub Action commits a file, Vercel rebuilds.

## 4. Catalogue architecture

`types/catalog.ts` → `lib/catalog/` → `content/catalog/items.ts`

Same discipline as `lib/content/`: one module owns the data, so the admin
dashboard replaces that module and no page or component changes. Adding a tool
is **one object** — no code edit anywhere else.

Only items backed by a real purchase are listed. Everything else is covered by
the catch-all line. No third-party logos (trademark), text names only.

## 5. Brutalist redesign

| Change | Detail |
|--------|--------|
| **`--radius: 0`** | One token de-rounded every shadcn primitive. Then swept 19 files for explicit `rounded-*`. `rounded-full` survives on exactly two elements — the spinner and the status dot. |
| **Softness removed** | `backdrop-blur` gone from navbar and hero. `.glow-primary` is now a hard 4px offset, not a bloom. The hero's radial corner glow became a hard-cut halftone panel. |
| **Borders raised** | `0.26 → 0.34`, strong `0.35 → 0.48`. A hairline you can barely see is decoration; one you can read is architecture. |
| **Grain** | `.grain` on `<body>` — fixed SVG fractal noise at 3.5%. The reference's paper texture on a dark surface. |
| **Lime as a field** | The headline's second line sits in a solid lime block with black on it. Lime is never coloured type — it fails contrast and reads as glare. |
| **Numbered grid** | The hero skills strip is now a bordered 6-cell grid with mono indices — the reference's footer device, which happens to be the structure Arabic needs. |

### Why this isn't a copy of the reference

ASHFALL's force is **typographic violence** — condensed grotesques, tracking
pulled tight. **That's Latin and doesn't port.** Arabic has no condensed display
tradition and the script is connected, so tracking can't be pulled the same way
(`.tracking-display` already enforces `letter-spacing: 0` for this reason).

The load moved to what Arabic can do: scale/weight contrast instead of
condensation, **literal drawn structure** instead of type-as-structure, and Latin
mono for all numerals with `dir="ltr"` so bidi doesn't reorder them.

## 6. Bugs found and fixed while building

**Badge unreadable over the halftone.** The hero badge used a 10%-alpha lime fill
with lime text; over the new corner panel that became lime-on-lime — illegible at
the exact spot that introduces the brand. Now opaque with a full-strength border.

**Detector caught a real inconsistency.** After DESIGN.md documented radius `0`,
`app/global-error.tsx` still had an inline `borderRadius: 0.5rem`. It renders
outside the app shell (no Tailwind) so the sweep missed it. Fixed, not silenced.

## ⚠️ Open for the owner

1. **Kimi's $19 is unconfirmed.** You gave one number, not two. If Kimi also
   charges 14% VAT the real total is **$27.09, not $24.38** — a $2.71 gap, more
   than half the margin on that item. Claude is safe because you gave both
   numbers. **Check a receipt.**
2. **Every new item needs a receipt before it goes live** — same reason.
3. **Turnaround is still a placeholder.** The page says "agreed in the
   conversation". Not inventing "within 24 hours" — that's a public promise you
   haven't made.
4. **Arabic display face.** IBM Plex Sans Arabic is a *text* face; brutalism
   lives at display size, where it's only adequate. Almarai Black / Tajawal Black
   / Readex Pro should be tested side-by-side against real headlines. **This is
   the single biggest remaining upgrade to how the design lands.**
5. The FX auto-update Action is designed but not built — say the word.
