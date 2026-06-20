"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export type Lang = "ar" | "en"

// Translation dictionary. Add keys as we translate each section.
export const translations: Record<string, { ar: string; en: string }> = {
  // Navbar
  "nav.platform": { ar: "المنصة", en: "Platform" },
  "nav.pricing": { ar: "الأسعار", en: "Pricing" },
  "nav.docs": { ar: "التوثيق", en: "Docs" },
  "nav.login": { ar: "تسجيل الدخول", en: "Log in" },
  "nav.getStarted": { ar: "ابدأ مجاناً", en: "Get Started" },
  // Hero
  "hero.badge": { ar: "أول منصة عربية لأتمتة واتساب", en: "The first Arabic WhatsApp platform" },
  "hero.title": { ar: "منصة واتساب الذكية لأعمالك", en: "The smart WhatsApp platform for your business" },
  "hero.subtitle": { ar: "استقبل وأرسل رسائل واتساب، تابع عملاءك، وأتمت ردودك — واربطها بـ n8n وMake.", en: "Send and receive WhatsApp messages, track customers, and automate your replies — connect with n8n and Make." },
  "hero.cta": { ar: "ابدأ مجاناً", en: "Start Free" },
  // Pricing
  "pricing.title": { ar: "أسعار بسيطة", en: "Simple pricing" },
  "pricing.subtitle": { ar: "بدون رسوم خفية. ألغِ في أي وقت. ابدأ مجاناً.", en: "No hidden fees. Cancel anytime. Start for free." },
  "pricing.choose": { ar: "اختر الباقة", en: "Choose plan" },
  "pricing.trial": { ar: "ابدأ التجربة المجانية", en: "Start Free Trial" },
  "pricing.contact": { ar: "تواصل معنا", en: "Contact Us" },
}

type I18nCtx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string }
const Ctx = createContext<I18nCtx>({ lang: "ar", setLang: () => {}, t: (k) => k })

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar")

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("basma_lang")) as Lang | null
    if (saved === "ar" || saved === "en") setLangState(saved)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
  }, [lang])

  const setLang = (l: Lang) => { setLangState(l); if (typeof window !== "undefined") localStorage.setItem("basma_lang", l) }
  const t = (key: string) => translations[key]?.[lang] ?? key

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export function useI18n() { return useContext(Ctx) }
