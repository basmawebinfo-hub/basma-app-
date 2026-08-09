/**
 * App-wide constants.
 *
 * Anything that:
 *   - is referenced in more than one place
 *   - might need to change at one well-known location
 *   - is a "magic value" otherwise
 * lives here.
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
 * Responsive breakpoints — kept aligned with Tailwind so the
 * `useBreakpoint` hook returns values that match CSS.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const
