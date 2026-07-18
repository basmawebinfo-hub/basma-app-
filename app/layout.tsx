import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, PT_Mono, Cairo, Rubik } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { I18nProvider } from "@/lib/i18n"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _ptMono = PT_Mono({ weight: "400", subsets: ["latin"], variable: "--font-pt-mono" })
const _cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" })
const _rubik = Rubik({ subsets: ["arabic", "latin"], variable: "--font-rubik" })

const SITE = "https://www.basmaweb.com"

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "BASMA AI — WhatsApp Automation & Workflow Platform",
    template: "%s | BASMA AI",
  },
  description:
    "BASMA AI is a cloud-based workflow automation platform that helps businesses automate communications, organize customer interactions, and improve operational efficiency. Connect WhatsApp, integrate with n8n, Zapier, Make, and any webhook endpoint.",
  keywords: [
    "BASMA AI", "workflow automation", "whatsapp business automation", "customer communication platform",
    "whatsapp integration", "business automation software", "n8n integration", "zapier integration",
    "webhook automation", "customer management", "message automation", "business efficiency",
  ],
  authors: [{ name: "BASMA AI" }],
  creator: "BASMA AI",
  publisher: "BASMA AI",
  applicationName: "BASMA AI",
  alternates: { canonical: SITE, languages: { "ar": SITE, "en": SITE + "/en" } },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE,
    siteName: "BASMA AI",
    title: "BASMA AI — WhatsApp Automation & Workflow Platform",
    description: "Cloud-based workflow automation platform. Connect WhatsApp, automate business processes, integrate with n8n, Zapier, Make.",
    images: [{ url: "/basma-icon.png", width: 512, height: 512, alt: "BASMA AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BASMA AI — WhatsApp Automation & Workflow Platform",
    description: "Automate workflows, connect WhatsApp, integrate with n8n, Zapier, and Make.",
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
    <html lang="ar" dir="rtl" className={`dark ${_ptMono.variable} ${_cairo.variable} ${_rubik.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "BASMA AI",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: "Cloud-based workflow automation platform for business. Connect WhatsApp, automate workflows, integrate with n8n, Zapier, Make.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              url: SITE,
              organization: {
                "@type": "Organization",
                name: "BASMA AI",
                url: SITE,
              },
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
