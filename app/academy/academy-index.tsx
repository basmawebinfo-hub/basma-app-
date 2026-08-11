"use client"

import Link from "next/link"
import { ArrowLeft, GraduationCap } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { CourseSummary } from "@/types/content"
import { useI18n } from "@/lib/i18n"

export function AcademyIndex({ courses }: { courses: CourseSummary[] }) {
  const { t } = useI18n()

  return (
    <main id="main" className="relative z-0 min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      <section className="section-shell pt-32 sm:pt-40">
        <div className="container-site max-w-4xl">
          <div className="text-center mb-14">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-display mb-4">
              {t("academyPage.title")}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("academyPage.subtitle")}
            </p>
          </div>

          {courses.length === 0 ? (
            <p className="text-center text-muted-foreground">{t("academyPage.empty")}</p>
          ) : (
            <div className={courses.length === 1 ? "max-w-2xl mx-auto" : "grid sm:grid-cols-2 gap-6"}>
              {courses.map((course) => (
                <Link
                  key={course.slug}
                  href={`/academy/${course.slug}`}
                  className="group block border border-border bg-card p-6 sm:p-8 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <div className="inline-flex items-center justify-center w-11 h-11 bg-primary/10 border border-primary/20 mb-4">
                    <GraduationCap className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">{course.titleAr}</h2>
                  <p className="text-muted-foreground mb-4">{course.subtitle}</p>

                  {/* The honest count, straight from the content. */}
                  <p className="text-sm text-muted-foreground/80 mb-5">
                    {t("academyPage.count")
                      .replace("{published}", String(course.publishedCount))
                      .replace("{total}", String(course.plannedLevels))}
                  </p>

                  <span className="inline-flex items-center gap-1.5 text-sm text-primary">
                    {t("academyPage.open")}
                    <ArrowLeft className="w-4 h-4 rtl:-scale-x-100 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
