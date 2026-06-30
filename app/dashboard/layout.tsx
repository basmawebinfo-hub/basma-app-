import { requireUser } from "@/lib/auth/guards"
import { CurrentUserProvider } from "@/components/providers/current-user-provider"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"

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
          {/* Spacer that mirrors the height of the mobile topbar (rendered by the Sidebar component) */}
          <div className="lg:hidden h-[65px] shrink-0" aria-hidden="true" />
          <DashboardTopbar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </CurrentUserProvider>
  )
}
