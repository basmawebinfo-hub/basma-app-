"use client"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export function Footer() {
  const { t } = useI18n()
  const cols = [
    { titleKey: "footer.product", links: [
      { key: "footer.features", href: "#how-it-works" },
      { key: "footer.pricing", href: "#pricing" },
      { key: "footer.faq", href: "#faq" },
    ]},
    { titleKey: "footer.company", links: [
      { key: "footer.about", href: "/about" },
      { key: "footer.contact", href: "/contact" },
      { key: "Security", href: "/security" },
    ]},
    { titleKey: "footer.legal", links: [
      { key: "footer.privacy", href: "/privacy" },
      { key: "footer.terms", href: "/terms" },
      { key: "Cookies", href: "/cookies" },
      { key: "Data Deletion", href: "/data-deletion" },
    ]},
  ]
  return (
    <footer id="footer" className="relative border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <img src="/basma-logo.png" alt="BASMA" className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>
          {cols.map((col) => (
            <div key={col.titleKey}>
              <h4 className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-3 sm:mb-4">{t(col.titleKey)}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <Link href={link.href} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">{t(link.key)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">&copy; 2026 BASMA AI Inc. {t("footer.rights")}</p>
            <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
              <a href="mailto:support@basmaweb.com" className="hover:text-foreground transition-colors">support@basmaweb.com</a>
              <span>•</span>
              <a href="mailto:legal@basmaweb.com" className="hover:text-foreground transition-colors">legal@basmaweb.com</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
              <span className="sr-only">Twitter</span>
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
              <span className="sr-only">GitHub</span>
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.047-8.829 0-9.744h3.554v1.379c-.009.015-.021.029-.03.042h.03v-.042c.43-.664 1.199-1.608 2.920-1.608 2.135 0 3.731 1.395 3.731 4.397v5.576zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.954.768-1.71 1.959-1.71 1.188 0 1.913.759 1.932 1.71 0 .951-.744 1.71-1.932 1.71zm1.581 11.597H3.771V9.504h3.147v10.948zM22.224 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.224 0z"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
