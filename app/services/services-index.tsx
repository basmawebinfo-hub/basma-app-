"use client"

import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppCta } from "@/components/services/whatsapp-cta"
import { SERVICES } from "@/config/services"
import { useI18n } from "@/lib/i18n"

export function ServicesIndex() {
  const { t } = useI18n()

  return (
    <main id="main" className="relative z-0 min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      <section className="section-shell pt-32 sm:pt-40">
        <div className="container-site max-w-5xl">
          <div className="text-center mb-14">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-display mb-4">
              {t("services.title")}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("services.subtitle")}</p>
          </div>

          {/* One real service today. No placeholder cards to pad the grid — an
              honest single card beats a wall of "coming soon" for things that
              don't exist. The layout adapts to the count so a lone card centres
              instead of hanging off one side of a two-column grid, and becomes a
              real grid on its own the moment a second service is added. */}
          <div
            className={
              SERVICES.length === 1
                ? "max-w-md mx-auto"
                : "grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto"
            }
          >
            {SERVICES.map((svc) => (
              <Link
                key={svc.slug}
                href={`/services/${svc.slug}`}
                className="group border border-border bg-card p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 bg-primary/10 border border-primary/20 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">{t(svc.titleKey)}</h2>
                <p className="text-sm text-muted-foreground mb-4">{t(svc.taglineKey)}</p>
                <span className="inline-flex items-center gap-1.5 text-sm text-primary">
                  {t("services.viewOne")}
                  <ArrowLeft className="w-4 h-4 rtl:-scale-x-100 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10">{t("services.more")}</p>

          <div className="flex justify-center mt-8">
            <WhatsAppCta messageKey="wa.msg.services" labelKey="svc.ai.cta" variant="secondary" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
