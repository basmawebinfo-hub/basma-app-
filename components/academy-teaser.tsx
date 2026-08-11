"use client"

import { Check, Lock } from "lucide-react"
import { WhatsAppCta } from "@/components/services/whatsapp-cta"
import { useI18n } from "@/lib/i18n"

/**
 * The roadmap, on the home page.
 *
 * Only the four levels that are actually written are named. The remaining ten
 * are counted, not invented — naming levels that don't exist would be the same
 * failure as the WhatsApp copy this page replaced.
 *
 * The CTA is WhatsApp, not a link to /academy: those pages are built in Phase C
 * and linking to them now would be a 404. Swap it when they exist.
 */
const WRITTEN_LEVELS = [
  { n: 1, key: "academy.l1" },
  { n: 2, key: "academy.l2" },
  { n: 3, key: "academy.l3" },
  { n: 4, key: "academy.l4" },
]

const TOTAL_LEVELS = 14

export function AcademyTeaser() {
  const { t } = useI18n()
  const remaining = TOTAL_LEVELS - WRITTEN_LEVELS.length

  return (
    <section id="academy" className="section-shell">
      <div className="container-site max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-display mb-4">
            {t("academy.title1")} <span className="text-primary">{t("academy.title2")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("academy.subtitle")}
          </p>
        </div>

        <ol className="space-y-3">
          {WRITTEN_LEVELS.map((lvl) => (
            <li
              key={lvl.n}
              className="flex items-center gap-4 border border-border bg-card p-4"
            >
              <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
                {String(lvl.n).padStart(2, "0")}
              </span>
              <span className="flex-1 text-sm sm:text-base text-foreground">{t(lvl.key)}</span>
              <Check className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            </li>
          ))}

          {/* The unwritten levels are counted, never named. */}
          <li className="flex items-center gap-4 border border-dashed border-border bg-card/40 p-4">
            <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 bg-elevated border border-border text-muted-foreground">
              <Lock className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="flex-1 text-sm sm:text-base text-muted-foreground">
              {t("academy.remaining").replace("{n}", String(remaining))}
            </span>
          </li>
        </ol>

        {/* The academy is built (26 pages, real content) but held back until its
            own visual design is decided — see KIMI_TASKS/phases/PHASE-G.md.
            The routes still exist and still work; nothing links to them, and
            they carry noindex. This is a visibility decision, not a teardown. */}
        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground mb-5">{t("academy.ctaNote")}</p>
          <WhatsAppCta messageKey="wa.msg.academy" labelKey="academy.cta" />
        </div>
      </div>
    </section>
  )
}
