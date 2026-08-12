"use client"

import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SERVICES } from "@/config/services"
import { useI18n } from "@/lib/i18n"

/**
 * Home-page entry point into /services. One card per real service — there is
 * exactly one today, and no filler is added to balance the grid.
 */
export function ServicesTeaser() {
  const { t } = useI18n()

  return (
    <section id="services" className="section-shell">
      <div className="container-site max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-display mb-4">
            {t("home.svc.title1")} <span className="text-primary">{t("home.svc.title2")}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("home.svc.subtitle")}</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {SERVICES.map((svc) => (
            <Link
              key={svc.slug}
              href={`/services/${svc.slug}`}
              className="group block border border-border bg-card p-6 sm:p-8 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t(svc.titleKey)}</h3>
              <p className="text-muted-foreground mb-5">{t(svc.taglineKey)}</p>
              <span className="inline-flex items-center gap-1.5 text-sm text-primary">
                {t("services.viewOne")}
                <ArrowLeft className="w-4 h-4 rtl:-scale-x-100 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          {/* min-h-11: the default size is h-9, which measured 36px at 375px —
              under the 44px floor Phase B set for touch targets. */}
          <Button asChild variant="outline" className="min-h-11">
            <Link href="/services">{t("home.svc.cta")}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
