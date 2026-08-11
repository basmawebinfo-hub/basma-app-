"use client"

/**
 * Branded 404. Fires when any URL under the app/ tree doesn't match.
 * Bilingual, matches app tokens, offers an escape hatch back home.
 */

import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export default function NotFound() {
  const { lang } = useI18n()
  const t = (b: { ar: string; en: string }) => (lang === "ar" ? b.ar : b.en)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl font-bold text-primary/40 tracking-tight tabular-nums">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t({ ar: "الصفحة غير موجودة", en: "Page not found" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t({
              ar: "الرابط الذي تحاول الوصول إليه لم نجده. تأكد من العنوان أو ارجع للرئيسية.",
              en: "The page you\u2019re looking for doesn\u2019t exist. Check the URL or head back home.",
            })}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            {t({ ar: "الرئيسية", en: "Home" })}
          </Link>
        </div>
      </div>
    </div>
  )
}
