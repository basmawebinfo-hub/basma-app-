"use client"
import Link from "next/link"
import { LayoutDashboard, Users, Server, Wallet, ScrollText, ShieldCheck, LogOut, MessageCircle } from "lucide-react"
import { logout } from "@/app/actions/auth"
import { useI18n } from "@/lib/i18n"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n()
  const NAV = [
    { href: "/admin", key: "adm.navOverview", icon: LayoutDashboard },
    { href: "/admin/users", key: "adm.navUsers", icon: Users },
    { href: "/admin/instances", key: "adm.navConnections", icon: Server },
    { href: "/admin/billing", key: "adm.navBilling", icon: Wallet },
    { href: "/admin/support", key: "adm.navSupport", icon: MessageCircle },
    { href: "/admin/logs", key: "adm.navLogs", icon: ScrollText },
    { href: "/admin/admins", key: "adm.navAdmins", icon: ShieldCheck },
  ]
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-60 border-e border-border bg-card/40 flex flex-col shrink-0">
        <div className="p-5 border-b border-border">
          <img src="/basma-logo.png" alt="BASMA" className="h-7 w-auto object-contain mb-2" />
          <p className="text-xs text-muted-foreground">{t("adm.panel")}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-primary/10 transition-colors">
              <item.icon className="w-4 h-4" />
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <form action={logout}>
            <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 rounded-lg">
              <LogOut className="w-4 h-4" /> {t("adm.signout")}
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
