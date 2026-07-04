"use client"

/**
 * Dashboard-scoped error boundary. Catches errors in any /dashboard/*
 * route without blowing up the whole shell. Provides a "Try again" button
 * that calls reset() and a link back to the dashboard home so the user
 * isn't stranded.
 */

import { useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { logger } from "@/lib/logger"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { lang } = useI18n()
  const t = (b: { ar: string; en: string }) => (lang === "ar" ? b.ar : b.en)

  useEffect(() => {
    logger.error("unexpected_exception", {
      boundary: "dashboard/error",
      digest: error.digest ?? null,
      message: error.message.slice(0, 200),
    })
  }, [error])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 text-destructive text-xl font-bold">
          !
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {t({ ar: "تعذّر تحميل هذه الصفحة", en: "This page couldn\u2019t load" })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t({
              ar: "لو تكرر الخطأ، جرّب تسجيل الخروج والدخول من جديد.",
              en: "If the error persists, try logging out and back in.",
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
            href="/dashboard"
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/30 transition"
          >
            {t({ ar: "لوحة التحكم", en: "Dashboard" })}
          </a>
        </div>
      </div>
    </div>
  )
}
