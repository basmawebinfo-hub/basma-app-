import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import localFont from "next/font/local"
import "./globals.css"
import { I18nProvider } from "@/lib/i18n"
import { MotionProvider } from "@/components/motion-provider"
import { SkipLink } from "@/components/skip-link"

// Self-hosted fonts (OFL-1.1) — no build-time network dependency.
// Arabic: IBM Plex Sans Arabic (technical tone, pairs with Plex Mono).
// Latin: Space Grotesk (BASMA wordmark, English UI, inline Latin in Arabic copy).
// Mono: IBM Plex Mono (code blocks / workflow diagrams).
const plexArabic = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic-arabic-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: true,
})

// Space Grotesk sits FIRST in --font-sans so mixed Arabic/Latin lines get
// per-glyph fallback: Latin renders here, Arabic falls through to plexArabic.
//
// adjustFontFallback MUST stay false. When enabled, next/font emits a
// metric-adjusted "Space Grotesk Fallback" derived from Arial — and Arial has
// full Arabic coverage, so it intercepts every Arabic glyph one slot before
// plexArabic is ever reached. The site then renders Arabic in Arial while
// appearing to load Plex correctly. Verified by measuring rendered text width:
// with the fallback on, the stack measured 547.2px against plexArabic's
// 578.48px; with it off, the stack matches Plex.
//
// Cost of disabling: no metric-matched fallback for Latin during font swap.
// Acceptable — the file is self-hosted and preloaded, so the swap window is
// tiny, and rendering the whole site's Arabic in the wrong face is far worse.
const spaceGrotesk = localFont({
  src: [
    { path: "./fonts/space-grotesk-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/space-grotesk-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/space-grotesk-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
})

const plexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
})

const SITE = "https://www.basmaweb.com"

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    // ~57 chars — fits Google's title pixel budget without truncation.
    default: "بصمة | طريقك تبقى AI Automation Engineer",
    template: "%s | بصمة BASMA",
  },
  description:
    // ~150 chars. Leads with the search intent (تعلم الذكاء الاصطناعي بالعربي)
    // and closes on the differentiator (الاشتراك من غير كارت دولي).
    "بصمة — مسار عربي متدرّج من الصفر لتتعلّم الأتمتة والذكاء الاصطناعي وتبقى AI Automation Engineer. وخدمات تساعدك تشترك في أدوات الذكاء الاصطناعي والكورسات من غير كارت دولي.",
  keywords: [
    // Intent-led, not product-led. Every term below is something a real person
    // in Egypt or the Gulf actually types.
    "تعلم الذكاء الاصطناعي بالعربي", "كورس ذكاء اصطناعي بالعربي", "أتمتة بالذكاء الاصطناعي",
    "AI Automation Engineer", "مسار الذكاء الاصطناعي", "تعلم n8n بالعربي",
    "الاشتراك في ChatGPT من مصر", "الدفع لأدوات الذكاء الاصطناعي بدون فيزا",
    "اشتراك أدوات الذكاء الاصطناعي فودافون كاش", "كورسات أونلاين الدفع بالجنيه",
    "بصمة", "بصمة ويب", "basma", "basma web",
    "learn AI automation in Arabic", "AI automation engineer roadmap",
    "subscribe to AI tools without international card", "AI courses Egypt",
  ],
  authors: [{ name: "BASMA" }],
  creator: "BASMA",
  publisher: "BASMA",
  applicationName: "BASMA بصمة",
  // No `languages` hreflang map: the ar/en toggle is client-side (localStorage),
  // not routed. The previous value pointed at /en, which has never existed —
  // advertising a 404 as an alternate is worse than declaring none. If English
  // ever gets its own routes, add the map back then.
  alternates: { canonical: SITE },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: SITE,
    siteName: "BASMA بصمة",
    title: "بصمة | طريقك تبقى AI Automation Engineer",
    description:
      "مسار عربي متدرّج لتتعلّم الأتمتة والذكاء الاصطناعي، وخدمات تساعدك تشترك في أدوات الذكاء الاصطناعي من غير كارت دولي.",
    images: [{ url: "/basma-icon.png", width: 512, height: 512, alt: "BASMA بصمة" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "بصمة | طريقك تبقى AI Automation Engineer",
    description:
      "مسار عربي متدرّج لتتعلّم الأتمتة والذكاء الاصطناعي، وخدمات اشتراك بدون كارت دولي.",
    images: ["/basma-icon.png"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "technology",
  generator: "Next.js",
}

export const viewport: Viewport = {
  themeColor: "#141414",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`dark ${plexArabic.variable} ${spaceGrotesk.variable} ${plexMono.variable}`}
    >
      <head>
        {/* Restore the saved locale before first paint so lang/dir match the
            user's choice without a flash of the wrong direction. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var l=localStorage.getItem("basma_lang");if(l==="en"||l==="ar"){document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr"}}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            /* EducationalOrganization rather than plain Organization: the
               academy is the primary offering, and the more specific type is
               what Google uses for course-related rich results.
               Deliberately absent: aggregateRating, numberOfStudents, alumni,
               award — none of which we can evidence. Structured data that
               overstates is a manual-action risk, not a ranking shortcut. */
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "BASMA بصمة",
              alternateName: "BASMA",
              url: SITE,
              logo: SITE + "/basma-icon.png",
              description:
                "أكاديمية عربية لتعلّم الأتمتة والذكاء الاصطناعي، وخدمات تساعدك تشترك في أدوات الذكاء الاصطناعي والكورسات من غير كارت دولي.",
              areaServed: { "@type": "Country", name: "Egypt" },
              knowsLanguage: ["ar", "en"],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                telephone: "+201281926228",
                availableLanguage: ["ar", "en"],
              },
            }),
          }}
        />
      </head>
      {/* .grain lays a fixed fractal-noise overlay over everything — the
          reference's paper texture translated to a dark surface. */}
      <body className="font-sans antialiased min-h-screen grain">
        <I18nProvider>
          <MotionProvider>
            <SkipLink />
            {children}
          </MotionProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
