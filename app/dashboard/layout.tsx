"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  Plug,
  Webhook,
  BarChart2,
  Settings,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const SIDEBAR_LINKS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: MessageSquare, label: "Inbox", href: "/dashboard/inbox" },
  { icon: Plug, label: "Connections", href: "/dashboard/connect" },
  { icon: Webhook, label: "Webhooks", href: "/dashboard/webhooks" },
  { icon: BarChart2, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-sidebar">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span
            className="font-[family-name:var(--font-pt-mono)] font-bold text-sm text-sidebar-foreground"
            style={{ letterSpacing: "-0.05em" }}
          >
            BASMA
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Sidebar navigation">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            &larr; Back to landing page
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-56 bg-sidebar border-r border-border transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span
              className="font-[family-name:var(--font-pt-mono)] font-bold text-sm text-sidebar-foreground"
              style={{ letterSpacing: "-0.05em" }}
            >
              BASMA
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-4 border-b border-border bg-background">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span
            className="font-[family-name:var(--font-pt-mono)] font-bold text-sm"
            style={{ letterSpacing: "-0.05em" }}
          >
            BASMA
          </span>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
