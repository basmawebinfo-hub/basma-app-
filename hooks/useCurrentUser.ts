"use client"

/**
 * Client-side hook for the current user.
 *
 * This hook reads from `CurrentUserContext`, which is populated by
 * `<CurrentUserProvider>` mounted at the dashboard layout level. The
 * provider hydrates from a Server Component's `getCurrentUser()` call.
 *
 * Returns `null` when:
 *   - The provider is not yet mounted (e.g. on public pages)
 *   - The user is genuinely not logged in
 *
 * For pages that REQUIRE a user, prefer `requireUser()` in a Server
 * Component — that throws a redirect, so by the time client code runs,
 * `useCurrentUser()` is guaranteed non-null.
 */

import { createContext, useContext } from "react"
import type { CurrentUser } from "@/types/auth"

export const CurrentUserContext = createContext<CurrentUser | null>(null)

export function useCurrentUser(): CurrentUser | null {
  return useContext(CurrentUserContext)
}
