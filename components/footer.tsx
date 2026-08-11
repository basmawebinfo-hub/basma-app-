"use client"
import Link from "next/link"
import Image from "next/image"
import { MessageCircle } from "lucide-react"
import { CONTACT, whatsappLink } from "@/config/contact"
import { useI18n } from "@/lib/i18n"

export function Footer() {
  const { t } = useI18n()
  // Anchors are absolute (`/#…`) because the footer renders on /services too,
  // where a bare `#pricing` would not resolve.
  const cols = [
    { titleKey: "footer.product", links: [
      { key: "nav.services", href: "/services" },
    ]},
    { titleKey: "footer.company", links: [
      { key: "footer.about", href: "/#footer" },
      { key: "footer.faq", href: "/#faq" },
      { key: "footer.contact", href: "/#footer" },
    ]},
    { titleKey: "footer.legal", links: [
      { key: "footer.privacy", href: "/privacy" },
      { key: "footer.terms", href: "/terms" },
    ]},
  ]
  return (
    <footer id="footer" className="relative border-t border-border">
      <div className="container-site max-w-6xl py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center min-h-11 mb-4">
              <Image src="/basma-logo.png" alt="BASMA" width={1005} height={280} className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>
          {cols.map((col) => (
            <div key={col.titleKey}>
              <h4 className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-3 sm:mb-4">{t(col.titleKey)}</h4>
              <ul className="space-y-0 sm:space-y-2">
                {col.links.map((link) => (
                  <li key={link.key}>
                    {/* min-h-11 on touch widths / min-h-6 above keeps every link
                        at or above the WCAG 2.5.8 target size without inflating
                        desktop footer density. */}
                    <Link href={link.href} className="inline-flex items-center w-full sm:w-auto min-h-11 sm:min-h-6 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">{t(link.key)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground">&copy; 2026 BASMA. {t("footer.rights")}</p>
          <div className="flex items-center gap-4">
            {/* BASMA has no social accounts yet — `basmaweb.ai` is the WhatsApp
                identity, not a separate handle. A dead social icon on a site
                that asks people to send money costs trust for nothing, so this
                links to the one channel that actually works. Add real social
                icons only when real accounts exist. */}
            <a
              href={whatsappLink(t("wa.msg.footer"))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-11 px-3 text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5" aria-hidden="true" />
              <span className="text-xs sm:text-sm">{CONTACT.whatsappDisplay}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
