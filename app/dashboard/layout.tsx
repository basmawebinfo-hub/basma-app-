import { requireUser } from "@/lib/auth/guards"
import { CurrentUserProvider } from "@/components/providers/current-user-provider"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { NotificationsBell } from "@/components/dashboard/notifications-bell"
import { BalanceChip } from "@/components/dashboard/balance-chip"
import { UserAvatar } from "@/components/dashboard/user-avatar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // requireUser() handles every redirect: no session → /login,
  // suspended → /suspended, pending → /pending. No null check needed below.
  const user = await requireUser()

  // Admins have no user dashboard — the middleware redirects them to /admin.

  return (
    <CurrentUserProvider user={user}>
      <div className="min-h-screen bg-background flex">
        <DashboardSidebar userEmail={user.auth.email} />

        <div className="flex-1 flex flex-col min-w-0">
          <div className="lg:hidden h-[65px] shrink-0" aria-hidden="true" />
          {/* Topbar with notifications (for users to see admin messages) */}
          <div className="h-14 border-b border-border flex items-center justify-end gap-3 px-4 shrink-0">
            <BalanceChip />
            <NotificationsBell />
            <UserAvatar />
          </div>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </CurrentUserProvider>
  )
}
