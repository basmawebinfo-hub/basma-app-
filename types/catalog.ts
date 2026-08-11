/**
 * The catalogue contract.
 *
 * Today `lib/catalog/` fulfils it from a file. When the admin dashboard arrives
 * it fulfils it from an API, and no page or component changes — same discipline
 * as `lib/content/`.
 *
 * That only holds if nothing outside `lib/catalog/` reads the raw data.
 */

export type CatalogCategory = "ai-tools" | "api-credits" | "courses" | "other"

export interface CatalogItem {
  slug: string
  /** Text name only. Never a third-party logo — see PRODUCT.md. */
  name: string
  category: CatalogCategory
  /** Short line: what this actually is, for someone who doesn't know the tool. */
  note?: string

  /** LIST price in USD — what the customer can look up themselves. */
  usd: number
  period: "monthly" | "yearly" | "once"

  /**
   * Does this provider add Egyptian VAT at checkout?
   *
   * Must be verified against a real receipt before the item goes live.
   * Guessing `true` overprices and loses customers; guessing `false` eats the
   * margin. Neither is acceptable on a page that takes money.
   */
  vat?: boolean

  /**
   * The amount actually charged on a real purchase, when we have a receipt.
   * Beats the computed VAT — provider tax behaviour varies more than any
   * formula predicts.
   */
  chargedUsd?: number

  /** When the price was last verified, so a stale entry is visible. */
  checkedAt: string
}
