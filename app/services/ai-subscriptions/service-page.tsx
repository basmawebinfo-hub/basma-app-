"use client"

import Link from "next/link"
import { ArrowLeft, Banknote, Check, ShieldCheck, Wallet } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppCta } from "@/components/services/whatsapp-cta"
import { PriceCard } from "@/components/services/price-card"
import { AI_SUBSCRIPTION_TERMS } from "@/config/services"
import { getCatalog } from "@/lib/catalog"
import { useI18n } from "@/lib/i18n"

const STEPS = [
  { t: "svc.ai.step1.t", d: "svc.ai.step1.d" },
  { t: "svc.ai.step2.t", d: "svc.ai.step2.d" },
  { t: "svc.ai.step3.t", d: "svc.ai.step3.d" },
  { t: "svc.ai.step4.t", d: "svc.ai.step4.d" },
  { t: "svc.ai.step5.t", d: "svc.ai.step5.d" },
]

const FAQS = [
  { q: "svc.ai.faq1.q", a: "svc.ai.faq1.a" },
  { q: "svc.ai.faq2.q", a: "svc.ai.faq2.a" },
  { q: "svc.ai.faq3.q", a: "svc.ai.faq3.a" },
  { q: "svc.ai.faq4.q", a: "svc.ai.faq4.a" },
]

export function AiSubscriptionsPage() {
  const { t } = useI18n()

  return (
    <main id="main" className="relative z-0 min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      <section className="section-shell pt-32 sm:pt-40">
        <div className="container-site max-w-3xl">
          {/* Breadcrumb */}
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 min-h-11 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
            {t("services.title")}
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-display mt-4 mb-4">
            {t("svc.ai.title")}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{t("svc.ai.tagline")}</p>

          <div className="mt-8">
            <WhatsAppCta messageKey="wa.msg.aiService" />
          </div>

          {/* Problem */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold mb-3">{t("svc.ai.problemTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("svc.ai.problemBody")}</p>
          </div>

          {/* Solution — the account-ownership framing lives here and must stay */}
          <div className="mt-10 border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-semibold mb-3">{t("svc.ai.solutionTitle")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("svc.ai.solutionBody")}</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold mb-6">{t("svc.ai.stepsTitle")}</h2>
            <ol className="space-y-5">
              {STEPS.map((step, i) => (
                <li key={step.t} className="flex items-start gap-4">
                  <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{t(step.t)}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(step.d)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Payment methods — no account numbers on the page by design; they
              change, and they belong in the conversation. */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold mb-6">{t("svc.ai.payTitle")}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 border border-border bg-card p-4">
                <Wallet className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm">{t("svc.ai.payWallet")}</span>
              </div>
              <div className="flex items-center gap-3 border border-border bg-card p-4">
                <Banknote className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm">{t("svc.ai.payBank")}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">{t("svc.ai.payNote")}</p>
          </div>

          {/* The catalogue. Only items backed by a real purchase appear here;
              everything else is covered by the catch-all note underneath. */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold mb-2">{t("price.title")}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t("price.subtitle")}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {getCatalog().map((item) => (
                <PriceCard key={item.slug} item={item} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-5">{t("price.more")}</p>
          </div>

          {/* Coverage */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold mb-3">{t("svc.ai.coversTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("svc.ai.coversBody")}</p>
          </div>

          {/* Cost & timing.
              AI_SUBSCRIPTION_TERMS values are null until the owner supplies real
              numbers. The fallback says "agreed in the conversation" — it never
              invents a figure, because publishing a price or a turnaround the
              business hasn't committed to is a promise it didn't make. */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold mb-6">{t("svc.ai.termsTitle")}</h2>
            <dl className="grid sm:grid-cols-2 gap-4">
              <div className="border border-border bg-card p-4">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  {t("svc.ai.feeLabel")}
                </dt>
                <dd className="text-sm">{AI_SUBSCRIPTION_TERMS.fee ?? t("svc.ai.termsAsk")}</dd>
              </div>
              <div className="border border-border bg-card p-4">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  {t("svc.ai.timeLabel")}
                </dt>
                <dd className="text-sm">{AI_SUBSCRIPTION_TERMS.turnaround ?? t("svc.ai.termsAsk")}</dd>
              </div>
            </dl>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold mb-6">{t("svc.ai.faqTitle")}</h2>
            <div className="space-y-5">
              {FAQS.map((f) => (
                <div key={f.q} className="border border-border bg-card p-5">
                  <h3 className="font-medium text-foreground mb-2 flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-1" />
                    {t(f.q)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed ps-6">{t(f.a)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 border border-border bg-elevated p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">{t("svc.ai.ctaTitle")}</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t("svc.ai.ctaBody")}</p>
            <WhatsAppCta messageKey="wa.msg.aiService" size="xl" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
