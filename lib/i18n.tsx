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
  // Footer
  "footer.tagline": { ar: "أول منصة عربية لأتمتة واتساب وإدارة أعمالك بذكاء.", en: "The first Arabic platform to automate WhatsApp and grow your business." },
  "footer.product": { ar: "المنتج", en: "Product" },
  "footer.company": { ar: "الشركة", en: "Company" },
  "footer.legal": { ar: "قانوني", en: "Legal" },
  "footer.features": { ar: "المميزات", en: "Features" },
  "footer.pricing": { ar: "الأسعار", en: "Pricing" },
  "footer.useCases": { ar: "حالات الاستخدام", en: "Use cases" },
  "footer.about": { ar: "عن بصمة", en: "About" },
  "footer.contact": { ar: "تواصل معنا", en: "Contact" },
  "footer.faq": { ar: "الأسئلة الشائعة", en: "FAQ" },
  "footer.privacy": { ar: "الخصوصية", en: "Privacy" },
  "footer.terms": { ar: "الشروط", en: "Terms" },
  "footer.docs": { ar: "التوثيق", en: "Docs" },
  "footer.rights": { ar: "جميع الحقوق محفوظة.", en: "All rights reserved." },
  // Use cases
  "uc.title": { ar: "ماذا ستربط؟", en: "What will you connect?" },
  "uc.subtitle": { ar: "من صناديق الوارد البسيطة إلى الأتمتة المعقّدة، بصمة تتولّى كل شيء.", en: "From simple inboxes to complex automations, Basma handles it all." },
  "uc.q1": { ar: "كيف نمرّر كل رسالة واتساب إلى سير عمل n8n تلقائياً؟", en: "How can we forward every WhatsApp message into an n8n workflow automatically?" },
  "uc.q2": { ar: "تريد تشغيل أتمتة Zapier لحظة وصول رسالة من عميل؟", en: "Want to trigger Zapier zaps the moment a customer sends a WhatsApp message?" },
  "uc.q3": { ar: "تحتاج تمرير أحداث واتساب مباشرة إلى Make بدون أي كود؟", en: "Need to pass WhatsApp events directly into Make scenarios with zero code?" },
  "uc.q4": { ar: "كيف ندير آلاف محادثات واتساب في مكان واحد موحّد؟", en: "How do we manage thousands of WhatsApp conversations in one place?" },
  "uc.q5": { ar: "تريد بيانات حية عن حجم الرسائل ومعدلات الرد وساعات الذروة؟", en: "Want live data on message volume, response rates, and peak hours?" },
  "uc.q6": { ar: "تحتاج كل حدث — رسائل ومكالمات وحالات — على مدار الساعة؟", en: "Need every event delivered around the clock?" },
  "uc.q7": { ar: "تبحث عن webhooks موقّعة بـ HMAC مع إعادة محاولة تلقائية؟", en: "Looking for HMAC-signed webhook payloads with automatic retry?" },
  "uc.q8": { ar: "تريد خدمة عملاء في أي دولة على واتساب وعلى نطاق واسع؟", en: "Want to support customers across any country on WhatsApp at scale?" },
  // FAQ
  "faq.title1": { ar: "الأسئلة", en: "Frequently asked" },
  "faq.title2": { ar: "الشائعة", en: "questions" },
  "faq.subtitle": { ar: "كل ما تحتاج معرفته عن بصمة", en: "Everything you need to know about Basma" },
  "faq.q1": { ar: "ما السرعة التي يمكنني بها ربط رقم واتساب؟", en: "How quickly can I connect my WhatsApp number?" },
  "faq.a1": { ar: "في أقل من 30 ثانية. امسح كود QR من لوحة بصمة، اربط رقمك عبر الأجهزة المرتبطة في واتساب، وتبدأ باستقبال الرسائل فوراً. بدون أي إعداد API معقّد.", en: "In under 30 seconds. Scan the QR code, link via WhatsApp Linked Devices, and start receiving messages immediately. No complex API setup." },
  "faq.q2": { ar: "ما أدوات الأتمتة التي تدعمها بصمة؟", en: "Which automation tools does Basma support?" },
  "faq.a2": { ar: "بصمة تمرّر أحداث webhook لأي رابط HTTP — n8n وZapier وMake وHubSpot وSlack وGoogle Sheets وAirtable. أي أداة تقبل POST تشتغل مع بصمة.", en: "Basma forwards webhook events to any HTTP endpoint — n8n, Zapier, Make, HubSpot, Slack, Google Sheets, and Airtable." },
  "faq.q3": { ar: "ما أنواع أحداث واتساب التي يمكنني استقبالها؟", en: "What types of WhatsApp events can I receive?" },
  "faq.a3": { ar: "بصمة تدعم أنواع أحداث متعددة: الرسائل الواردة، تحديثات الحالة، المكالمات، تغيّرات جهات الاتصال، تحديثات المجموعات والمزيد. تشترك فقط بالأحداث التي تحتاجها.", en: "Basma supports many event types: incoming messages, status updates, calls, contact changes, group updates and more." },
  "faq.q4": { ar: "هل تدعم بصمة أكثر من رقم واتساب؟", en: "Does Basma support multiple WhatsApp numbers?" },
  "faq.a4": { ar: "نعم. تختار الباقة حسب عدد الأرقام التي تحتاجها، وكل رقم له صندوق وارد وإعدادات webhook وتحليلات خاصة به.", en: "Yes. Choose a plan by the number of connections you need; each number has its own inbox, webhook config, and analytics." },
  "faq.q5": { ar: "كيف يتم تأمين تسليم الـ webhook؟", en: "How are webhook deliveries secured?" },
  "faq.a5": { ar: "تدعم الباقات المدفوعة توقيع الطلبات بـ HMAC-SHA256. كل تسليم يتضمّن توقيعاً ليتحقق منه الخادم، والتسليمات الفاشلة تُعاد تلقائياً.", en: "Paid plans support HMAC-SHA256 request signing. Each delivery includes a signature header, and failed deliveries are retried automatically." },
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
