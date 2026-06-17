import { redirect } from "next/navigation"
import Link from "next/link"
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

  // Is this user an admin? (show a quick link to the admin panel)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin"

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar userEmail={user.email} />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden h-[65px] shrink-0" aria-hidden="true" />
        {/* Topbar with notifications + admin link */}
        <div className="h-14 border-b border-border flex items-center justify-end gap-2 px-4 shrink-0">
          {isAdmin && (
            <Link href="/admin" className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20">
              لوحة الأدمن
            </Link>
          )}
          <NotificationsBell />
        </div>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
