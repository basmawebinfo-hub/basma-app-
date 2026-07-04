/** @type {import('next').NextConfig} */

/**
 * Baseline security headers applied to every response.
 *
 * Scope: additive only. HSTS is already delivered by Vercel's edge (verified in
 * Phase L QA), so we do NOT set it here. Content-Security-Policy is intentionally
 * NOT included in this patch — CSP requires per-provider allowlisting (Vercel
 * Analytics, Supabase, Evolution, Telegram, image CDNs) and warrants its own PR
 * with Report-Only rollout before enforcement.
 *
 * What each header does:
 *   - X-Frame-Options: DENY — prevents any origin from framing basmaweb.com,
 *     blocking clickjacking. We have no legitimate embed use case.
 *   - X-Content-Type-Options: nosniff — stops browsers from re-interpreting the
 *     Content-Type we send, closing MIME confusion attacks.
 *   - Referrer-Policy: strict-origin-when-cross-origin — the modern default; keeps
 *     path/query private when linking off-site.
 *   - Permissions-Policy: camera/microphone/geolocation denied — we don't use any
 *     of these APIs, so deny by default.
 */
const securityHeaders = [
  { key: "X-Frame-Options",          value: "DENY" },
  { key: "X-Content-Type-Options",   value: "nosniff" },
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
]

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Apply to every route (including /api/*). Individual API routes can
        // still add extra headers via NextResponse; these are the baseline.
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
