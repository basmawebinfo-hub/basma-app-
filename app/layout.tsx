import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import localFont from "next/font/local"
import "./globals.css"
import { I18nProvider } from "@/lib/i18n"
import { MotionProvider } from "@/components/motion-provider"

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

const spaceGrotesk = localFont({
  src: [
    { path: "./fonts/space-grotesk-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/space-grotesk-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/space-grotesk-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
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
    default: "بصمة | BASMA — أول منصة عربية لأتمتة واتساب",
    template: "%s | BASMA بصمة",
  },
  description:
    "بصمة (BASMA) — أول منصة عربية متكاملة لأتمتة واتساب وإدارة المحادثات. اربط أرقامك، استقبل وأرسل الرسائل، واربطها بـ n8n وMake لأتمتة كاملة. The first Arabic WhatsApp automation platform.",
  keywords: [
    "بصمة", "بصمة ويب", "اتمتة واتساب", "واتساب بيزنس", "أول منصة عربية", "أتمتة الرسائل",
    "ربط واتساب n8n", "واتساب API", "إدارة عملاء واتساب", "بوت واتساب", "رسائل تلقائية",
    "basma", "basma web", "whatsapp automation", "whatsapp business api", "arabic whatsapp platform",
    "n8n whatsapp", "make whatsapp", "whatsapp webhook", "customer messaging",
  ],
  authors: [{ name: "BASMA" }],
  creator: "BASMA",
  publisher: "BASMA",
  applicationName: "BASMA بصمة",
  alternates: { canonical: SITE, languages: { "ar": SITE, "en": SITE + "/en" } },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: "en_US",
    url: SITE,
    siteName: "BASMA بصمة",
    title: "بصمة | BASMA — أول منصة عربية لأتمتة واتساب",
    description: "أول منصة عربية متكاملة لأتمتة واتساب وإدارة المحادثات وربطها بأدوات الأتمتة.",
    images: [{ url: "/basma-icon.png", width: 512, height: 512, alt: "BASMA بصمة" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "بصمة | BASMA — أول منصة عربية لأتمتة واتساب",
    description: "أول منصة عربية متكاملة لأتمتة واتساب وإدارة المحادثات.",
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BASMA بصمة",
              url: SITE,
              logo: SITE + "/basma-icon.png",
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <I18nProvider>
          <MotionProvider>{children}</MotionProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
