import Link from "next/link"
import { LayoutDashboard, Users, Server, Wallet, ScrollText, ShieldCheck, LogOut, MessageCircle } from "lucide-react"
import { logout } from "@/app/actions/auth"

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/instances", label: "Connections", icon: Server },
  { href: "/admin/billing", label: "Billing", icon: Wallet },
  { href: "/admin/support", label: "Support Chat", icon: MessageCircle },
  { href: "/admin/logs", label: "Activity Log", icon: ScrollText },
  { href: "/admin/admins", label: "Admins", icon: ShieldCheck },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-60 border-r border-border bg-card/40 flex flex-col shrink-0">
        <div className="p-5 border-b border-border">
          <h1 className="text-lg font-bold text-primary">BASMA Admin</h1>
          <p className="text-xs text-muted-foreground mt-1">Owner control panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-primary/10 transition-colors">
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <form action={logout}>
            <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 rounded-lg">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
