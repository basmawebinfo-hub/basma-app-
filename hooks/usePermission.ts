"use client"

/**
 * Returns `true` if the current user has the given permission.
 *
 * For users with no session, returns `false` (matches the "viewer" fallback —
 * unauthenticated visitors can't do anything mutating).
 */

import { useCurrentUser } from "./useCurrentUser"
import { hasPermission, type Permission } from "@/config/permissions"

export function usePermission(permission: Permission): boolean {
  const user = useCurrentUser()
  if (!user) return false
  return hasPermission(user.role, permission)
}
