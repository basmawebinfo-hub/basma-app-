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
 * Order of precedence:
 *   1. Active subscription → look up plan.tier_slug (post-migration)
 *      or fall back to plan.name mapping for legacy plans
 *   2. No subscription → "free"
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
    .select("name, tier_slug, price_monthly")
    .eq("id", sub.plan_id)
    .single<{ name: string; tier_slug?: string | null; price_monthly: number }>()

  if (!plan) return "free"

  // Post-migration: trust tier_slug directly.
  if (plan.tier_slug) {
    return getTier(plan.tier_slug).slug
  }

  // Legacy mapping — match by price tier until the migration lands.
  // Source: DB_SCHEMA.md §"الـ Plans الحالية في DB"
  if (plan.price_monthly === 0) return "free"
  if (plan.price_monthly <= 25) return "starter"
  if (plan.price_monthly <= 55) return "pro"
  return "business"
}
