"use client"

/**
 * Returns `true` if the current user's tier unlocks the given feature.
 *
 * For unauthenticated visitors / users without a tier, defaults to checking
 * against the "free" tier. This means public pages can call this without
 * a guard and still get the correct "is this feature visible to anyone?"
 * answer.
 */

import { useTier } from "./useTier"
import { hasFeature, type FeatureFlag } from "@/lib/feature-flags"

export function useFeatureFlag(flag: FeatureFlag): boolean {
  const tier = useTier()
  return hasFeature(tier, flag)
}
