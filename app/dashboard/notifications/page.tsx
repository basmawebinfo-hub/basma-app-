import { ComingSoon } from "@/components/dashboard/coming-soon"

export default function NotificationsPage() {
  return (
    <ComingSoon
      title={{ ar: "الإشعارات", en: "Notifications" }}
      description={{
        ar: "كل تنبيهاتك ومهامك في مكان واحد. الجرس فوق على يمين الشاشة شغّال بالفعل.",
        en: "All your alerts and tasks in one place. The bell at the top right is already live.",
      }}
      phase={2}
    />
  )
}
