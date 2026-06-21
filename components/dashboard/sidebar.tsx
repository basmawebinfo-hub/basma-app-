"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquare, Plug, Webhook, BarChart2, Settings, Menu, X, Megaphone, Bot, CreditCard, BookOpen } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

const SIDEBAR_LINKS = [
  { icon: LayoutDashboard, key: "sb.overview",    href: "/dashboard" },
  { icon: MessageSquare,   key: "sb.inbox",       href: "/dashboard/inbox" },
  { icon: Plug,            key: "sb.connections", href: "/dashboard/connect" },
  { icon: Megaphone,       key: "sb.campaigns",   href: "/dashboard/campaigns" },
  { icon: Bot,             key: "sb.autoReply",   href: "/dashboard/auto-reply" },
  { icon: Webhook,         key: "sb.webhooks",    href: "/dashboard/webhooks" },
  { icon: BarChart2,       key: "sb.analytics",   href: "/dashboard/analytics" },
  { icon: Settings,        key: "sb.settings",    href: "/dashboard/settings" },
  { icon: CreditCard,      key: "sb.pricing",     href: "/dashboard/pricing" },
  { icon: BookOpen,        key: "sb.apiDocs",     href: "/dashboard/docs" },
]

interface SidebarProps {
  userEmail?: string | null
}

export function DashboardSidebar({ userEmail }: SidebarProps) {
  const { t } = useI18n()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {SIDEBAR_LINKS.map((link) => {
        const Icon = link.icon
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground font-medium"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
            {t(link.key)}
          </Link>
        )
      })}
    </>
  )

  

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-sidebar">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <img src="/basma-logo.png" alt="BASMA" className="h-7 w-auto object-contain" />
        </div>
        <nav className="px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Sidebar navigation">
          <NavLinks />
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar panel */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-56 bg-sidebar border-r border-border transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <img src="/basma-logo.png" alt="BASMA" className="h-7 w-auto object-contain" />
          </div>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks onClick={() => setSidebarOpen(false)} />
        </nav>
      </aside>

      {/* Mobile topbar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center gap-3 px-4 py-4 border-b border-border bg-background">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <img src="/basma-logo.png" alt="BASMA" className="h-7 w-auto object-contain" />
      </header>
    </>
  )
}
