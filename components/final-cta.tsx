"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export function FinalCTA() {
  const { t } = useI18n()

  return (
    <section className="section-shell px-4 sm:px-6 lg:px-8">
      <div
        className="relative max-w-5xl mx-auto bg-background rounded-3xl overflow-hidden py-16 lg:py-24 px-6 sm:px-12 border border-dashed border-primary/40"
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
              <Button size="xl" rounded="full" className="gap-2 min-w-50" asChild>
                <Link href="#pricing">
                  {t("cta.join")}
                  <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" rounded="full" className="gap-2 min-w-50 bg-transparent" asChild>
                <Link href="#footer">{t("cta.dashboard")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
