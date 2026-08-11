# Phase G — Brutalist redesign + the service catalogue

**Status:** plan. Two decisions are blocking (§2, §3) — do not start until the
owner has answered them.

**Goal:** the services side becomes the publishable product, rebuilt in a
brutalist visual language, with a full catalogue of everything BASMA can pay for.
The academy goes behind "قريبًا" until its own design is decided.

---

## 1. What actually changes

| | Before | After |
|---|--------|-------|
| Academy | live, 26 pages | **قريبًا** — routes stay, entry points hidden |
| Services | one page, one service | **the product** — catalogue with categories |
| Prices | none | published, computed from USD (see `PROJECT_MEMORY/PRICING.md`) |
| Visual language | dark, rounded, quiet | **brutalist** — hard, structural, loud |

---

## 2. 🛑 BLOCKING — the honest problem with brutalism in Arabic

The reference (ASHFALL) gets its force from **typographic violence**: enormous
condensed grotesques, tracking pulled tight, type treated as architecture. That
vocabulary is Latin. It does not port.

Arabic has no condensed-grotesque display tradition. The script is connected, so
you cannot tighten tracking the way that reference does. Vertical rhythm behaves
differently. **A direct copy of that layout with Arabic text substituted in will
look like a translated European poster — which is precisely the "designed for
someone else" feeling this brand exists to avoid.**

The honest translation of brutalism into Arabic moves the load off condensation
and onto things Arabic *can* do:

- **Weight and scale contrast** instead of condensation — 96px bold Arabic
  against 11px mono labels
- **Hard structure carries the meaning** — visible grid rules, boxed cells,
  full-bleed dividers. In Latin brutalism the type is the structure; in Arabic
  the structure has to be literal.
- **Latin monospace for all meta** — numbers, prices, categories, indices
  (`01 / 14`, `$20`, `USD`). Already in the stack (IBM Plex Mono). This is
  legitimate, not a cop-out: technical Arabic writing genuinely mixes scripts.
- **Asymmetry and deliberate misalignment** rather than centred symmetry

**⚠️ Type is the risk.** IBM Plex Sans Arabic (chosen in Phase B) is a *text*
face. It is excellent at 16px and merely fine at 96px — it has no display cut.
Brutalism lives or dies at display size. **A second Arabic display face is
probably required.** Candidates worth testing against real headlines before
committing: **Almarai Black**, **Tajawal Black**, **Cairo Black**, **Readex Pro**.
This must be settled with a side-by-side test, not picked from a list.

---

## 3. ✅ DECIDED — palette direction: **A, dark brutalism**

*Owner's call, 2026-08-10.* Keep near-black and the brand lime. Harden it:

- **Every radius goes to 0.** No `rounded-*` anywhere except where a shape is
  genuinely circular.
- **Hard 1px rules and boxed cells** replace soft fills as the structuring
  device. Structure has to be literal — see §2 for why that matters more in
  Arabic than in Latin.
- **Lime becomes solid blocks**, not tints. `bg-primary` with black text, not
  `bg-primary/5`.
- **Grain/noise texture** over the base surface — the reference's paper feel,
  translated to dark.
- **No soft shadows, no gradients, no blur.** The current navbar
  `backdrop-blur-xl` is the opposite of this language.
- Keeps the Phase B colour tokens, the fonts, and the verified contrast table —
  so this is roughly a week, not three, and no accessibility work is redone.

The rejected alternative (cream paper, closer to the reference) is recorded here
because it stays viable if the academy's own design goes that way later:
lime fails WCAG on cream for *text* (measured: **1.48:1**), so it could only ever
be a fill with black on top — which is itself a legitimately brutalist
constraint.

---

## 3b. Reference — what actually makes it work

Traits to take from ASHFALL, translated to a dark base:

| Trait | How it lands here |
|-------|-------------------|
| Extreme scale contrast | 96px+ display against 11px mono labels |
| Visible structure | Hairline rules, boxed cells, full-bleed dividers |
| Zero softness | No radii, no shadows, no gradients, no blur |
| Monospace meta | Indices, prices, categories — `01 / 14`, `$25`, `USD` |
| Numbered grid at the foot | Already a natural fit for the catalogue |
| Texture | Grain over the base surface |
| Asymmetry | Off-centre, deliberate misalignment over tidy symmetry |

**What NOT to take:** the halftone photo collage. There are no photographs of
this business, and stock imagery treated to look editorial is exactly the kind
of fake evidence `PRODUCT.md` forbids. Structure and type carry it instead.

---

## 4. The catalogue

Everything BASMA can pay for, in categories:

```
اشتراكات الذكاء الاصطناعي   Claude · ChatGPT · Kimi · Midjourney · …
أرصدة الـ APIs               OpenRouter · OpenAI · Anthropic
الكورسات الأونلاين           Udemy · Coursera · …
أي دفع أونلاين بالكارت       the catch-all
```

### Architecture — same discipline as `lib/content/`

