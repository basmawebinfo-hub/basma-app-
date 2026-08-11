"use client"
import { useI18n } from "@/lib/i18n"
import { Globe } from "lucide-react"

export function LangToggle() {
  const { lang, setLang } = useI18n()
  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 min-h-11 min-w-11 border border-border text-xs font-medium hover:bg-muted/40 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      aria-label="Switch language"
    >
      <Globe className="w-3.5 h-3.5" />
      {lang === "ar" ? "EN" : "ع"}
    </button>
  )
}
