"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function PrivacyPage() {
  const { lang } = useI18n()
  const ar = lang === "ar"
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> {ar ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <h1 className="text-3xl font-bold mb-2">{ar ? "سياسة الخصوصية" : "Privacy Policy"}</h1>
        <p className="text-sm text-muted-foreground mb-10">{ar ? "آخر تحديث: يونيو 2026" : "Last updated: June 2026"}</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "1. البيانات التي نجمعها" : "1. Data We Collect"}</h2>
            <p className="mb-3">{ar
              ? "نجمع البيانات التالية:"
              : "We collect the following data:"}</p>
            <ul className="list-disc ps-5 space-y-1">
              <li>{ar ? "بيانات التسجيل: الاسم، البريد الإلكتروني، رقم الهاتف" : "Account registration: name, email, phone number"}</li>
              <li>{ar ? "بيانات الاستخدام: السجلات، الأنشطة، المعالجات" : "Usage data: logs, activities, actions"}</li>
              <li>{ar ? "محتوى الرسائل: رسائل WhatsApp التي تمر عبر حسابك (فقط للتوصيل والأتمتة)" : "Message content: WhatsApp messages passing through your account (solely for delivery and automation)"}</li>
              <li>{ar ? "البيانات الوصفية: IP، المتصفح، الجهاز" : "Metadata: IP address, browser, device information"}</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "2. كيف نستخدم بياناتك" : "2. How We Use Your Data"}</h2>
            <p>{ar
              ? "نستخدم بياناتك لتشغيل BASMA AI، توصيل الرسائل، الأتمتة، إرسال التنبيهات، والامتثال للأنظمة القانونية. لا نبيع بياناتك لأي جهة ثالثة تسويقية."
              : "We use your data to operate BASMA AI, deliver messages, enable automation, send notifications, and comply with legal requirements. We never sell your data to marketing third parties."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "3. مشاركة البيانات" : "3. Data Sharing"}</h2>
            <p>{ar
              ? "نشارك البيانات مع: (أ) مزوّدي البنية التحتية (Vercel، Neon)، (ب) WhatsApp/Meta حسب السياسات الرسمية، (ج) سلطات قانونية إذا لزم الأمر."
              : "We share data with: (a) infrastructure providers (Vercel, Neon), (b) WhatsApp/Meta per official policies, (c) legal authorities if required by law."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "4. الأمان والتشفير" : "4. Security & Encryption"}</h2>
            <p>{ar
              ? "نستخدم TLS 1.3+ للنقل و AES-256 للتخزين. جميع الاتصالات مشفرة. لا يمكن ضمان أمان مطلق لأي نظام عبر الإنترنت."
              : "We use TLS 1.3+ for transport and AES-256 for storage. All connections are encrypted. No system can guarantee absolute security."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "5. احتفاظ البيانات" : "5. Data Retention"}</h2>
            <p>{ar
              ? "نحتفظ برسائل WhatsApp طالما حسابك نشط. بعد حذف الحساب، يتم حذف البيانات خلال 30 يوماً. البيانات المطلوبة قانونياً قد تُحتفظ بها لفترة أطول."
              : "We retain WhatsApp messages while your account is active. Upon account deletion, data is removed within 30 days. Legally required data may be retained longer."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "6. حقوقك (GDPR/CCPA)" : "6. Your Rights"}</h2>
            <p className="mb-3">{ar
              ? "لديك حق في:"
              : "You have the right to:"}</p>
            <ul className="list-disc ps-5 space-y-1">
              <li>{ar ? "الوصول لبياناتك الشخصية" : "Access your personal data"}</li>
              <li>{ar ? "تصحيح البيانات غير الدقيقة" : "Correct inaccurate data"}</li>
              <li>{ar ? "حذف بياناتك (حق النسيان)" : "Delete your data (right to be forgotten)"}</li>
              <li>{ar ? "نقل البيانات إلى جهة أخرى" : "Data portability"}</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "7. التواصل" : "7. Contact"}</h2>
            <p>{ar
              ? "لأي استفسار خصوصية أو طلب حذف: privacy@basmaweb.com"
              : "For privacy inquiries or data deletion requests: privacy@basmaweb.com"}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
