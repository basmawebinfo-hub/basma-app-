import type { MetadataRoute } from "next"

/**
 * Public sitemap for search engines. Includes only pages that exist —
 * everything behind the retired platform (auth, dashboard, docs) is gone.
 *
 * Priorities:
 *   1.0 — landing (highest)
 *   0.3 — legal pages
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.basmaweb.com"
  const now = new Date()
  return [
    { url: base,              lastModified: now, changeFrequency: "weekly",  priority: 1 },
    { url: base + "/privacy", lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: base + "/terms",   lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ]
}
