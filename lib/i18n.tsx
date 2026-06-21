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
  // Testimonials
  "test.title1": { ar: "موثوق من", en: "Loved by" },
  "test.title2": { ar: "الشركات", en: "businesses" },
  "test.subtitle": { ar: "انضم إلى مئات الأعمال التي تستخدم بصمة بالفعل", en: "Join hundreds of businesses already using Basma" },
  "test.q1": { ar: "بصمة تربط واتساب مباشرة بـ n8n. كل رسالة عميل تشغّل أتمتة فوراً — بدون كود ولا تعقيد.", en: "Basma connects our WhatsApp directly to n8n. Every customer message triggers an automation instantly — no code, no hassle." },
  "test.q2": { ar: "انتقلنا من متابعة واتساب يدوياً طوال اليوم إلى توجيه كل رسالة للفريق المناسب تلقائياً. نقلة نوعية.", en: "We went from manually checking WhatsApp all day to routing every message to the right team automatically. Game changer." },
  "test.q3": { ar: "الإعداد استغرق أقل من 30 ثانية. مسحنا الكود، ربطنا الرقم، وبدأت الـ webhooks تعمل مع Zapier فوراً.", en: "Setup took under 30 seconds. Scanned the QR, linked our number, and webhooks started firing into Zapier immediately." },
  "test.r1": { ar: "مديرة العمليات، TechFlow", en: "Head of Operations, TechFlow" },
  "test.r2": { ar: "مدير نجاح العملاء، Studio Nine", en: "Customer Success Director, Studio Nine" },
  "test.r3": { ar: "نائبة رئيس العمليات، Launchpad", en: "VP of Operations, Launchpad" },
  // Video gallery
  "vg.title1": { ar: "شاهد", en: "See" },
  "vg.title2": { ar: "بصمة", en: "Basma" },
  "vg.title3": { ar: "أثناء العمل", en: "in action" },
  "vg.subtitle": { ar: "كل ما تحتاجه لإدارة واتساب على نطاق واسع", en: "Everything you need to manage WhatsApp at scale" },
  "vg.c1.title": { ar: "+200 تكامل", en: "200+ Integrations" },
  "vg.c1.desc": { ar: "اربط أي أداة بـ webhook واحد", en: "Connect to any tool with a single webhook" },
  "vg.c2.title": { ar: "محرّك Webhook", en: "Webhook Engine" },
  "vg.c2.desc": { ar: "مرّر كل حدث إلى n8n أو Zapier أو أي رابط", en: "Forward every event to n8n, Zapier, or any endpoint" },
  "vg.c3.title": { ar: "صندوق وارد موحّد", en: "Unified Inbox" },
  "vg.c3.desc": { ar: "كل محادثات واتساب في مكان واحد", en: "All your WhatsApp conversations in one place" },
  "hero.intg": { ar: "تكامل مدعوم", en: "integrations supported" },
  "hero.intgDesc": { ar: "اتصل بـ n8n وZapier وMake وأي Webhook", en: "connect to n8n, Zapier, Make, and any webhook endpoint" },
  "hero.getStarted": { ar: "ابدأ مجاناً", en: "Get Started Free" },
  "hero.signin": { ar: "تسجيل الدخول", en: "Sign in" },
  "hero.integrates": { ar: "يتكامل مع أدواتك المفضّلة", en: "Integrates with your favorite tools" },
  // Auth / Login
  "auth.welcome": { ar: "أهلاً بعودتك", en: "Welcome back" },
  "auth.noAccount": { ar: "ليس لديك حساب؟", en: "Don't have an account?" },
  "auth.signupFree": { ar: "أنشئ حساباً مجاناً", en: "Sign up free" },
  "auth.email": { ar: "البريد الإلكتروني", en: "Email address" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.forgot": { ar: "نسيت كلمة المرور؟", en: "Forgot password?" },
  "auth.signin": { ar: "تسجيل الدخول", en: "Sign in" },
  "auth.signingin": { ar: "جارٍ تسجيل الدخول...", en: "Signing in..." },
  "auth.back": { ar: "العودة للموقع", en: "Back to website" },
  "auth.headline1": { ar: "أتمت أعمالك على واتساب", en: "Automate your business" },
  "auth.headline2": { ar: "بدون أي كود", en: "with zero code" },
  "auth.subtext": { ar: "Webhooks وصندوق وارد وأتمتة — كلها في مكان واحد.", en: "Webhooks, inbox, and automation — all in one place." },
  "auth.statIntegrations": { ar: "تكامل", en: "Integrations" },
  "auth.statUptime": { ar: "وقت تشغيل", en: "Uptime" },
  "auth.statFree": { ar: "للبدء", en: "to start" },
  "auth.b1": { ar: "تم تأكيد الطلب ✓", en: "Order confirmed ✓" },
  "auth.b2": { ar: "عميل جديد من الموقع 🎯", en: "New lead from web 🎯" },
  "auth.b3": { ar: "تم استلام الدفعة 💳", en: "Payment received 💳" },
  "auth.b4": { ar: "تم إرسال Webhook ⚡", en: "Webhook sent ⚡" },
  "forgot.title": { ar: "إعادة تعيين كلمة المرور", en: "Reset your password" },
  "forgot.subtitle": { ar: "أدخل بريدك وسنرسل لك رابط إعادة التعيين.", en: "Enter your email and we'll send you a reset link." },
  "forgot.send": { ar: "إرسال رابط التعيين", en: "Send reset link" },
  "forgot.sending": { ar: "جارٍ الإرسال...", en: "Sending..." },
  "forgot.sent": { ar: "تم! تفقّد بريدك الإلكتروني لرابط إعادة التعيين.", en: "Done! Check your email for the reset link." },
  "forgot.backLogin": { ar: "العودة لتسجيل الدخول", en: "Back to login" },
  // Register
  "reg.title": { ar: "أنشئ حسابك", en: "Create an account" },
  "reg.haveAccount": { ar: "لديك حساب بالفعل؟", en: "Already have an account?" },
  "reg.login": { ar: "تسجيل الدخول", en: "Log in" },
  "reg.firstName": { ar: "الاسم الأول", en: "First name" },
  "reg.lastName": { ar: "اسم العائلة", en: "Last name" },
  "reg.whatsapp": { ar: "رقم واتساب (لنتواصل معك)", en: "WhatsApp number (so we can contact you)" },
  "reg.confirmPassword": { ar: "تأكيد كلمة المرور", en: "Confirm password" },
  "reg.passwordHint": { ar: "8 أحرف على الأقل", en: "Min. 8 characters" },
  "reg.agree": { ar: "أوافق على", en: "I agree to the" },
  "reg.terms": { ar: "الشروط والأحكام", en: "Terms & Conditions" },
  "reg.create": { ar: "إنشاء الحساب", en: "Create account" },
  "reg.creating": { ar: "جارٍ إنشاء الحساب...", en: "Creating account..." },
  "reg.agreeError": { ar: "يرجى الموافقة على الشروط والأحكام للمتابعة.", en: "Please agree to the Terms & Conditions to continue." },
  "reg.pwShort": { ar: "كلمة المرور يجب أن تكون 8 أحرف على الأقل.", en: "Password must be at least 8 characters." },
  "reg.pwMismatch": { ar: "كلمتا المرور غير متطابقتين.", en: "Passwords do not match." },
  "reg.successTitle": { ar: "حسابك قيد المراجعة", en: "Account under review" },
  "reg.successDesc": { ar: "شكراً لتسجيلك! حسابك قيد المراجعة ويتم تأكيد الدفع. سيتواصل معك فريقنا على واتساب قريباً لتفعيل حسابك.", en: "Thanks for signing up! Your account is being reviewed and payment confirmed. Our team will contact you on WhatsApp shortly to activate your account." },
  "reg.f1": { ar: "مجاني للبدء — بدون بطاقة ائتمان", en: "Free to start — no credit card" },
  "reg.f2": { ar: "اربط في أقل من 30 ثانية", en: "Connect in under 30 seconds" },
  "reg.f3": { ar: "+200 وجهة تكامل", en: "200+ integration destinations" },
  // Dashboard overview
  "dash.welcome": { ar: "أهلاً بك", en: "Welcome" },
  "dash.subtitle": { ar: "نظرة سريعة على منصتك", en: "Your platform at a glance" },
  "dash.msgToday": { ar: "رسائل اليوم", en: "Messages Today" },
  "dash.msgTodayD": { ar: "آخر 24 ساعة", en: "last 24h" },
  "dash.activeChats": { ar: "محادثات نشطة", en: "Active Chats" },
  "dash.activeChatsD": { ar: "محادثات مفتوحة", en: "open conversations" },
  "dash.webhookSuccess": { ar: "نجاح Webhooks", en: "Webhook Success" },
  "dash.webhookSuccessD": { ar: "آخر 24 ساعة", en: "last 24h" },
  "dash.avgReply": { ar: "متوسط زمن الرد", en: "Avg. Reply Time" },
  "dash.avgReplyD": { ar: "تقديري", en: "estimated" },
  "dash.chartTitle": { ar: "الرسائل — آخر 7 أيام", en: "Messages — Last 7 days" },
  "dash.noMsg": { ar: "لا توجد رسائل بعد.", en: "No messages yet." },
  "dash.noMsgHint": { ar: "اربط رقم واتساب وابدأ المراسلة.", en: "Connect a WhatsApp number and start messaging." },
  "dash.recentEvents": { ar: "أحدث أحداث Webhook", en: "Recent Webhook Events" },
  "dash.noEvents": { ar: "لا توجد أحداث بعد. اضبط وجهة Webhook من تبويب Webhooks.", en: "No webhook events yet. Configure a webhook destination in the Webhooks tab." },
  "dash.colEvent": { ar: "الحدث", en: "Event" },
  "dash.colDest": { ar: "الوجهة", en: "Destination" },
  "dash.colStatus": { ar: "الحالة", en: "Status" },
  "dash.colCode": { ar: "الكود", en: "Code" },
  "dash.colTime": { ar: "الوقت", en: "Time" },
  "dash.quickActions": { ar: "إجراءات سريعة", en: "Quick Actions" },
  "dash.qaConnect": { ar: "اربط رقم واتساب", en: "Connect WhatsApp" },
  "dash.qaWebhook": { ar: "أضف Webhook", en: "Add Webhook" },
  "dash.qaInbox": { ar: "صندوق الوارد", en: "Open Inbox" },
  "dash.qaDocs": { ar: "دليل المطوّر", en: "Developer Docs" },
  // Auto-reply page
  "ar.title": { ar: "الرد التلقائي — قريباً", en: "Auto Reply — Coming Soon" },
  "ar.desc": { ar: "الردود الذكية المدعومة بالذكاء الاصطناعي في الطريق. حالياً يمكنك بناء تدفقات رد تلقائي قوية باستخدام Webhooks مع n8n.", en: "Smart AI-powered auto-replies are on the way. For now, you can build powerful auto-reply flows using Webhooks with n8n." },
  "ar.cta": { ar: "إعداد Webhooks", en: "Set up Webhooks" },
  // Campaigns page
  "camp.title": { ar: "الحملات — قريباً", en: "Campaigns — Coming Soon" },
  "camp.desc": { ar: "حملات البث الجماعي لجهات اتصالك في الطريق. ترقّب قريباً.", en: "Bulk broadcast campaigns to your contacts are on the way. Stay tuned." },
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
