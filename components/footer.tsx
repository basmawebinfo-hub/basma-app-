"use client"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export function Footer() {
  const { t } = useI18n()
  const cols = [
    { titleKey: "footer.product", links: [
      { key: "footer.features", href: "#how-it-works" },
      { key: "footer.pricing", href: "#pricing" },
    ]},
    { titleKey: "footer.company", links: [
      { key: "footer.about", href: "#" },
      { key: "footer.faq", href: "#faq" },
      { key: "footer.contact", href: "#footer" },
    ]},
    { titleKey: "footer.legal", links: [
      { key: "footer.privacy", href: "/privacy" },
      { key: "footer.terms", href: "/terms" },
      { key: "footer.docs", href: "/docs" },
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
        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground">&copy; 2026 BASMA. {t("footer.rights")}</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
