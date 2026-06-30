import { requireAdmin } from "@/lib/auth/guards"
import { CurrentUserProvider } from "@/components/providers/current-user-provider"
import { AdminShell } from "./_components/admin-shell"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Hard gate: any non-admin who reaches this layout is redirected.
  // (The middleware already does an early check, but defense in depth.)
  const user = await requireAdmin()

  return (
    <CurrentUserProvider user={user}>
      <AdminShell>{children}</AdminShell>
    </CurrentUserProvider>
  )
}
