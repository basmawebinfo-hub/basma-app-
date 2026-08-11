import { CATALOG } from "@/content/catalog/items"
import { priceOf, type PriceBreakdown } from "@/config/pricing"
import type { CatalogCategory, CatalogItem } from "@/types/catalog"

/**
 * The only module that reads catalogue data.
 *
 * Today it imports a file. When the admin dashboard exists, these functions
 * fetch instead, and nothing that calls them changes.
 *
 * Not marked `server-only`: the catalogue is public information and the pages
 * that render it are client components. Nothing secret passes through here.
 */

export type PricedItem = CatalogItem & { price: PriceBreakdown }

function withPrice(item: CatalogItem): PricedItem {
  return { ...item, price: priceOf(item) }
}

export function getCatalog(): PricedItem[] {
  return CATALOG.map(withPrice)
}

export function getByCategory(category: CatalogCategory): PricedItem[] {
  return CATALOG.filter((i) => i.category === category).map(withPrice)
}

export function getItem(slug: string): PricedItem | null {
  const found = CATALOG.find((i) => i.slug === slug)
  return found ? withPrice(found) : null
}

/** Categories that actually have items — an empty category renders nothing. */
export function getUsedCategories(): CatalogCategory[] {
  return [...new Set(CATALOG.map((i) => i.category))]
}
