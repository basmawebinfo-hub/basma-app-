"use client"

import { useI18n } from "@/lib/i18n"

/**
 * First focusable element on the page. Visually hidden until focused,
 * lets keyboard users jump past the fixed navigation to <main>.
 */
export function SkipLink() {
  const { lang } = useI18n()
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none"
    >
      {lang === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}
    </a>
  )
}