The owner has said an admin dashboard is coming. So the catalogue is **data
behind one typed module**, never hardcoded into components:

```
types/catalog.ts        the contract
lib/catalog/index.ts    the only reader — files today, API tomorrow
config/pricing.ts       RATE · FLOOR · PCT  ← three numbers, one file
content/catalog/        categories + items
```

**Store `usd` only. Never store EGP, never store the sell price.** Both are
computed from three constants. **Prices are quoted in USD** (owner's decision) —
a stable anchor that doesn't move when the pound does — with the EGP equivalent
shown underneath as indicative. See `PROJECT_MEMORY/PRICING.md` for the full
model and worked examples.

**All constants now settled** — `RATE = 52` (Bybit P2P), `VAT = 14%`,
`FEES = 2%`, `PCT = 20%`, `FLOOR_USD = $5`. Nothing is blocking the build.

> **⚠️ The find that changes the numbers:** Claude Pro lists at $20; the owner was
> charged **$22.80**. That's 14% Egyptian VAT applied at the provider's checkout —
> invisible on the pricing page, and **it would have eaten most of the margin on
> every order** if the model had been built on the list price. `vat` is therefore
> a per-item flag that must be **verified against a real receipt** before an item
> goes live. See `PROJECT_MEMORY/PRICING.md` §2.

The item page must show the **full breakdown** (list + VAT + service fee). A
customer who knows Claude is $20 and sees $29 reads a 45% markup; the same
customer shown that $2.80 is government VAT reads a $5 service fee. Same number,
opposite reaction — and all of it true.

### Confirmed purchase history (owner, 2026-08-10)

Real, not assumed: **Kimi · Claude · Coursera courses · assorted online
payments.** Funded with a USD-denominated Visa/Mastercard.

Anything outside that list goes under the catch-all category, not its own
catalogue entry, until it's actually been bought once.

### Keeping prices current

Owner asked for a hidden agent that scrapes every tool's price and auto-updates.
**Recommended against, with an alternative that delivers the same benefit** —
see `PROJECT_MEMORY/PRICING.md` §5. Short version:

| Number | How it updates |
|--------|----------------|
| `RATE` (EGP/USD) | **Auto, daily** — public FX API via a GitHub Action, auto-committed, Vercel rebuilds. Safe: public market data, and it's the number that actually moves. |
| Tool prices | **Alert, then human confirm.** A scraper that breaks silently shows a *wrong price on a page that takes money*, and you learn about it from a customer. Never auto-publish these. |
| `PCT` · `FEES` · `FLOOR` | Manual — business decisions, not data |

The site stays 100% static throughout: a scheduled Action commits a file, Vercel
rebuilds. No runtime, no server, no database.

Adding a tool must be adding one entry — no code change, exactly like adding a
level in Phase C.

### Rules

- **Text names, no third-party logos.** Listing "Claude" as something you can pay
  for is fine; using Anthropic's mark implies a partnership that doesn't exist.
- Every item shows: name · what it is · USD · computed EGP · WhatsApp CTA
  prefilled with that specific item.
- **No invented items.** If BASMA hasn't actually bought it before, it isn't a
  catalogue entry — it's covered by the catch-all.

---

## 5. Routes

```
/services                                  → catalogue, categories
/services/ai-subscriptions                 → keep, becomes the category hub
/services/ai-subscriptions/[item]           → optional, only if items need depth
```

Academy routes stay built but drop out of nav/footer/home and out of the
sitemap. **Do not delete them** — the content and pipeline are done and correct;
this is a visibility change, not a teardown.

---

## 6. Order of work

1. Academy → قريبًا *(done — see below)*
2. Owner answers §2 and §3
3. Type test: 4 Arabic display faces against real headlines, at 1440 and 375
4. Rebuild `DESIGN.md` for the chosen direction — tokens, no radii, grain, rules
5. Catalogue module + pricing config
6. Rebuild `/services` in the new language
7. Home page follows the same language
8. Detector, contrast table, screenshots, report

**Steps 4–7 are not startable before step 2.** Building a brutalist services page
on the current rounded dark system produces two visual languages on one site,
which reads worse than either done properly.

---

## Definition of Done

- [ ] Owner's answers recorded in `STATUS.md`
- [ ] Display face chosen from a real side-by-side test, evidence in the report
- [ ] `DESIGN.md` rewritten; WCAG AA table regenerated for the new palette
- [ ] Catalogue behind `lib/catalog/`; adding an item = one entry, demonstrated
- [ ] `config/pricing.ts` holds RATE/FLOOR/PCT and nothing else does
- [ ] No third-party logos anywhere
- [ ] Academy fully hidden; no dead links; not in sitemap
- [ ] `node .github/skills/impeccable/scripts/detect.mjs .` → 0
- [ ] eslint · tsc · vitest · build all PASS, build stays all-static
- [ ] Screenshots at 1440 / 768 / 375, ar and en
