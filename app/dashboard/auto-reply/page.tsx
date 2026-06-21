"use client"
import { Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function AutoReplyPage() {
  const { t } = useI18n()
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t("ar.title")}</h1>
        <p className="text-muted-foreground">{t("ar.desc")}</p>
        <a href="/dashboard/webhooks" className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">{t("ar.cta")}</a>
      </div>
    </div>
  )
}
