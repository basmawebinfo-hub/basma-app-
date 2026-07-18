"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function DataDeletionPage() {
  const { lang } = useI18n()
  const ar = lang === "ar"
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> {ar ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <h1 className="text-3xl font-bold mb-2">{ar ? "حذف بيانات المستخدم" : "User Data Deletion"}</h1>
        <p className="text-sm text-muted-foreground mb-10">{ar ? "آخر تحديث: يونيو 2026" : "Last updated: June 2026"}</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "حقك في حذف البيانات (GDPR/CCPA)" : "Your Right to Data Deletion (GDPR/CCPA)"}</h2>
            <p>{ar
              ? "وفقاً لـ GDPR وCCPA، يحق لك طلب حذف جميع بياناتك الشخصية من BASMA AI في أي وقت. هذا يشمل ملفك الشخصي، الرسائل، البيانات الوصفية، والسجلات."
              : "Under GDPR and CCPA, you have the right to request deletion of all your personal data from BASMA AI at any time. This includes your profile, messages, metadata, and logs."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "طلب الحذف" : "How to Request Deletion"}</h2>
            <p className="mb-3">{ar ? "اختر إحدى الطرق التالية:" : "Choose one of the following methods:"}</p>
            <ol className="list-decimal ps-5 space-y-3">
              <li>
                <strong>{ar ? "من داخل حسابك:" : "From your account:"}</strong>
                <p className="mt-1">{ar
                  ? "افتح الإعدادات → حذف الحساب. ستطلب تأكيد البريد. بعد التأكيد، سيتم حذف بياناتك خلال 30 يوماً."
                  : "Go to Settings → Delete Account. Confirm via email. Your data will be deleted within 30 days."}</p>
              </li>
              <li>
                <strong>{ar ? "عبر البريد الإلكتروني:" : "By email:"}</strong>
                <p className="mt-1">{ar
                  ? "أرسل بريداً إلى privacy@basmaweb.com من بريدك المسجّل. اذكر: \"أطلب حذف حسابي وكل بياناتي\". سنرسل تأكيد خلال 7 أيام."
                  : "Send an email to privacy@basmaweb.com from your registered address. Include: \"I request deletion of my account and all my data.\" We will confirm within 7 days."}</p>
              </li>
              <li>
                <strong>{ar ? "نموذج طلب GDPR:" : "GDPR Request Form:"}</strong>
                <p className="mt-1">{ar
                  ? "ملئ نموذج طلب Data Subject Access Request (DSAR) وإرساله إلى legal@basmaweb.com"
                  : "Complete a Data Subject Access Request (DSAR) form and submit to legal@basmaweb.com"}</p>
              </li>
            </ol>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "ماذا يتم حذفه" : "What Gets Deleted"}</h2>
            <ul className="list-disc ps-5 space-y-1">
              <li>{ar ? "ملف المستخدم الشخصي" : "Your user profile"}</li>
              <li>{ar ? "جميع أرقام واتساب المربوطة" : "All linked WhatsApp numbers"}</li>
              <li>{ar ? "كل الرسائل والمحادثات" : "All messages and conversations"}</li>
              <li>{ar ? "قواعد الأتمتة والـ Webhooks" : "Automation rules and webhooks"}</li>
              <li>{ar ? "سجلات النشاط والإحصائيات" : "Activity logs and analytics"}</li>
              <li>{ar ? "بيانات الفواتير والدفع" : "Billing and payment history"}</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "استثناءات قانونية" : "Legal Exceptions"}</h2>
            <p>{ar
              ? "قد نحتفظ ببعض البيانات إذا فرضت القانون ذلك (مثل السجلات الضريبية لمدة 7 سنوات). سنخطرك بأي بيانات محتفظ بها."
              : "We may retain some data if required by law (such as tax records for 7 years). We will notify you of any retained data."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "المدة الزمنية" : "Timeline"}</h2>
            <p>{ar
              ? "• تأكيد الطلب: 7 أيام\n• حذف الBيانات: 30 يوماً من التأكيد\n• تأكيد النهائي: 5 أيام"
              : "• Request confirmation: 7 days\n• Data deletion: 30 days from confirmation\n• Final confirmation: 5 days"}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "أسئلة إضافية" : "More Questions?"}</h2>
            <p>{ar
              ? "تواصل معنا: privacy@basmaweb.com"
              : "Contact us: privacy@basmaweb.com"}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
