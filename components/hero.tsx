"use client"

import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { whatsappLink } from "@/config/contact"
import { TOTAL_LEVELS, WRITTEN_COUNT } from "@/config/roadmap"
import { useI18n } from "@/lib/i18n"
import { EASE_OUT, DURATION } from "@/lib/motion"

/**
 * Skills actually covered by the roadmap — taken from the level content in
 * BasmaProgram, not aspirational. If a topic isn't taught, it doesn't belong here.
 */
const SKILLS = ["Python", "APIs & Webhooks", "n8n", "AI Agents", "RAG", "Prompt Engineering"]

export function Hero() {
  const { t } = useI18n()
  const shouldReduceMotion = useReducedMotion()

  // One authored focal entrance — fast, subtle, shared tokens.
  const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
  const enter = (delay: number) => ({ duration: DURATION.focal, delay, ease: EASE_OUT })

  // The roadmap's real state. The counts come from config/roadmap.ts — writing
  // "4 من 14" as a literal is how a site ends up claiming something that
  // stopped being true three levels ago.
  const state = t("hero.state")
    .replace("{done}", String(WRITTEN_COUNT))
    .replace("{total}", String(TOTAL_LEVELS))

  return (
    <section className="relative min-h-svh grid grid-rows-[1fr_auto] overflow-hidden">
      {/* Row 1: content. Row 2: the skills strip, in flow — no absolute
          positioning, no compensating padding, so the two can never collide. */}
      <div className="flex items-center justify-center pt-28 lg:pt-32">
        {/* Inline-start at lg and up (right edge in Arabic, left in English);
            centered below lg. */}
        {/* max-w-6xl matches the navbar's container, so the headline's
            inline-start edge lands on the same rail as the logo instead of
            floating at an unrelated measure. */}
        <div className="relative z-10 container-site max-w-6xl text-center lg:text-start">
          <motion.div
            initial={shouldReduceMotion ? {} : fadeUp.initial}
            animate={fadeUp.animate}
            transition={enter(0)}
            /* Solid background, not a tint: the badge sits over the halftone
               corner field, and a 10%-alpha fill left lime text on a lime
               texture — unreadable at exactly the spot that introduces the
               brand. Opaque black + a full-strength lime border reads over
               anything behind it. */
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 border border-primary bg-background text-primary text-xs font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {t("hero.badge")}
          </motion.div>

          {/* Brutalist scale contrast: the Arabic line carries the display
              token and stays the largest type on the page; the Latin job title
              is the subject, set smaller on one line inside the lime block.
              Display-token line-height (1.25) keeps Arabic ink inside the line
              box — `leading-[1.05]` clipped ascenders (122px ink in a 100.8px
              box, measured in Phase G review). */}
          <motion.h1
            initial={shouldReduceMotion ? {} : fadeUp.initial}
            animate={fadeUp.animate}
            transition={enter(0.06)}
            className="text-display font-bold tracking-display text-balance mb-8 leading-[1.3]"
          >
            <span className="text-foreground">{t("hero.title1")}</span>
            <br />
            {/* The one solid lime field on the page. Black on lime, never lime
                on black as text — it fails contrast as type and works as a
                block. dir/lang are explicit: a Latin phrase inside an RTL
                heading must not be left to the bidi algorithm to guess. */}
            <span
              dir="ltr"
              lang="en"
              /* Sized as a fixed 0.62× of the Arabic display token so the
                 relationship holds at every width, rather than being two
                 independent clamps that drift apart mid-range. The first pass
                 at this overcorrected — it put the job title at ~19px on
                 mobile, which took the lime block from 17.9% of the viewport
                 to 2.7% but turned the headline's subject into a caption.
                 0.62× lands the block at 3–4%: inside the ≤8% budget, still
                 reading as part of the headline. */
              className="inline-block whitespace-nowrap block-lime px-3 py-1 mt-2 text-[clamp(1.6875rem,1.18rem+2.23vw,2.8125rem)] leading-[1.3]"
            >
              {t("hero.title2")}
            </span>
          </motion.h1>

          <motion.p
            initial={shouldReduceMotion ? {} : fadeUp.initial}
            animate={fadeUp.animate}
            transition={enter(0.12)}
            className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-10 text-pretty leading-relaxed px-2 lg:px-0"
          >
            {t("hero.desc")}
          </motion.p>

          <motion.div
            initial={shouldReduceMotion ? {} : fadeUp.initial}
            animate={fadeUp.animate}
            transition={enter(0.18)}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-x-8 gap-y-4"
          >
            {/* One primary action. The page used to offer two buttons of
                near-equal weight plus a higher-contrast navbar button, and the
                two loudest of the three pointed at the قريبًا roadmap section —
                three competing next actions, the loudest going nowhere. The
                filled button now goes to the one thing that works today: a
                real conversation with a person. */}
            <Button size="xl" className="w-full sm:w-auto" asChild>
              <a
                href={whatsappLink(t("wa.msg.hero"))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                {t("hero.ctaTalk")}
              </a>
            </Button>
            {/* Demoted to a text link, not a second button. Services are real
                and worth reaching — they are not a rival to the primary ask. */}
            <Link
              href="/services"
              className="group inline-flex items-center justify-center gap-1.5 min-h-11 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {t("hero.ctaServices")}
              {/* ArrowRight, not ArrowLeft. "Forward" points right in LTR and
                  left in RTL, so the base icon must point right and
                  `rtl:-scale-x-100` flips it. Built with ArrowLeft first and
                  it rendered backwards in BOTH locales. */}
              <ArrowRight
                className="w-4 h-4 rtl:-scale-x-100 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </motion.div>

          {/* The roadmap's real state, sitting with the ask rather than buried
              four sections down. A visitor who is going to be disappointed by
              "4 of 14" should find that out before they message, not after. */}
          <motion.p
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={enter(0.24)}
            className="mt-6 text-sm text-muted-foreground/70"
          >
            {state}
          </motion.p>
        </div>
      </div>

      <motion.div
        id="skills-strip"
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={enter(0.3)}
        /* The band the hero stands on — a floor, not a caption. Full-bleed
           rather than boxed inside max-w-5xl: the cells now run to both edges,
           which is what makes it read as structure instead of as a widget
           parked at the bottom of the section. */
        className="relative z-10 border-t border-border bg-background"
      >
        <div className="container-site max-w-6xl py-4">
          <p className="meta-ar text-center lg:text-start">{t("hero.skills")}</p>
        </div>
        {/* A numbered strip, straight from the reference's footer grid. The
            indices are mono and LTR because they're numerals, and they give
            the row the structural rhythm that carries brutalism in Arabic.
            `-me-px` pushes the trailing cell's border past the viewport edge
            so the row bleeds off instead of closing like a table; the
            section's `overflow-hidden` keeps that from creating a scrollbar. */}
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-border -me-px">
          {SKILLS.map((skill, i) => (
            <li
              key={skill}
              /* min-w-0 on the grid item and the flex child both: `min-width:
                 auto` is the default on each, so neither can shrink below its
                 content and a longer skill name would push out of the cell.
                 Defensive — nothing overflows at the current six names. */
              className="flex min-w-0 items-baseline gap-2 border-b border-e border-border px-4 py-4"
            >
              <span dir="ltr" className="shrink-0 font-mono text-[11px] text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span dir="ltr" className="min-w-0 text-xs sm:text-sm font-semibold text-muted-foreground">
                {skill}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
