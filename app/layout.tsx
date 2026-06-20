import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, PT_Mono, Cairo } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { I18nProvider } from "@/lib/i18n"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _ptMono = PT_Mono({ weight: "400", subsets: ["latin"], variable: "--font-pt-mono" })
const _cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" })

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
    <html lang="ar" dir="rtl" className={`dark ${_ptMono.variable} ${_cairo.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "BASMA بصمة",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: "أول منصة عربية لأتمتة واتساب وإدارة المحادثات.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              url: SITE,
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <I18nProvider>
          {children}
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
