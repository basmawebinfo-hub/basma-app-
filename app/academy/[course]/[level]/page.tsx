import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllLevelPaths, getCourse, getLevel } from "@/lib/content"
import { LevelView } from "./level-view"

export async function generateStaticParams() {
  return getAllLevelPaths()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string; level: string }>
}): Promise<Metadata> {
  const { course, level: levelSlug } = await params
  const level = await getLevel(course, levelSlug)
  if (!level) return {}

  const url = `https://www.basmaweb.com/academy/${course}/${levelSlug}`
  const unpublished = level.status !== "published"

  return {
    title: level.titleAr,
    description: level.subtitle || level.titleAr,
    alternates: { canonical: url },
    // The whole academy is held back until PHASE-G, so every level is noindex
    // regardless of status. When it launches, restore the published/unpublished
    // distinction: unwritten levels should stay out of search either way.
    robots: { index: false, follow: false },
    openGraph: { title: level.titleAr, description: level.subtitle, url },
  }
}

export default async function LevelPage({
  params,
}: {
  params: Promise<{ course: string; level: string }>
}) {
  const { course: courseSlug, level: levelSlug } = await params
  const [course, level] = await Promise.all([getCourse(courseSlug), getLevel(courseSlug, levelSlug)])
  if (!course || !level) notFound()

  const index = course.levels.findIndex((l) => l.slug === level.slug)
  const prev = index > 0 ? course.levels[index - 1] : null
  const next = index < course.levels.length - 1 ? course.levels[index + 1] : null

  // VideoObject only when a video exists. Emitting it with no contentUrl for a
  // level that has no video would be structured data describing nothing.
  const jsonLd = level.vimeo
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: level.titleAr,
        description: level.subtitle || level.titleAr,
        embedUrl: level.vimeo,
        inLanguage: "ar",
      }
    : null

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <LevelView course={course} level={level} prev={prev} next={next} />
    </>
  )
}
