/**
 * Permissions shortcut — re-exports from `config/permissions.ts` plus a
 * server-side convenience wrapper that pulls the role from the session.
 *
 * Use the pure `hasPermission(role, perm)` for client-side checks and
 * `userHasPermission(user, perm)` for server-side checks where you already
 * have a CurrentUser in hand.
 */

import {
  hasPermission,
  type Permission,
  type Role,
} from "@/config/permissions"
import type { CurrentUser } from "@/types/auth"

export { hasPermission }
export type { Permission, Role }

/**
 * Check a permission against a CurrentUser. Equivalent to
 * `hasPermission(user.role, perm)` but the signature reads more naturally
 * at call sites.
 *
 * @example
 *   if (!userHasPermission(user, "campaigns.create")) {
 *     return <UpgradePrompt feature="campaigns" />
 *   }
 */
export function userHasPermission(
  user: CurrentUser,
  permission: Permission,
): boolean {
  return hasPermission(user.role, permission)
}
