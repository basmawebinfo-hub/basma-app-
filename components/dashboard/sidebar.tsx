"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, MessageSquare, Plug, Webhook, BarChart2, Settings,
  Menu, X, Megaphone, Bot, CreditCard, BookOpen, FlaskConical, Bell,
  Lock,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { useFeatureFlag } from "@/hooks/useFeatureFlag"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import type { FeatureFlag } from "@/lib/feature-flags"

type SidebarLink = {
  icon: typeof LayoutDashboard
  key: string
  href: string
  comingInPhase?: 2 | 3 | 4
  requiresFeature?: FeatureFlag
}

type SidebarSection = {
  /** i18n key for the section header label (null = no header) */
  labelKey: string | null
  items: ReadonlyArray<SidebarLink>
}

/**
 * Sidebar grouped into 3 sections for visual hierarchy.
 * - Workspace: the daily operational items (overview + WhatsApp)
 * - Learn: academy + lab + notifications (the "BASMA Academy" pillar)
 * - Account: settings, pricing, docs
 *
 * Same items as before; only grouped now. The order inside each group
 * matches the previous flat list so muscle memory is preserved.
 */
const SIDEBAR_SECTIONS: ReadonlyArray<SidebarSection> = [
  {
    labelKey: null, // first group has no header — it starts at the top
    items: [
      { icon: LayoutDashboard, key: "sb.overview",      href: "/dashboard" },
      { icon: MessageSquare,   key: "sb.inbox",         href: "/dashboard/inbox" },
      { icon: Plug,            key: "sb.connections",   href: "/dashboard/connect" },
      { icon: Megaphone,       key: "sb.campaigns",     href: "/dashboard/campaigns" },
      { icon: Bot,             key: "sb.autoReply",     href: "/dashboard/auto-reply" },
      { icon: Webhook,         key: "sb.webhooks",      href: "/dashboard/webhooks" },
      { icon: BarChart2,       key: "sb.analytics",     href: "/dashboard/analytics" },
    ],
  },
  {
    labelKey: "sb.sectionLearn",
    items: [
      { icon: BookOpen,     key: "sb.academy", href: "/dashboard/academy",
        comingInPhase: 2,   requiresFeature: "academyAccess" },
      { icon: FlaskConical, key: "sb.lab",     href: "/dashboard/lab",
        requiresFeature: "labViewDemos" },
      { icon: Bell,         key: "sb.notifications", href: "/dashboard/notifications",
        comingInPhase: 2 },
    ],
  },
  {
    labelKey: "sb.sectionAccount",
    items: [
      { icon: Settings,    key: "sb.settings", href: "/dashboard/settings" },
      { icon: CreditCard,  key: "sb.pricing",  href: "/dashboard/pricing" },
      { icon: BookOpen,    key: "sb.apiDocs",  href: "/dashboard/docs" },
    ],
  },
]

interface SidebarProps {
  userEmail?: string | null
}

export function DashboardSidebar({ userEmail }: SidebarProps) {
  const { t } = useI18n()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const NavBody = ({ onClick }: { onClick?: () => void }) => (
    <nav
      className="flex-1 px-3 py-4 space-y-5 overflow-y-auto"
      aria-label="Sidebar navigation"
    >
      {SIDEBAR_SECTIONS.map((section, idx) => (
        <div key={idx} className="space-y-0.5">
          {section.labelKey && (
            <p className="px-3 pt-1 pb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
              {t(section.labelKey)}
            </p>
          )}
          {section.items.map((link) => (
            <NavItem
              key={link.href}
              link={link}
              active={pathname === link.href}
              onClick={onClick}
              label={t(link.key)}
              soonLabel={t("sb.soon")}
              lockedLabel={t("sb.locked")}
            />
          ))}
        </div>
      ))}
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border bg-sidebar">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <img src="/basma-logo.png" alt="BASMA" className="h-7 w-auto object-contain" />
        </div>
        <NavBody />
        <SidebarUserCard email={userEmail} />
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
          "lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-sidebar border-r border-border transition-transform duration-200 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <img src="/basma-logo.png" alt="BASMA" className="h-7 w-auto object-contain" />
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <NavBody onClick={() => setSidebarOpen(false)} />
        <SidebarUserCard email={userEmail} />
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

/**
 * One item in the sidebar list. Subcomponent so we can call useFeatureFlag()
 * once per row while respecting hooks rules.
 */
function NavItem({
  link,
  active,
  onClick,
  label,
  soonLabel,
  lockedLabel,
}: {
  link: SidebarLink
  active: boolean
  onClick?: () => void
  label: string
  soonLabel: string
  lockedLabel: string
}) {
  const Icon = link.icon
  // Conditional gating, but hook always called.
  const hasFeature = useFeatureFlag(
    link.requiresFeature ?? ("labViewDemos" as FeatureFlag),
  )
  const isLocked = link.requiresFeature ? !hasFeature : false
  const isComingSoon = link.comingInPhase !== undefined

  return (
    <Link
      href={link.href}
      onClick={onClick}
      className={cn(
        // Base
        "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
        "transition-colors duration-150 ease-out group",
        // Active state — subtle accent stripe + tinted bg
        active
          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
        isLocked && !active && "opacity-55",
      )}
      title={isLocked ? lockedLabel : undefined}
      aria-current={active ? "page" : undefined}
      aria-label={isLocked ? `${label} — ${lockedLabel}` : label}
    >
      {/* Active stripe — visible only when active, anchored to the inline-start edge */}
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-primary"
        />
      )}

      <Icon
        className={cn(
          "w-4 h-4 shrink-0 transition-colors duration-150",
          active ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground/90",
        )}
        aria-hidden="true"
      />
      <span className="flex-1 truncate">{label}</span>

      {isLocked && (
        <Lock className="w-3 h-3 shrink-0 opacity-70" aria-hidden="true" />
      )}

      {!isLocked && isComingSoon && (
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0 leading-none",
            active
              ? "bg-primary-foreground/15 text-primary-foreground"
              : "bg-primary/10 text-primary",
          )}
        >
          {soonLabel}
        </span>
      )}
    </Link>
  )
}

/**
 * User card at the bottom of the sidebar — shows avatar (initial) + name/email + tier.
 * Reads from the CurrentUserContext (no extra fetch).
 */
function SidebarUserCard({ email }: { email?: string | null }) {
  const user = useCurrentUser()
  const { t } = useI18n()

  const name = user?.profile.full_name?.trim() || email || ""
  const initial = (name || "?").slice(0, 1).toUpperCase()
  const tier = user?.tier ?? "free"

  // Hide the card entirely if we have no auth context (e.g. SSR fallback).
  if (!user && !email) return null

  return (
    <div className="border-t border-border p-3">
      <Link
        href="/dashboard/settings"
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/60 transition-colors duration-150"
        aria-label={t("sb.openAccount")}
      >
        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-sidebar-foreground truncate">
            {name || t("sb.guest")}
          </p>
          <p className="text-[10px] text-muted-foreground capitalize truncate">
            {tier}
          </p>
        </div>
      </Link>
    </div>
  )
}
