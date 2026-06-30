/**
 * Tier definitions — single source of truth for what each subscription unlocks.
 *
 * IMPORTANT: This file is the CODE-SIDE source of truth. The DB-side source is
 * the `plans` table (mapped by `tier_slug`). When the two diverge, the user's
 * actual entitlement is derived from `plans` joined via `subscriptions`. This
 * file mirrors what we expect those rows to contain, and powers the UI
 * (pricing cards, feature gates, upgrade prompts) without an extra round-trip.
 *
 * Adding a new tier:
 *   1. Append it here.
 *   2. Add a matching row to the `plans` table with the same `tier_slug`.
 *   3. Update `config/permissions.ts` if it should grant a new permission.
 *   4. Update `PRICING.md` (bump version per Documentation Policy).
 *
 * Source spec: PRICING.md (FROZEN v1.0)
 */

export type TierSlug = "free" | "starter" | "pro" | "business"

export type Tier = {
  slug: TierSlug
  /** Display name in the locale's natural form */
  name: { ar: string; en: string }
  /** Short marketing tagline (Pricing page) */
  tagline: { ar: string; en: string }
  /** Monthly price in USD */
  priceMonthlyUSD: number
  /** Yearly price in USD (shown as "save X%" badge) */
  priceYearlyUSD: number
  /** Show this card as the recommended one in the pricing grid */
  recommended: boolean
  /** Hard limits — `null` means unlimited */
  limits: {
    whatsappNumbers: number
    messagesPerMonth: number | null
    campaignsPerMonth: number | null
    autoReplyRules: number | null
    webhooks: number | null
    apiRequestsPerMin: number
    teamMembers: number
  }
  /** Feature flag bag — used by FeatureGate / useFeatureFlag. */
  features: {
    academyAccess: boolean
    labViewDemos: boolean
    labDownloadJSON: boolean
    labPersonalSandbox: boolean
    whatsappService: boolean
    chatbotService: boolean // Phase 2 — declared now so UI can hint at it
    teamInbox: boolean
    advancedAutomation: boolean
    detailedAnalytics: boolean
    analyticsExport: boolean
    apiAccess: boolean
    customBranding: boolean
  }
}

export const TIERS: Record<TierSlug, Tier> = {
  free: {
    slug: "free",
    name: { ar: "مجاني", en: "Free" },
    tagline: { ar: "للتجربة والاستكشاف", en: "Try and explore" },
    priceMonthlyUSD: 0,
    priceYearlyUSD: 0,
    recommended: false,
    limits: {
      whatsappNumbers: 0,
      messagesPerMonth: 0,
      campaignsPerMonth: 0,
      autoReplyRules: 0,
      webhooks: 0,
      apiRequestsPerMin: 0,
      teamMembers: 1,
    },
    features: {
      academyAccess: false, // intro lesson only — gated separately
      labViewDemos: true,
      labDownloadJSON: false,
      labPersonalSandbox: false,
      whatsappService: false,
      chatbotService: false,
      teamInbox: false,
      advancedAutomation: false,
      detailedAnalytics: false,
      analyticsExport: false,
      apiAccess: false,
      customBranding: false,
    },
  },
  starter: {
    slug: "starter",
    name: { ar: "ستارتر", en: "Starter" },
    tagline: { ar: "للمبتدئ اللي عايز يبدأ", en: "For beginners getting started" },
    priceMonthlyUSD: 19,
    priceYearlyUSD: 190,
    recommended: false,
    limits: {
      whatsappNumbers: 1,
      messagesPerMonth: 5000,
      campaignsPerMonth: 5,
      autoReplyRules: 10,
      webhooks: 3,
      apiRequestsPerMin: 100,
      teamMembers: 1,
    },
    features: {
      academyAccess: true,
      labViewDemos: true,
      labDownloadJSON: true,
      labPersonalSandbox: false,
      whatsappService: true,
      chatbotService: false,
      teamInbox: false,
      advancedAutomation: false,
      detailedAnalytics: false,
      analyticsExport: false,
      apiAccess: true,
      customBranding: false,
    },
  },
  pro: {
    slug: "pro",
    name: { ar: "برو", en: "Pro" },
    tagline: { ar: "للفريلانسر وأصحاب المشاريع", en: "For freelancers and solopreneurs" },
    priceMonthlyUSD: 49,
    priceYearlyUSD: 490,
    recommended: true,
    limits: {
      whatsappNumbers: 5,
      messagesPerMonth: 30000,
      campaignsPerMonth: null,
      autoReplyRules: null,
      webhooks: null,
      apiRequestsPerMin: 500,
      teamMembers: 1,
    },
    features: {
      academyAccess: true,
      labViewDemos: true,
      labDownloadJSON: true,
      labPersonalSandbox: true,
      whatsappService: true,
      chatbotService: true,
      teamInbox: false,
      advancedAutomation: true,
      detailedAnalytics: true,
      analyticsExport: false,
      apiAccess: true,
      customBranding: false,
    },
  },
  business: {
    slug: "business",
    name: { ar: "بيزنس", en: "Business" },
    tagline: { ar: "للشركات والفرق", en: "For companies and teams" },
    priceMonthlyUSD: 129,
    priceYearlyUSD: 1290,
    recommended: false,
    limits: {
      whatsappNumbers: 15,
      messagesPerMonth: 150000,
      campaignsPerMonth: null,
      autoReplyRules: null,
      webhooks: null,
      apiRequestsPerMin: 2000,
      teamMembers: 5,
    },
    features: {
      academyAccess: true,
      labViewDemos: true,
      labDownloadJSON: true,
      labPersonalSandbox: true,
      whatsappService: true,
      chatbotService: true,
      teamInbox: true,
      advancedAutomation: true,
      detailedAnalytics: true,
      analyticsExport: true,
      apiAccess: true,
      customBranding: true,
    },
  },
}

/** Ordered list — useful for upgrade comparisons (next tier up, etc). */
export const TIER_ORDER: TierSlug[] = ["free", "starter", "pro", "business"]

/** Resolve a tier object from a slug. Falls back to free if unknown. */
export function getTier(slug: string | null | undefined): Tier {
  if (slug && slug in TIERS) {
    return TIERS[slug as TierSlug]
  }
  return TIERS.free
}

/** The next tier above the given one, or null if at the top. */
export function getNextTier(slug: TierSlug): Tier | null {
  const idx = TIER_ORDER.indexOf(slug)
  if (idx < 0 || idx >= TIER_ORDER.length - 1) return null
  return TIERS[TIER_ORDER[idx + 1]]
}

/** True iff `candidate` is at or above `required` in the tier ladder. */
export function tierMeets(candidate: TierSlug, required: TierSlug): boolean {
  return TIER_ORDER.indexOf(candidate) >= TIER_ORDER.indexOf(required)
}
