"use client"

/**
 * Public-facing error boundary. Catches uncaught errors in Server Components
 * and Client Components under the app/ tree (excluding /dashboard which has
 * its own boundary). Renders a branded, bilingual apology screen with a
 * "Try again" button that calls reset().
 *
 * Kept intentionally minimal — no motion, no external assets — so it renders
 * even when the app is in a broken state.
 */

import { useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { logger } from "@/lib/logger"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { lang } = useI18n()
  const t = (b: { ar: string; en: string }) => (lang === "ar" ? b.ar : b.en)

  useEffect(() => {
    // Structured log so the error is visible in Vercel logs. When Sentry
    // is wired up in a follow-up PR, this same event will also forward there.
    logger.error("unexpected_exception", {
      boundary: "app/error",
      digest: error.digest ?? null,
      message: error.message.slice(0, 200),
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 text-destructive text-2xl font-bold">
          !
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t({ ar: "حصل خطأ غير متوقع", en: "Something went wrong" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t({
              ar: "حاول تحديث الصفحة. لو الخطأ متكرر، تواصل معنا وسنراجع الأمر.",
              en: "Please refresh and try again. If the issue persists, contact us and we\u2019ll look into it.",
            })}
          </p>
          {error.digest && (
            <p className="text-[11px] text-muted-foreground/60 font-mono">
              {t({ ar: "معرف الحادث", en: "Incident ID" })}: {error.digest}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            {t({ ar: "حاول مرة أخرى", en: "Try again" })}
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/30 transition"
          >
            {t({ ar: "الرئيسية", en: "Home" })}
          </a>
        </div>
      </div>
    </div>
  )
}
