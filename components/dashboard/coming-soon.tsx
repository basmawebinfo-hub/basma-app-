"use client"

import { Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n"

type Props = {
  /** Localized page title (e.g. "الأكاديمية" / "Academy") */
  title: { ar: string; en: string }
  /** Localized short description shown under the title */
  description?: { ar: string; en: string }
  /** Which roadmap phase introduces this — shown as a small badge */
  phase?: 2 | 3 | 4
}

/**
 * Placeholder body for routes that are referenced in the Sidebar but
 * whose real implementation lands in a later Roadmap phase.
 *
 * Why have these at all?
 *   1. The Sidebar links don't 404 — better UX than a dead link.
 *   2. Users see what's coming and can self-route to alternatives.
 *   3. Marketing can deep-link "/dashboard/academy" from emails today
 *      without waiting for the feature to ship.
 */
export function ComingSoon({ title, description, phase }: Props) {
  const { lang } = useI18n()
  const t = (b: { ar: string; en: string }) => (lang === "ar" ? b.ar : b.en)

  const phaseLabel: { ar: string; en: string } | null = phase
    ? {
        ar: `قريباً في المرحلة ${phase}`,
        en: `Coming in Phase ${phase}`,
      }
    : null

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t(title)}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{t(description)}</p>
          )}
        </div>

        {phaseLabel && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {t(phaseLabel)}
          </div>
        )}
      </div>
    </div>
  )
}
