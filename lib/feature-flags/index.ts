/**
 * Feature flag helpers — check whether the current user's tier unlocks a
 * specific feature.
 *
 * The tier → feature mapping lives in `config/tiers.ts`. This module only
 * provides the convenience wrappers (pure check + server-side wrapper).
 * The client-side hook lives in `hooks/useFeatureFlag.ts`.
 *
 * Source spec: SYSTEM_ARCHITECTURE.md §13 Rule 4 — "Feature Flags في Code، مش if/else"
 *
 * @example
 *   // Server side
 *   const user = await requireUser()
 *   if (!hasFeature(user.tier, "labDownloadJSON")) {
 *     throw new TierLimitError("labDownloadJSON", "starter")
 *   }
 *
 *   // Client side (in a component)
 *   const canDownload = useFeatureFlag("labDownloadJSON")
 */

import { TIERS, type Tier, type TierSlug } from "@/config/tiers"
import type { CurrentUser } from "@/types/auth"

/**
 * The full list of feature keys — derived from the `Tier["features"]` shape
 * so adding a new feature in `config/tiers.ts` is a compile error here until
 * you handle it. That's deliberate.
 */
export type FeatureFlag = keyof Tier["features"]

/**
 * Pure check — does this tier unlock this feature?
 * The canonical primitive every other helper builds on.
 */
export function hasFeature(tier: TierSlug, flag: FeatureFlag): boolean {
  return TIERS[tier].features[flag] === true
}

/**
 * Same as hasFeature but takes a CurrentUser. Sugar for server-side code
 * where you have the user object in hand.
 */
export function userHasFeature(
  user: CurrentUser,
  flag: FeatureFlag,
): boolean {
  return hasFeature(user.tier, flag)
}

/**
 * Find the lowest tier that unlocks a feature.
 * Used by `<UpgradePrompt>` to display "available in Starter / Pro / Business".
 *
 * Returns `null` if no tier provides this feature (shouldn't happen in a
 * well-formed config but the type system can't guarantee it).
 */
export function lowestTierWithFeature(flag: FeatureFlag): TierSlug | null {
  // Order matters — we want the cheapest tier first.
  // (TIER_ORDER is "free, starter, pro, business" already in cheap→expensive order.)
  for (const tier of Object.values(TIERS)) {
    if (tier.features[flag] === true) {
      return tier.slug
    }
  }
  return null
}

/**
 * Bulk check — useful for rendering a sidebar where you want to lock several
 * items at once. Returns a `Record<flag, boolean>` shape.
 */
export function checkFeatures(
  tier: TierSlug,
  flags: ReadonlyArray<FeatureFlag>,
): Record<FeatureFlag, boolean> {
  const out = {} as Record<FeatureFlag, boolean>
  for (const flag of flags) {
    out[flag] = hasFeature(tier, flag)
  }
  return out
}
