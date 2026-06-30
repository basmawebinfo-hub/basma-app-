import { ComingSoon } from "@/components/dashboard/coming-soon"

export default function LabPage() {
  return (
    <ComingSoon
      title={{ ar: "المختبر — AI Lab", en: "AI Lab" }}
      description={{
        ar: "جرّب workflows جاهزة قبل ما تبنيها بنفسك. شوف الـ n8n بشكل حقيقي وحمّل الـ JSON.",
        en: "Try ready-made workflows before you build your own. See real n8n in action and download JSON.",
      }}
      phase={3}
    />
  )
}
