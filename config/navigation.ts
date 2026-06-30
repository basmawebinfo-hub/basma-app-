/**
 * Navigation configuration — sidebar items and public nav links.
 *
 * Single-level sidebar (no submenus). Sub-views live as Tabs inside the page.
 * This is an Extensibility Rule from SYSTEM_ARCHITECTURE.md §13 and
 * DASHBOARD_INFORMATION_ARCHITECTURE.md §3.1.
 *
 * Adding a sidebar item:
 *   1. Add the entry below.
 *   2. (Optional) Gate it with a feature flag from `config/tiers.ts`
 *      using `requiresFeature`. Items the current tier lacks will render
 *      with a lock icon + tooltip pointing to the upgrade.
 *   3. (Optional) Gate by permission using `requiresPermission`.
 *
 * Order matters — the list below is the visual order in the UI.
 */

import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  CreditCard,
  Bell,
  Settings,
  Briefcase,
  FlaskConical,
  FileText,
  Users,
  LayoutDashboard,
} from "lucide-react"
import type { Permission } from "./permissions"
import { ROUTES } from "./constants"

export type SidebarItem = {
  /** Stable id used for analytics events + active matching. */
  id: string
  /** Display label (i18n key would go here in a fuller setup). */
  label: { ar: string; en: string }
  /** Lucide icon */
  icon: LucideIcon
  /** Destination path */
  href: string
  /** If set, render with lock unless the user's tier has this feature. */
  requiresFeature?:
    | "academyAccess"
    | "labViewDemos"
    | "whatsappService"
    | "teamInbox"
  /** If set, hide from users lacking this permission. */
  requiresPermission?: Permission
  /** Roadmap phase that introduces this — used to render "Coming soon" badges. */
  comingInPhase?: 2 | 3 | 4
}

/**
 * Authenticated user sidebar.
 *
 * Source spec: DASHBOARD_INFORMATION_ARCHITECTURE.md §3.1
 */
export const SIDEBAR_ITEMS: ReadonlyArray<SidebarItem> = [
  {
    id: "dashboard",
    label: { ar: "الرئيسية", en: "Dashboard" },
    icon: LayoutDashboard,
    href: ROUTES.dashboard,
  },
  {
    id: "academy",
    label: { ar: "الأكاديمية", en: "Academy" },
    icon: BookOpen,
    href: "/dashboard/academy",
    comingInPhase: 2,
  },
  {
    id: "lab",
    label: { ar: "المختبر", en: "AI Lab" },
    icon: FlaskConical,
    href: "/dashboard/lab",
  },
  {
    id: "services",
    label: { ar: "الخدمات", en: "Services" },
    icon: Briefcase,
    href: ROUTES.dashboardConnect,
    requiresFeature: "whatsappService",
  },
  {
    id: "templates",
    label: { ar: "القوالب", en: "Templates" },
    icon: FileText,
    href: "/dashboard/templates",
    comingInPhase: 3,
  },
  {
    id: "community",
    label: { ar: "المجتمع", en: "Community" },
    icon: Users,
    href: "/dashboard/community",
    comingInPhase: 3,
  },
  {
    id: "billing",
    label: { ar: "الاشتراك", en: "Billing" },
    icon: CreditCard,
    href: ROUTES.dashboardPricing,
  },
  {
    id: "notifications",
    label: { ar: "الإشعارات", en: "Notifications" },
    icon: Bell,
    href: "/dashboard/notifications",
  },
  {
    id: "settings",
    label: { ar: "الإعدادات", en: "Settings" },
    icon: Settings,
    href: ROUTES.dashboardSettings,
  },
]

/**
 * Public site top navigation (the marketing site).
 */
export type PublicNavItem = {
  id: string
  label: { ar: string; en: string }
  href: string
}

export const PUBLIC_NAV: ReadonlyArray<PublicNavItem> = [
  { id: "home", label: { ar: "الرئيسية", en: "Home" }, href: "/" },
  { id: "services", label: { ar: "الخدمات", en: "Services" }, href: "/services" },
  { id: "academy", label: { ar: "الأكاديمية", en: "Academy" }, href: "/academy" },
  { id: "lab", label: { ar: "المختبر", en: "Lab" }, href: "/lab" },
  { id: "pricing", label: { ar: "الأسعار", en: "Pricing" }, href: "/pricing" },
  { id: "docs", label: { ar: "التوثيق", en: "Docs" }, href: "/docs" },
]
