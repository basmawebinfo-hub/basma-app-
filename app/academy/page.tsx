import type { Metadata } from "next"
import { getCourses } from "@/lib/content"
import { AcademyIndex } from "./academy-index"

const URL = "https://www.basmaweb.com/academy"

export const metadata: Metadata = {
  title: "الأكاديمية",
  description:
    "أكاديمية بصمة — مسار AI Automation Engineer بالعربي في ١٤ مستوى، من طريقة التفكير في المشكلة لحد بناء أنظمة أتمتة وذكاء اصطناعي كاملة.",
  // Held back until PHASE-G decides the academy design. Pages still build and
  // work; nothing links to them and crawlers are told to skip them.
  robots: { index: false, follow: false },
  alternates: { canonical: URL },
  openGraph: {
    title: "أكاديمية بصمة",
    description: "مسار AI Automation Engineer بالعربي في ١٤ مستوى.",
    url: URL,
  },
}

export default async function AcademyPage() {
  const courses = await getCourses()
  return <AcademyIndex courses={courses} />
}
