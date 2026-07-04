import type { MetadataRoute } from "next"

/**
 * Public sitemap for search engines. Includes only public, indexable pages —
 * dashboard, admin, and API routes are excluded (also disallowed in robots.ts).
 *
 * Priorities:
 *   1.0 — landing (highest)
 *   0.8 — high-intent conversion pages (register, pricing sections on landing)
 *   0.6 — informational (docs)
 *   0.5 — auth and account flows
 *   0.3 — legal / compliance pages
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.basmaweb.com"
  const now = new Date()
  return [
    { url: base,                  lastModified: now, changeFrequency: "weekly",  priority: 1 },
    { url: base + "/register",    lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: base + "/login",       lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: base + "/docs",        lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
    { url: base + "/privacy",     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: base + "/terms",       lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: base + "/data-deletion", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]
}
