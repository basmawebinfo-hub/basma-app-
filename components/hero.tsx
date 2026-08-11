"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
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

  return (
    <section className="relative min-h-svh grid grid-rows-[1fr_auto] overflow-hidden">
      {/* Row 1: content. Row 2: the skills strip, in flow — no absolute
          positioning, no compensating padding, so the two can never collide. */}
      <div className="flex items-center justify-center pt-28 lg:pt-32">
        {/* Inline-start at lg and up (right edge in Arabic, left in English);
            centered below lg. */}
        <div className="relative z-10 container-site max-w-4xl lg:max-w-none text-center lg:text-start">
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
              className="inline-block whitespace-nowrap block-lime px-3 py-1 mt-2 text-[clamp(1.125rem,0.8rem+1.8vw,2.75rem)] leading-[1.3]"
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
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
          >
            {/* Services is the live product; the academy is قريبًا. The primary
                CTA goes to the thing a visitor can actually buy today. */}
            <Button size="xl" className="gap-2 w-full sm:w-auto" asChild>
              <Link href="/services">
                {t("hero.ctaServices")}
                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
             
              className="gap-2 bg-transparent w-full sm:w-auto"
              asChild
            >
              <Link href="/#academy">
                {t("hero.ctaAcademy")}
                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.div
        id="skills-strip"
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={enter(0.24)}
        className="py-6 sm:py-8 border-t border-border bg-background"
      >
        <div className="container-site max-w-5xl">
          <p className="meta-ar mb-4 sm:mb-5 text-center">{t("hero.skills")}</p>
          {/* A numbered strip, straight from the reference's footer grid. The
              indices are mono and LTR because they're numerals, and they give
              the row the structural rhythm that carries brutalism in Arabic. */}
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-s border-border">
            {SKILLS.map((skill, i) => (
              <li
                key={skill}
                className="flex items-baseline gap-2 border-b border-e border-border px-3 py-3"
              >
                <span dir="ltr" className="font-mono text-[11px] text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span dir="ltr" className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  {skill}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  )
}
