"use client"

/**
 * Dashboard topbar — extracted from the inline JSX in app/dashboard/layout.tsx.
 *
 * Same chips as before (BalanceChip, NotificationsBell, UserAvatar) plus
 * the LangToggle that was previously only on public pages. Sticky to the
 * top of the viewport so it stays accessible while scrolling.
 *
 * No business logic, no data fetches — composes 4 existing client components.
 */

import { BalanceChip } from "@/components/dashboard/balance-chip"
import { NotificationsBell } from "@/components/dashboard/notifications-bell"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { LangToggle } from "@/components/lang-toggle"

export function DashboardTopbar() {
  return (
    <div
      className={
        "sticky top-0 z-20 h-14 border-b border-border " +
        "bg-background/80 backdrop-blur-md " +
        "flex items-center justify-end gap-3 px-4 lg:px-6 shrink-0"
      }
    >
      <BalanceChip />
      <div className="flex items-center gap-2">
        <LangToggle />
        <NotificationsBell />
        <UserAvatar />
      </div>
    </div>
  )
}
