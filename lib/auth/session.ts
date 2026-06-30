/**
 * Server-side session helpers.
 *
 * All Server Components, Server Actions, and Route Handlers that need to know
 * "who is logged in" go through `getCurrentUser()`. It returns a unified
 * `CurrentUser` object (auth + profile + role + tier) so the caller doesn't
 * have to do 3 round-trips.
 *
 * NEVER call this from a "use client" component — it imports `next/headers`
 * via the supabase server client, which is server-only.
 *
 * Source spec: SYSTEM_ARCHITECTURE.md §4.2
 */

import "server-only"

import { createClient } from "@/lib/supabase/server"
import { getTier, type TierSlug } from "@/config/tiers"
import { normalizeRole } from "@/config/permissions"
import type { AuthUser, CurrentUser, Profile } from "@/types/auth"

/**
 * Resolve the currently-authenticated user, or `null` if there is no session.
 *
 * Returns null in any of these cases:
 *   - No supabase cookie present
 *   - The cookie is invalid / expired
 *   - The user exists in auth but has no `profiles` row (data inconsistency)
 *
 * Callers that REQUIRE a logged-in user should use `requireUser()` instead.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  // Pull the profile + the user's tier in a single round-trip.
  // `subscriptions.user_id` is UNIQUE so this join returns at most one row.
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `id, email, full_name, company, avatar_url, role, status, plan,
       plan_expires_at, balance, max_instances, max_messages,
       custom_max_instances, notes, whatsapp,
       telegram_chat_id, telegram_link_code, telegram_link_expires_at,
       telegram_linked_at, created_at, updated_at`,
    )
    .eq("id", authUser.id)
    .single<Profile>()

  if (!profile) return null

  const auth: AuthUser = {
    id: authUser.id,
    email: authUser.email,
    emailConfirmedAt: authUser.email_confirmed_at ?? null,
  }

  return {
    auth,
    profile,
    role: normalizeRole(profile.role),
    tier: await resolveTier(supabase, authUser.id),
  }
}

/**
 * Resolve the user's current tier from `subscriptions` + `plans`.
 *
 * Post-migration (2026-07-01) every plan row has a `tier_slug` column. We
 * read that column directly; there is no price-based heuristic any more.
 *
 * Returns "free" when:
 *   - the user has no subscription row, or
 *   - their subscription is cancelled, or
 *   - the plan row is missing (data inconsistency).
 *
 * If a plan ever lands in DB without a tier_slug (which the CHECK constraint
 * makes impossible, but defensive code is cheap), we log to stderr and fall
 * back to "free" so the user is never silently promoted.
 */
async function resolveTier(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<TierSlug> {
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id, status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!sub || sub.status === "cancelled" || !sub.plan_id) {
    return "free"
  }

  const { data: plan } = await supabase
    .from("plans")
    .select("tier_slug")
    .eq("id", sub.plan_id)
    .single<{ tier_slug: string | null }>()

  if (!plan?.tier_slug) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[resolveTier] plan ${sub.plan_id} has no tier_slug — falling back to "free"`,
      )
    }
    return "free"
  }

  return getTier(plan.tier_slug).slug
}
