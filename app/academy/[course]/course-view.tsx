"use client"

import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CourseProgress, LevelTick } from "@/components/academy/progress-parts"
import type { Course } from "@/types/content"
import { useI18n } from "@/lib/i18n"

export function CourseView({ course }: { course: Course }) {
  const { t } = useI18n()
  const publishedLevels = course.levels.filter((l) => l.status === "published")

  return (
    <main id="main" className="relative z-0 min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      <section className="section-shell pt-32 sm:pt-40">
        <div className="container-site max-w-3xl">
          <Link
            href="/academy"
            className="inline-flex items-center gap-1.5 min-h-11 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" />
            {t("academyPage.title")}
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-display mt-4 mb-3">{course.titleAr}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">{course.subtitle}</p>
          <p className="text-muted-foreground leading-loose mb-8">{course.description}</p>

          {/* Progress only counts levels a student can actually read. Measuring
              against 14 when 10 are unwritten would cap everyone at 29%. */}
          <CourseProgress course={course.slug} total={publishedLevels.length} />

          <ol className="mt-10 space-y-3">
            {course.levels.map((level) => {
              const locked = level.status !== "published"
              const num = String(level.order).padStart(2, "0")

              const inner = (
                <>
                  <span
                    className={`shrink-0 inline-flex items-center justify-center w-10 h-10 text-sm font-bold ${
                      locked
                        ? "bg-elevated border border-border text-muted-foreground"
                        : "bg-primary/10 border border-primary/20 text-primary"
                    }`}
                  >
                    {locked ? <Lock className="w-4 h-4" aria-hidden="true" /> : num}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm sm:text-base font-medium text-foreground">
                      {level.titleAr}
                    </span>
                    {level.subtitle && (
                      <span className="block text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {level.subtitle}
                      </span>
                    )}
                  </span>
                  {locked ? (
                    <span className="shrink-0 text-xs text-muted-foreground">{t("academy.soon")}</span>
                  ) : (
                    <LevelTick course={course.slug} level={level.slug} />
                  )}
                </>
              )

              // Coming-soon levels are still readable — they list what the level
              // will cover — so they link rather than sit dead.
              return (
                <li key={level.slug}>
                  <Link
                    href={`/academy/${course.slug}/${level.slug}`}
                    className={`flex items-center gap-4 border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                      locked
                        ? "border-dashed border-border bg-card/40 hover:border-border/80"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    {inner}
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <Footer />
    </main>
  )
}
