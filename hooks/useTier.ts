"use client"

/**
 * Returns the current user's tier slug, or "free" if no user.
 *
 * Defaulting to "free" means client components can call this without a
 * null-check and still get a sensible answer (matches the actual default
 * for unauthenticated visitors anyway).
 */

import { useCurrentUser } from "./useCurrentUser"
import type { TierSlug } from "@/config/tiers"

export function useTier(): TierSlug {
  const user = useCurrentUser()
  return user?.tier ?? "free"
}
