"use client"

import { TOTAL_LEVELS, WRITTEN_COUNT } from "@/config/roadmap"
import { useI18n } from "@/lib/i18n"

/**
 * Why a visitor should believe any of this, before being asked to message.
 *
 * ⚠️ HARD RULE — every line maps to something that exists. No student counts,
 * no testimonials, no ratings, no partner or tool logos, no percentages, no
 * "trusted by". This rule already cost the site its stats section in Phase E
 * and it is not relaxed for a proof band. The mapping:
 *
 *   1 → config/roadmap.ts + D:\Basma agancy\BasmaProgram — the written levels
 *       and their structure (شرح / مثال عملي / مصادر / أسئلة تقييم), counted
 *       from the config rather than typed as a literal
 *   2 → app/services/ai-subscriptions/ + config/services.ts — the service page
 *       exists and AI_SUBSCRIPTION_TERMS.fee is published, not "ask us"
 *   3 → config/contact.ts — a real WhatsApp number, no form and no ticketing
 *       system anywhere in this repo
 *   4 → the site's own behaviour: academy.levelSoon renders for unwritten
 *       levels, and AI_SUBSCRIPTION_TERMS.turnaround is null and renders an
 *       honest fallback instead of an invented figure
 *
 * ⚠️ GAP, deliberately left open: there is no founder line here. The owner has
 * not supplied a bio, and writing one for him would be exactly the kind of
 * invented credibility the rest of this file exists to prevent. When he
 * supplies one, it belongs in this band.
 */
const PROOF = ["proof.i1", "proof.i2", "proof.i3", "proof.i4"]

export function Proof() {
  const { t } = useI18n()

  const body = (key: string) =>
    t(`${key}.body`)
      .replace("{done}", String(WRITTEN_COUNT))
      .replace("{total}", String(TOTAL_LEVELS))

  return (
    <section id="proof" className="section-strip">
      <div className="container-site max-w-6xl">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-display mb-8">
          {t("proof.title1")} <span className="text-primary">{t("proof.title2")}</span>
        </h2>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 border-s border-t border-border">
          {PROOF.map((key) => (
            <li key={key} className="border-e border-b border-border p-5 sm:p-6">
              <h3 className="text-base font-semibold text-foreground mb-2">{t(`${key}.title`)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body(key)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
