"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useI18n } from "@/lib/i18n"

export function FAQ() {
  const { t } = useI18n()

  const faqs = [
    { q: "faq.q1", a: "faq.a1" },
    { q: "faq.q2", a: "faq.a2" },
    { q: "faq.q3", a: "faq.a3" },
    { q: "faq.q4", a: "faq.a4" },
    { q: "faq.q5", a: "faq.a5" },
  ]

  return (
    <section id="faq" className="section-shell">
      <div className="container-site max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-display mb-4">
            {t("faq.title1")} <span className="text-primary">{t("faq.title2")}</span>
          </h2>
          <p className="text-muted-foreground">{t("faq.subtitle")}</p>
        </div>

        <div>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-xl px-6 bg-card/30">
                <AccordionTrigger className="text-start text-foreground hover:text-primary hover:no-underline py-5">
                  {t(faq.q)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">{t(faq.a)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
