"use client"
import { ShieldCheck, AlertTriangle } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export function SafetyTips({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n()
  const tips = ["safety.t1", "safety.t2", "safety.t3", "safety.t4", "safety.t5"]
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-semibold text-foreground">{t("safety.title")}</h3>
      </div>
      <ul className="space-y-2">
        {(compact ? tips.slice(0, 3) : tips).map((k) => (
          <li key={k} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500/70 shrink-0 mt-0.5" />
            <span>{t(k)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
