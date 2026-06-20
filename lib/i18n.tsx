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
  "nav.features": { ar: "المميزات", en: "Features" },
  "nav.howItWorks": { ar: "كيف يعمل", en: "How it works" },
  "nav.useCases": { ar: "حالات الاستخدام", en: "Use cases" },
  "nav.faq": { ar: "الأسئلة الشائعة", en: "FAQ" },
  "nav.contact": { ar: "تواصل معنا", en: "Contact" },

  // Hero
  "hero.badge": { ar: "أول منصة عربية لأتمتة واتساب والأعمال", en: "The first Arabic WhatsApp automation platform" },
  "hero.title": { ar: "منصة واتساب الذكية لأعمالك", en: "The smart WhatsApp platform for your business" },
  "hero.subtitle": { ar: "استقبل وأرسل رسائل واتساب، تابع عملاءك، وأتمت ردودك — واربطها بـ n8n وMake.", en: "Send and receive WhatsApp messages, track customers, and automate your replies — connect with n8n and Make." },
  "hero.cta": { ar: "ابدأ مجاناً", en: "Start Free" },
  "hero.title1": { ar: "أتمت أعمالك على واتساب", en: "Automate your business on WhatsApp" },
  "hero.title2": { ar: "بدون أي كود.", en: "with zero code." },
  "hero.desc": { ar: "اربط أرقام واتساب، استقبل وأرسل الرسائل تلقائياً، وادمجها مع n8n وZapier وأنظمتك. منصة واحدة لإدارة عملائك وأتمتة ردودك ومتابعة أعمالك.", en: "Connect WhatsApp numbers, send and receive messages automatically, and integrate with n8n, Zapier, and your systems. One platform to manage customers, automate replies, and grow." },

  // Pricing
  "pricing.title": { ar: "أسعار بسيطة", en: "Simple pricing" },
  "pricing.subtitle": { ar: "بدون رسوم خفية. ألغِ في أي وقت. ابدأ مجاناً.", en: "No hidden fees. Cancel anytime. Start for free." },
  "pricing.choose": { ar: "اختر الباقة", en: "Choose plan" },
  "pricing.trial": { ar: "ابدأ التجربة المجانية", en: "Start Free Trial" },
  "pricing.contact": { ar: "تواصل معنا", en: "Contact Us" },
  // How it works
  "how.title1": { ar: "كيف", en: "How it" },
  "how.title2": { ar: "يعمل", en: "works" },
  "how.subtitle": { ar: "من الصفر إلى واتساب آلي بالكامل في ثلاث خطوات بسيطة", en: "From zero to live WhatsApp automation in three simple steps" },
  "how.s1.title": { ar: "امسح واربط", en: "Scan & Connect" },
  "how.s1.desc": { ar: "افتح اللوحة، امسح كود QR من واتساب، ورقمك يشتغل في أقل من 30 ثانية.", en: "Open the dashboard, scan the QR code with WhatsApp, and your number is live in under 30 seconds." },
  "how.s2.title": { ar: "اضبط الـ Webhooks", en: "Configure Webhooks" },
  "how.s2.desc": { ar: "اختر الأحداث التي تريد تمريرها — الرسائل، تحديثات الحالة — وحدد روابط الوجهة.", en: "Choose which events to forward — messages, status updates — and set your destination URLs." },
  "how.s3.title": { ar: "أتمت كل شيء", en: "Automate Everything" },
  "how.s3.desc": { ar: "كل حدث في واتساب يشغّل سير عملك في n8n أو Zapier تلقائياً وفي الوقت الفعلي.", en: "Every WhatsApp event triggers your n8n, Zapier, or custom workflow automatically, in real time." },
  // Final CTA
  "cta.title1": { ar: "ابدأ أتمتة أعمالك", en: "Start connecting WhatsApp" },
  "cta.title2": { ar: "على واتساب اليوم.", en: "to your business today." },
  "cta.subtitle": { ar: "انضم إلى مئات الأعمال التي تدير عملاءها مع بصمة.", en: "Join hundreds of businesses managing their customers with Basma." },
  "cta.join": { ar: "انضم لقائمة الانتظار", en: "Join Waitlist" },
  "cta.dashboard": { ar: "اذهب للوحة", en: "View Dashboard" },
  // Stats
  "stats.s1": { ar: "تكامل مدعوم", en: "integrations supported" },
  "stats.s2": { ar: "وقت تشغيل المنصة", en: "platform uptime" },
  "stats.s3": { ar: "زمن تسليم الـ Webhook", en: "webhook delivery latency" },
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
