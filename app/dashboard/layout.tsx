import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar userEmail={user.email} />

      {/* Main content — push down on mobile for the fixed topbar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Spacer for the fixed mobile topbar */}
        <div className="lg:hidden h-[65px] shrink-0" aria-hidden="true" />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
