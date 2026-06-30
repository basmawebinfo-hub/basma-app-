/**
 * App-wide constants.
 *
 * Anything that:
 *   - is referenced in more than one place
 *   - might need to change at one well-known location
 *   - is a "magic value" otherwise
 * lives here.
 *
 * Things that belong in dedicated files instead:
 *   - Tier definitions → config/tiers.ts
 *   - Permission rules → config/permissions.ts
 *   - Navigation items → config/navigation.ts
 *   - Env-derived values → config/env.ts
 */

export const APP = {
  name: "BASMA Web Academy",
  shortName: "BASMA",
  domain: "basmaweb.com",
  url: "https://www.basmaweb.com",
  supportEmail: "support@basmaweb.com",
  defaultLocale: "ar" as const,
  supportedLocales: ["ar", "en"] as const,
} as const

/**
 * Routes used in redirects + nav. Keep these in sync with the App Router file
 * structure. Centralizing them means a rename in one place fixes every link.
 */
export const ROUTES = {
  home: "/",
  pricing: "/pricing",
  login: "/login",
  signup: "/register",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  dashboardConnect: "/dashboard/connect",
  dashboardCampaigns: "/dashboard/campaigns",
  dashboardAutoReply: "/dashboard/auto-reply",
  dashboardInbox: "/dashboard/inbox",
  dashboardWebhooks: "/dashboard/webhooks",
  dashboardAnalytics: "/dashboard/analytics",
  dashboardSettings: "/dashboard/settings",
  dashboardPricing: "/dashboard/pricing",
  dashboardDocs: "/dashboard/docs",
  admin: "/admin",
  pending: "/pending",
  suspended: "/suspended",
} as const

/**
 * Cookie/storage keys. Centralized so we never hit naming collisions and so
 * we can audit what we persist in one glance.
 */
export const STORAGE_KEYS = {
  locale: "basma.locale",
  theme: "basma.theme",
  sidebarCollapsed: "basma.sidebar.collapsed",
  checklistDismissedAt: "basma.checklist.dismissedAt",
} as const

/**
 * Pagination defaults. Used by API routes and infinite-scroll lists.
 */
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const

/**
 * Responsive breakpoints — kept aligned with `tailwind.config` so the
 * `useBreakpoint` hook returns values that match CSS.
 *
 * Source of truth: DASHBOARD_INFORMATION_ARCHITECTURE.md §8.1
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

/**
 * Limits enforced at the application layer (not the DB).
 * For tier-specific limits, see `config/tiers.ts`.
 */
export const LIMITS = {
  // The maximum length of a single WhatsApp text message Evolution accepts.
  whatsappTextMaxLength: 4096,
  // Maximum upload size for avatar/media in bytes (5 MB).
  uploadMaxBytes: 5 * 1024 * 1024,
  // Auto-reply cooldown per contact in seconds (prevents loops).
  autoReplyCooldownSec: 60,
} as const
