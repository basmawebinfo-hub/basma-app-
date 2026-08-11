"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight, Clock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { LevelContent } from "@/components/academy/level-content"
import { VimeoPlayer } from "@/components/academy/vimeo-player"
import { CompleteToggle } from "@/components/academy/progress-parts"
import { WhatsAppCta } from "@/components/services/whatsapp-cta"
import type { Course, Level, LevelSummary } from "@/types/content"
import { useI18n } from "@/lib/i18n"

export function LevelView({
  course,
  level,
  prev,
  next,
}: {
  course: Course
  level: Level
  prev: LevelSummary | null
  next: LevelSummary | null
}) {
  const { t } = useI18n()
  const published = level.status === "published"

  return (
    <main id="main" className="relative z-0 min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      <article className="section-shell pt-32 sm:pt-40">
        <div className="container-site max-w-3xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <Link href="/academy" className="hover:text-foreground transition-colors">
              {t("academyPage.title")}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href={`/academy/${course.slug}`} className="hover:text-foreground transition-colors">
              {course.titleAr}
            </Link>
          </nav>

          <header className="mt-4 mb-8">
            <p className="text-sm font-mono text-primary mb-2">
              {t("academy.levelN").replace("{n}", String(level.order).padStart(2, "0"))}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-display mb-3">{level.titleAr}</h1>
            {level.subtitle && (
              <p className="text-lg text-muted-foreground leading-relaxed">{level.subtitle}</p>
            )}
            {level.duration && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" aria-hidden="true" />
                {level.duration}
              </p>
            )}
          </header>

          {/* Coming-soon levels show their topic list but no player and no
              completion toggle — there is nothing to watch or complete yet. */}
          {published ? (
            <VimeoPlayer
              src={level.vimeo}
              title={level.titleAr}
              emptyMessage={t("academy.videoSoon")}
              errorMessage={t("academy.videoError")}
            />
          ) : (
            <div className="border border-dashed border-border bg-card/40 p-6 text-center">
              <p className="text-sm text-muted-foreground">{t("academy.levelSoon")}</p>
            </div>
          )}

          <div className="mt-10">
            <LevelContent body={level.body} />
          </div>

          {published && (
            <div className="mt-12 flex justify-center">
              <CompleteToggle course={course.slug} level={level.slug} />
            </div>
          )}

          {!published && (
            <div className="mt-12 border border-border bg-elevated p-6 text-center">
              <p className="text-muted-foreground mb-5">{t("academy.notifyBody")}</p>
              <WhatsAppCta messageKey="wa.msg.academy" labelKey="academy.cta" />
            </div>
          )}

          {/* Prev / next. `start`/`end` rather than left/right so the arrows
              point the correct way in both directions. */}
          <nav className="mt-14 pt-8 border-t border-border grid sm:grid-cols-2 gap-4" aria-label={t("academy.levelNav")}>
            {prev ? (
              <Link
                href={`/academy/${course.slug}/${prev.slug}`}
                className="group border border-border bg-card p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100" aria-hidden="true" />
                  {t("academy.prev")}
                </span>
                <span className="block text-sm font-medium text-foreground">{prev.titleAr}</span>
              </Link>
            ) : (
              <span />
            )}

            {next && (
              <Link
                href={`/academy/${course.slug}/${next.slug}`}
                className="group border border-border bg-card p-4 text-end transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:col-start-2"
              >
                <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground mb-1">
                  {t("academy.next")}
                  <ArrowLeft className="w-3.5 h-3.5 rtl:-scale-x-100" aria-hidden="true" />
                </span>
                <span className="block text-sm font-medium text-foreground">{next.titleAr}</span>
              </Link>
            )}
          </nav>
        </div>
      </article>

      <Footer />
    </main>
  )
}
