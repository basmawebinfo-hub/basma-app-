"use client"

/**
 * Hydrates the CurrentUserContext on the client.
 *
 * Mounted by the dashboard + admin layouts after they have fetched the
 * user server-side via `requireUser()` / `requireAdmin()`. By the time
 * this provider renders, the user is guaranteed non-null and
 * authenticated — so children that call `useCurrentUser()` will always
 * get a value (no null checks needed in dashboard code).
 *
 * Public pages and the marketing site do NOT mount this provider, so
 * `useCurrentUser()` returning `null` is the signal that we're outside
 * an authenticated zone.
 */

import { CurrentUserContext } from "@/hooks/useCurrentUser"
import type { CurrentUser } from "@/types/auth"

export function CurrentUserProvider({
  user,
  children,
}: {
  user: CurrentUser
  children: React.ReactNode
}) {
  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  )
}
