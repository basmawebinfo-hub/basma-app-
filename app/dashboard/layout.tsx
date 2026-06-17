import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { NotificationsBell } from "@/components/dashboard/notifications-bell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Admins have no user dashboard — the middleware redirects them to /admin.

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar userEmail={user.email} />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden h-[65px] shrink-0" aria-hidden="true" />
        {/* Topbar with notifications (for users to see admin messages) */}
        <div className="h-14 border-b border-border flex items-center justify-end gap-2 px-4 shrink-0">
          <NotificationsBell />
        </div>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
