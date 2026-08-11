import type { MetadataRoute } from "next"
import { SERVICES } from "@/config/services"

/**
 * Public sitemap.
 *
 * The academy is deliberately absent. Its pages still build and still work, but
 * they are held back until their own design is decided (PHASE-G) — they carry
 * noindex and nothing links to them. Listing them here would contradict that.
 * Restore the generated course/level entries when the academy launches.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.basmaweb.com"
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...SERVICES.map((svc) => ({
      url: `${base}/services/${svc.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]
}
