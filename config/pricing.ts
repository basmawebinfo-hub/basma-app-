/**
 * Every number that decides a price lives here. Nowhere else.
 *
 * Change one of these and the whole catalogue reprices. If a price is ever
 * typed into a catalogue entry, every rate move becomes forty manual edits —
 * and the day one gets missed, we sell below cost.
 *
 * Full reasoning and worked examples: PROJECT_MEMORY/PRICING.md
 */

/** EGP per USD. The owner buys USDT on Bybit P2P — this is a real acquisition
 *  rate, so the parallel-market premium is already inside it. Do NOT replace it
 *  with the official CBE rate: that would price below actual cost. */
export const RATE = 52

/** Egyptian VAT, added by providers at checkout for customers billing from
 *  Egypt. Confirmed against a real receipt: Claude Pro lists at $20, charged
 *  $22.80. Applied per item — see `vat` in the catalogue. */
export const VAT = 0.14

/** Bybit P2P → card funding and withdrawal fees. NOT an FX spread; that is
 *  already inside RATE. */
export const FEES = 0.02

/** Target gross margin, applied to the LIST price — not to the VAT-inflated
 *  amount. Charging a margin on top of government tax is both wrong and a bad
 *  look if a customer ever does the arithmetic. */
export const PCT = 0.2

/** Minimum margin in USD. Below roughly $25 of list price this governs, because
 *  a $10 order takes the same time to handle as a $100 one. */
export const FLOOR_USD = 5

export interface PriceBreakdown {
  /** Advertised price the customer can look up themselves */
  list: number
  /** VAT the provider adds at checkout — 0 when the provider doesn't charge it */
  vat: number
  /** What BASMA keeps */
  fee: number
  /** What the customer pays, in USD */
  total: number
  /** Indicative EGP equivalent */
  egp: number
}

/**
 * Compute what a customer pays.
 *
 * `chargedUsd` is the amount actually taken from the card on a real purchase.
 * When we have it, it wins over the computed VAT — a receipt beats an estimate,
 * and provider tax behaviour varies more than any formula predicts.
 */
export function priceOf(item: {
  usd: number
  vat?: boolean
  chargedUsd?: number
}): PriceBreakdown {
  const list = item.usd
  const charged = item.chargedUsd ?? (item.vat ? list * (1 + VAT) : list)
  const vat = Math.max(0, charged - list)

  const cost = charged * (1 + FEES)
  const fee = Math.max(FLOOR_USD, list * PCT)
  const total = cost + fee

  return {
    list,
    vat,
    fee,
    total,
    egp: total * RATE,
  }
}

/** Money for display. Trailing `.00` is noise on a price. */
export function usd(n: number): string {
  return `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`
}

/** EGP is indicative, so precision would be false confidence — round to 5. */
export function egp(n: number): string {
  return (Math.round(n / 5) * 5).toLocaleString("en-US")
}
