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
              ? "باستخدامك منصة BASMA AI، فإنك توافق على هذه الشروط بالكامل. إذا لم توافق، يُرجى عدم استخدام المنصة."
              : "By using the BASMA AI platform, you agree to these terms in full. If you do not agree, please do not use the platform."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "2. استخدام الخدمة" : "2. Use of Service"}</h2>
            <p>{ar
              ? "تلتزم باستخدام BASMA AI لأغراض مشروعة فقط، ووفقاً لسياسات WhatsApp الرسمية. يُمنع استخدام الخدمة لإرسال رسائل مزعجة (Spam)، محتوى غير قانوني، أو انتهاك سياسات WhatsApp."
              : "You agree to use BASMA AI for lawful purposes only and in accordance with WhatsApp's official policies. The service cannot be used for spam, unlawful content, or any violation of WhatsApp's terms."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "3. الفواتير والدفع" : "3. Billing & Payment"}</h2>
            <p>{ar
              ? "يتم تحصيل رسوم الاشتراك شهرياً بناءً على الخطة المختارة. أنت مسؤول عن الحفاظ على بيانات دفع صحيحة. نحتفظ بحق تعليق الخدمة في حالة عدم الدفع."
              : "Subscription fees are billed monthly according to your selected plan. You are responsible for keeping your billing information current. We reserve the right to suspend service if payment fails."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "4. تعليق الحساب" : "4. Account Suspension"}</h2>
            <p>{ar
              ? "نحتفظ بحق تعليق أو حذف أي حساب يخالف هذه الشروط أو سياسات WhatsApp. قد يكون التعليق فوري في حالات انتهاكات جسيمة."
              : "We reserve the right to suspend or terminate any account that violates these terms or WhatsApp's policies. Immediate suspension may occur in cases of serious violations."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "5. التكامل مع WhatsApp" : "5. WhatsApp Integration"}</h2>
            <p>{ar
              ? "BASMA AI يتكامل مع WhatsApp من خلال واجهات برمجية رسمية. نحن لسنا جهة معتمدة أو شريكة رسمية من Meta/WhatsApp. استخدام الخدمة يجب أن يكون متوافقاً مع شروط خدمة WhatsApp."
              : "BASMA AI integrates with WhatsApp through official APIs. We are not an official partner or certified provider of Meta/WhatsApp. Your use must comply with WhatsApp's Terms of Service."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "6. حدود المسؤولية" : "6. Limitation of Liability"}</h2>
            <p>{ar
              ? "تُقدّم الخدمة \"كما هي\". BASMA AI غير مسؤول عن أضرار غير مباشرة (خسارة بيانات، خسارة أرباح) الناتجة عن انقطاع الخدمة، أخطاء المستخدم، أو قيود WhatsApp."
              : "The service is provided \"as is\". BASMA AI is not liable for indirect damages (data loss, lost profits) resulting from service interruption, user error, or WhatsApp limitations."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "7. تعديلات الشروط" : "7. Amendments"}</h2>
            <p>{ar
              ? "نحتفظ بحق تعديل هذه الشروط في أي وقت. استمرارك في استخدام الخدمة يعني قبولك للشروط المعدّلة."
              : "We reserve the right to modify these terms at any time. Your continued use of the service constitutes acceptance of any amendments."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "8. التواصل" : "8. Contact"}</h2>
            <p>{ar
              ? "لأي استفسار حول الشروط، تواصل معنا عبر: legal@basmaweb.com"
              : "For questions about these terms, contact us at: legal@basmaweb.com"}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
