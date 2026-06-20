"use client"
import { useI18n } from "@/lib/i18n"
import { Globe } from "lucide-react"

export function LangToggle() {
  const { lang, setLang } = useI18n()
  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted/40 transition-colors"
      aria-label="Switch language"
    >
      <Globe className="w-3.5 h-3.5" />
      {lang === "ar" ? "EN" : "ع"}
    </button>
  )
}
