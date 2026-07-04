/** @type {import('next').NextConfig} */

/**
 * Baseline security headers applied to every response.
 *
 * Content-Security-Policy is intentionally deployed in **Report-Only mode** for
 * an observation window (roughly 3-7 days). During that window we watch the
 * browser console + Sprint 0.5 smoke suite for legitimate violations. When the
 * policy is clean, a follow-up PR flips the header key from
 * `Content-Security-Policy-Report-Only` to `Content-Security-Policy` — no
 * value change, just the header name.
 *
 * Report-Only mode does NOT block anything. Users cannot experience breakage
 * from this policy today.
 *
 * The policy is only emitted in production. In development we omit it to
 * avoid flooding the local console with false positives from Next.js's dev
 * overlay, HMR websocket, and inline `eval` usage that only exists in dev.
 */

// ---------------------------------------------------------------------------
// CSP directives — Report-Only during the observation window.
//
// Notes on each choice:
//   - default-src 'self'
//       Everything not explicitly allowed must come from our own origin.
//
//   - script-src 'self' 'unsafe-inline'
//       Next.js emits inline <script> for hydration data + bootstrap. That
//       needs 'unsafe-inline'. We deliberately do NOT include 'unsafe-eval'
//       because framer-motion 12.x usage here is limited to declarative
//       animate={{opacity, x, y, pathLength}} objects and there is no
//       useMotionTemplate/useMotionValueEvent/new Function() anywhere in the
//       repo (verified by grep at PR-authoring time). If Report-Only surfaces
//       an eval violation later, a follow-up PR re-adds 'unsafe-eval' with a
//       clear reason. See §Evolution below.
//
//   - style-src 'self' 'unsafe-inline'
//       Tailwind + Next.js + framer-motion all emit inline styles.
//
//   - font-src 'self' data:
//       next/font/google self-hosts fonts under _next/static/media/. data:
//       covers base64-inlined fonts that some build tools emit.
//
//   - img-src 'self' data: blob: https:
//       data: for inline SVG, blob: for next/image blur placeholders,
//       https: as a defensive allowlist for future avatars/product images.
//       Tightened later when we know exact origins.
//
//   - connect-src 'self' https://*.supabase.co wss://*.supabase.co
//       Supabase JS SDK REST + Realtime WebSocket. Wildcard covers project
//       subdomain. Vercel Analytics uses same-origin /_vercel/insights proxy.
//
//   - frame-src 'self'
//       We do not embed any third-party iframes today.
//
//   - frame-ancestors 'none'
//       Modern equivalent of X-Frame-Options: DENY. Kept alongside XFO for
//       older browsers.
//
//   - base-uri 'self', form-action 'self', object-src 'none'
//       Defense-in-depth against tag injection.
//
// Evolution of this policy:
//   1. THIS PR: emit as Content-Security-Policy-Report-Only in production only.
//   2. OBSERVATION WINDOW: watch console for real violations for 3-7 days.
//   3. FOLLOW-UP PR: adjust directives if needed, then flip the header key
//      from `-Report-Only` to enforced `Content-Security-Policy`.
// ---------------------------------------------------------------------------
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ")

/**
 * Baseline security headers applied to every response.
 *
 * Scope: additive only. HSTS is already delivered by Vercel's edge (verified in
 * Phase L QA), so we do NOT set it here.
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
 *   - Content-Security-Policy-Report-Only: emitted in production only (see block above).
 */
const baseSecurityHeaders = [
  { key: "X-Frame-Options",          value: "DENY" },
  { key: "X-Content-Type-Options",   value: "nosniff" },
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
]

const isProd = process.env.NODE_ENV === "production"

// Only add the CSP header in production. In development, omitting it keeps
// the local console free of false-positive violations from Next.js's dev
// overlay + HMR websocket.
const securityHeaders = isProd
  ? [
      ...baseSecurityHeaders,
      { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
    ]
  : baseSecurityHeaders

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
