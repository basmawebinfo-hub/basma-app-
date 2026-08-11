import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCourse, getCourses } from "@/lib/content"
import { CourseView } from "./course-view"

export async function generateStaticParams() {
  return (await getCourses()).map((c) => ({ course: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string }>
}): Promise<Metadata> {
  const { course: slug } = await params
  const course = await getCourse(slug)
  if (!course) return {}

  const url = `https://www.basmaweb.com/academy/${slug}`
  return {
    title: course.titleAr,
    description: course.description.slice(0, 160),
    robots: { index: false, follow: false }, // held back — see PHASE-G
    alternates: { canonical: url },
    openGraph: { title: course.titleAr, description: course.subtitle, url },
  }
}

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params
  const course = await getCourse(slug)
  if (!course) notFound()

  /* `Course` JSON-LD. `hasCourseInstance` is omitted deliberately: it implies a
     scheduled offering with dates and delivery mode, and none of that is true
     yet. Only the published level count is asserted. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.titleAr,
    description: course.description,
    inLanguage: "ar",
    url: `https://www.basmaweb.com/academy/${slug}`,
    provider: {
      "@type": "EducationalOrganization",
      name: "BASMA بصمة",
      url: "https://www.basmaweb.com",
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CourseView course={course} />
    </>
  )
}
