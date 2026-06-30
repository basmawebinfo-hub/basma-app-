/**
 * Authorization guards for Server Components and Server Actions.
 *
 * These throw `redirect()` or `notFound()` to short-circuit the render —
 * Next.js intercepts them. The signature lets you write linear code:
 *
 *     const user = await requireUser()
 *     requireRole(user, "admin")
 *     // ... if we got here, both checks passed
 *
 * For more granular checks (per-permission), use `hasPermission(user.role, "...")`
 * directly from `config/permissions.ts`.
 *
 * Source spec: SYSTEM_ARCHITECTURE.md §4.2 (Authorization Layers — Layer 2)
 */

import "server-only"
import { redirect } from "next/navigation"
import { ROUTES } from "@/config/constants"
import { tierMeets, type TierSlug } from "@/config/tiers"
import { hasPermission, type Permission, type Role } from "@/config/permissions"
import { getCurrentUser } from "./session"
import type { CurrentUser } from "@/types/auth"

/**
 * Require a logged-in user. Redirects to /login if not.
 *
 * Optionally pass `{ allowPending: true }` to permit users with
 * `profile.status === "pending"` through — useful for the pending-approval
 * landing page itself.
 */
export async function requireUser(opts?: {
  allowPending?: boolean
  allowSuspended?: boolean
}): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) {
    redirect(ROUTES.login)
  }

  if (user.profile.status === "suspended" && !opts?.allowSuspended) {
    redirect(ROUTES.suspended)
  }

  if (user.profile.status === "pending" && !opts?.allowPending) {
    redirect(ROUTES.pending)
  }

  return user
}

/**
 * Require the current user to have one of the given roles.
 * Redirects to /dashboard with no info disclosure if they don't.
 */
export function requireRole(user: CurrentUser, ...roles: Role[]): void {
  if (!roles.includes(user.role)) {
    redirect(ROUTES.dashboard)
  }
}

/**
 * Require a specific permission. Wraps `hasPermission()` with a redirect.
 */
export function requirePermission(
  user: CurrentUser,
  permission: Permission,
): void {
  if (!hasPermission(user.role, permission)) {
    redirect(ROUTES.dashboard)
  }
}

/**
 * Require the user to be on at least the given tier. Used for feature gates
 * at route-level (page-level gating). For inline UI gating, use the
 * `<FeatureGate>` component instead so the user sees an upgrade prompt.
 *
 * @example
 *   const user = await requireUser()
 *   requireTier(user, "pro")  // Free/Starter → redirected to /pricing
 */
export function requireTier(user: CurrentUser, minTier: TierSlug): void {
  if (!tierMeets(user.tier, minTier)) {
    redirect(ROUTES.dashboardPricing)
  }
}

/**
 * Admin guard — shorthand for `requireRole(user, "admin")` after
 * `requireUser()`. Used by every page under /admin/*.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser()
  requireRole(user, "admin")
  return user
}
