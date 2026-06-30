import { ComingSoon } from "@/components/dashboard/coming-soon"

export default function AcademyPage() {
  return (
    <ComingSoon
      title={{ ar: "الأكاديمية", en: "Academy" }}
      description={{
        ar: "كورسات عربية متخصصة في الـ AI Automation والـ workflows. هتفتح قريباً للمشتركين.",
        en: "Arabic courses in AI Automation and workflows. Opening soon for subscribers.",
      }}
      phase={2}
    />
  )
}
