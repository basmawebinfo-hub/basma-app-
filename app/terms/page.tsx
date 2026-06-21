"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function TermsPage() {
  const { lang } = useI18n()
  const ar = lang === "ar"
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> {ar ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <h1 className="text-3xl font-bold mb-2">{ar ? "شروط الاستخدام" : "Terms of Service"}</h1>
        <p className="text-sm text-muted-foreground mb-10">{ar ? "آخر تحديث: يونيو 2026" : "Last updated: June 2026"}</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "1. قبول الشروط" : "1. Acceptance of Terms"}</h2>
            <p>{ar
              ? "باستخدامك منصة بصمة، فإنك توافق على هذه الشروط بالكامل. إذا لم توافق، يُرجى عدم استخدام المنصة."
              : "By using the Basma platform, you agree to these terms in full. If you do not agree, please do not use the platform."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "2. استخدام الخدمة" : "2. Use of Service"}</h2>
            <p>{ar
              ? "تلتزم باستخدام المنصة لأغراض مشروعة فقط، ووفقاً لسياسات واتساب. يُمنع استخدام المنصة في إرسال رسائل مزعجة (spam) أو محتوى مخالف."
              : "You agree to use the platform for lawful purposes only and in compliance with WhatsApp policies. Spam or unlawful content is strictly prohibited."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "3. الاشتراكات والرصيد" : "3. Subscriptions & Credit"}</h2>
            <p>{ar
              ? "تُخصم رسوم الاشتراك يومياً من رصيدك حسب الباقة المختارة. أنت مسؤول عن الحفاظ على رصيد كافٍ لاستمرار الخدمة."
              : "Subscription fees are deducted daily from your balance based on your chosen plan. You are responsible for maintaining sufficient balance to keep the service active."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "4. إيقاف الحساب" : "4. Account Suspension"}</h2>
            <p>{ar
              ? "نحتفظ بحق إيقاف أو إنهاء أي حساب يخالف هذه الشروط أو سياسات واتساب دون إشعار مسبق."
              : "We reserve the right to suspend or terminate any account that violates these terms or WhatsApp policies without prior notice."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "5. حدود المسؤولية" : "5. Limitation of Liability"}</h2>
            <p>{ar
              ? "تُقدّم الخدمة \"كما هي\". لا نتحمّل المسؤولية عن أي أضرار غير مباشرة ناتجة عن انقطاع الخدمة أو فقدان البيانات."
              : "The service is provided \"as is\". We are not liable for any indirect damages resulting from service interruption or data loss."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "6. التواصل" : "6. Contact"}</h2>
            <p>{ar
              ? "لأي استفسار حول الشروط، تواصل معنا عبر: admin@basmaweb.com"
              : "For any inquiry about these terms, contact us at: admin@basmaweb.com"}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
