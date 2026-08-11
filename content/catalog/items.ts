import type { CatalogItem } from "@/types/catalog"

/**
 * The catalogue.
 *
 * ⚠️ ONLY items BASMA has actually bought before. Anything else belongs under
 * the "any online payment" catch-all, not as an entry with a price on it.
 *
 * Both entries below are backed by real receipts (2026-08-10). The rest of the
 * catalogue gets added by the owner through the admin dashboard, or here in the
 * meantime — one object per item, no code change anywhere else.
 */
export const CATALOG: CatalogItem[] = [
  {
    slug: "claude-pro",
    name: "Claude Pro",
    category: "ai-tools",
    note: "اشتراك Claude الشهري",
    usd: 20,
    period: "monthly",
    // Verified: listed at $20, card charged $22.80 → 14% Egyptian VAT.
    vat: true,
    chargedUsd: 22.8,
    checkedAt: "2026-08-10",
  },
  {
    slug: "kimi",
    name: "Kimi",
    category: "ai-tools",
    note: "اشتراك Kimi الشهري",
    usd: 19,
    period: "monthly",
    // ⚠️ UNCONFIRMED: the owner reported $19.00, but it isn't yet established
    // whether that is the list price or the charged amount. If Kimi also adds
    // 14% VAT, the real charge is ~$21.66 and this entry under-prices by ~$2.66.
    // Confirm against a receipt before publishing.
    vat: false,
    checkedAt: "2026-08-10",
  },
]
