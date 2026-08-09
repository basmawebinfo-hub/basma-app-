"use client"

import { QrCode, Webhook, Zap } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export function HowItWorks() {
  const { t } = useI18n()

  const steps = [
    { icon: QrCode, titleKey: "how.s1.title", descKey: "how.s1.desc" },
    { icon: Webhook, titleKey: "how.s2.title", descKey: "how.s2.desc" },
    { icon: Zap, titleKey: "how.s3.title", descKey: "how.s3.desc" },
  ]

  return (
    <section id="how-it-works" className="section-shell">
      <div className="container-site max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-display mb-4">
            {t("how.title1")} <span className="text-primary">{t("how.title2")}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("how.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <div
              key={step.titleKey}
              className="relative text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-2 -start-2 w-7 h-7 rounded-full bg-primary text-background flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t(step.titleKey)}</h3>
              <p className="text-sm text-muted-foreground">{t(step.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
