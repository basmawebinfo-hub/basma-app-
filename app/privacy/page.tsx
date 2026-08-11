"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CONTACT } from "@/config/contact"
import { useI18n } from "@/lib/i18n"

/**
 * Rewritten in Phase E. The previous version described the retired WhatsApp
 * platform — sign-up accounts, message storage, webhook delivery — none of
 * which this site does any more. A privacy policy describing a product that
 * doesn't exist is worse than none, especially on a site that asks people to
 * send money.
 *
 * What the site actually does today: it is static, has no accounts, no
 * database, and no forms. The only data flow is a WhatsApp conversation the
 * visitor starts themselves, plus anonymous analytics.
 */
export default function PrivacyPage() {
  const { lang } = useI18n()
  const ar = lang === "ar"

  const sections = [
    {
      h: ar ? "١. الخلاصة" : "1. In short",
      p: ar
        ? "الموقع ده صفحات ثابتة. مفيش تسجيل حساب، مفيش قاعدة بيانات، ومفيش فورم بيتبعت. لو حابب تتواصل معانا بتبعتلنا رسالة على واتساب بنفسك، وساعتها بس بيبقى عندنا بياناتك."
        : "This site is static pages. There are no accounts, no database, and no forms. If you want to reach us you start a WhatsApp conversation yourself — and only then do we hold any of your details.",
    },
    {
      h: ar ? "٢. البيانات اللي بنشوفها" : "2. What we see",
      p: ar
        ? "لما تكلّمنا على واتساب بنشوف اسمك ورقمك زي أي محادثة واتساب عادية، وبنشوف اللي بتكتبه لنا. الموقع نفسه بيستخدم تحليلات مجهولة الهوية (Vercel Analytics) بتقيس عدد الزيارات والصفحات — من غير كوكيز تتبّع ومن غير تحديد شخصيتك."
        : "When you message us on WhatsApp we see your name and number, like any WhatsApp conversation, plus what you write. The site itself uses anonymous analytics (Vercel Analytics) that count visits and pages — no tracking cookies, no personal identification.",
    },
    {
      h: ar ? "٣. خدمة الاشتراكات" : "3. The subscription service",
      p: ar
        ? "لو استخدمت خدمة الاشتراك في أدوات الذكاء الاصطناعي، بنحتاج بيانات محددة لإتمام العملية — زي الإيميل اللي هيتعمل عليه الحساب، واسم الأداة والباقة. بنستخدمها للغرض ده بس. إحنا مش بنطلب كلمة السر بتاعتك ومش محتاجينها."
        : "If you use the AI subscription service, we need specific details to complete it — such as the email the account will be created on, and which tool and plan. We use them for that purpose only. We do not ask for your password and do not need it.",
    },
    {
      h: ar ? "٤. الدفع" : "4. Payments",
      p: ar
        ? "الدفع بيتم خارج الموقع بالكامل — فودافون كاش، محفظة إلكترونية، أو تحويل بنكي. الموقع مش بيستقبل ولا بيخزّن أي بيانات دفع أو أرقام كروت."
        : "Payment happens entirely off this website — Vodafone Cash, an e-wallet, or a bank transfer. The site never receives or stores any payment details or card numbers.",
    },
    {
      h: ar ? "٥. مشاركة البيانات" : "5. Sharing",
      p: ar
        ? "مش بنبيع بياناتك ولا بنشاركها لأغراض تسويقية. الحاجة الوحيدة اللي ممكن نتعامل معاها بالنيابة عنك هي إتمام الاشتراك اللي طلبته عند مزوّد الخدمة نفسه."
        : "We do not sell your data or share it for marketing. The only thing we act on your behalf for is completing the subscription you asked for, with that provider.",
    },
    {
      h: ar ? "٦. حقوقك" : "6. Your rights",
      p: ar
        ? "تقدر تطلب في أي وقت إننا نمسح المحادثة وأي بيانات عندنا. كلّمنا على واتساب وهننفّذ."
        : "You can ask us at any time to delete the conversation and anything we hold. Message us on WhatsApp and we'll do it.",
    },
    {
      h: ar ? "٧. التواصل" : "7. Contact",
      p: ar
        ? `لأي سؤال عن الخصوصية، كلّمنا على واتساب: ${CONTACT.whatsappDisplay}`
        : `For any privacy question, message us on WhatsApp: ${CONTACT.whatsappDisplay}`,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 min-h-11 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
          {ar ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <h1 className="text-3xl font-bold mb-2">{ar ? "سياسة الخصوصية" : "Privacy Policy"}</h1>
        <p className="text-sm text-muted-foreground mb-10">
          {ar ? "آخر تحديث: أغسطس ٢٠٢٦" : "Last updated: August 2026"}
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold text-foreground mb-2">{s.h}</h2>
              <p>{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
