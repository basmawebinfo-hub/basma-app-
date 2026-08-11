"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CONTACT } from "@/config/contact"
import { useI18n } from "@/lib/i18n"

/**
 * Rewritten in Phase E. The previous version was the WhatsApp platform's terms
 * — plans, message limits, API keys, uptime. None of that exists.
 *
 * These terms describe what BASMA actually does today: publishes course
 * content, and pays for subscriptions on a customer's behalf. Section 3 is the
 * one that matters commercially — it states the account-ownership position and
 * the refund commitment that the service page makes, so the two agree.
 */
export default function TermsPage() {
  const { lang } = useI18n()
  const ar = lang === "ar"

  const sections = [
    {
      h: ar ? "١. عن بصمة" : "1. About BASMA",
      p: ar
        ? "بصمة بتقدّم حاجتين: محتوى تعليمي عن الأتمتة والذكاء الاصطناعي، وخدمات بتساعدك تشترك في أدوات وكورسات أونلاين. استخدامك للموقع معناه موافقتك على الشروط دي."
        : "BASMA offers two things: educational content about automation and AI, and services that help you subscribe to online tools and courses. Using this site means you accept these terms.",
    },
    {
      h: ar ? "٢. المحتوى التعليمي" : "2. Educational content",
      p: ar
        ? "المحتوى للتعلّم الشخصي. تقدر تستخدمه وتطبّقه في شغلك، بس مش مسموح تعيد نشره أو تبيعه كأنه محتواك. المسار لسه بيتبني وبنضيف مستويات أول بأول — مش بنضمن تواريخ محددة للنشر."
        : "The content is for personal learning. You may use and apply it in your work, but not republish or resell it as your own. The roadmap is still being built and we add levels as they're written — we don't guarantee specific publication dates.",
    },
    {
      h: ar ? "٣. خدمة الاشتراكات" : "3. The subscription service",
      p: ar
        ? "إحنا بندفع الاشتراك نيابةً عنك على حسابك إنت. الحساب ملكك، بإيميلك، وكلمة السر تفضل معاك. إحنا مش بنبيع ولا بنأجّر ولا بنشارك حسابات. علاقتك مع مزوّد الخدمة نفسه محكومة بشروطه هو، وإنت مسؤول إنك تلتزم بيها."
        : "We pay for the subscription on your behalf, on your own account. The account is yours, on your email, and your password stays with you. We do not sell, rent, or share accounts. Your relationship with the provider is governed by that provider's own terms, and complying with them is your responsibility.",
    },
    {
      h: ar ? "٤. الدفع والاسترجاع" : "4. Payment and refunds",
      p: ar
        ? "بنأكدلك التكلفة قبل ما تدفع أي حاجة. لو ما قدرناش نكمّل الاشتراك لأي سبب، بنرجّعلك المبلغ اللي دفعته. بعد ما الاشتراك يتفعّل فعليًا، أي استرجاع بيبقى خاضع لسياسة المزوّد نفسه مش سياستنا."
        : "We confirm the cost before you pay anything. If we cannot complete the subscription for any reason, we refund what you paid. Once the subscription is actually active, any refund is subject to the provider's own policy, not ours.",
    },
    {
      h: ar ? "٥. حدود المسؤولية" : "5. Limits of responsibility",
      p: ar
        ? "مش مسؤولين عن قرارات المزوّد نفسه — زي تغيير الأسعار أو إيقاف خدمة أو تعديل شروطه. ومسؤوليتنا في أي حالة محدودة بالمبلغ اللي دفعته لنا في المعاملة المعنية."
        : "We are not responsible for the provider's own decisions — price changes, discontinued services, or changes to their terms. In any case our liability is limited to the amount you paid us for the transaction in question.",
    },
    {
      h: ar ? "٦. تعديل الشروط" : "6. Changes",
      p: ar
        ? "ممكن نعدّل الشروط دي مع تطوّر الخدمات. التاريخ اللي فوق بيوضّح آخر تحديث."
        : "We may update these terms as the services develop. The date above shows the last update.",
    },
    {
      h: ar ? "٧. التواصل" : "7. Contact",
      p: ar
        ? `لأي استفسار، كلّمنا على واتساب: ${CONTACT.whatsappDisplay}`
        : `For any question, message us on WhatsApp: ${CONTACT.whatsappDisplay}`,
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
        <h1 className="text-3xl font-bold mb-2">{ar ? "الشروط والأحكام" : "Terms of Service"}</h1>
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
