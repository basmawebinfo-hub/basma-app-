"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { WhatsAppCta } from "@/components/services/whatsapp-cta"
import { useI18n } from "@/lib/i18n"

export function FinalCTA() {
  const { t } = useI18n()

  return (
    <section className="section-shell px-4 sm:px-6 lg:px-8">
      <div
        className="relative max-w-5xl mx-auto bg-background overflow-hidden py-16 lg:py-24 px-6 sm:px-12 border border-dashed border-primary/40"
      >
        <div className="relative max-w-3xl mx-auto text-center">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-display mb-6 text-foreground">
              {t("cta.title1")}
              <br />
              {t("cta.title2")}
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <WhatsAppCta messageKey="wa.msg.footer" labelKey="cta.join" size="xl" className="min-w-50" />
              <Button variant="outline" size="xl" className="gap-2 min-w-50 bg-transparent" asChild>
                <Link href="/services">{t("cta.services")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
