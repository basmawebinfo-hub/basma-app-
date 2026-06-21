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
            <p>{ar
              ? "نجمع البيانات التي تقدّمها عند التسجيل (الاسم، البريد الإلكتروني، رقم الهاتف)، وبيانات استخدامك للمنصة، ورسائل واتساب التي تمر عبر حسابك لغرض التوصيل والأتمتة فقط."
              : "We collect the information you provide at sign-up (name, email, phone), your usage data, and the WhatsApp messages that pass through your account solely for delivery and automation purposes."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "2. كيف نستخدم بياناتك" : "2. How We Use Your Data"}</h2>
            <p>{ar
              ? "نستخدم بياناتك لتشغيل المنصة، توصيل الرسائل، إرسال التنبيهات، وتحسين الخدمة. لا نبيع بياناتك لأي طرف ثالث."
              : "We use your data to operate the platform, deliver messages, send notifications, and improve the service. We never sell your data to third parties."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "3. مشاركة البيانات" : "3. Data Sharing"}</h2>
            <p>{ar
              ? "نشارك البيانات فقط مع مزوّدي الخدمات الأساسيين (مثل مزوّد البنية التحتية وواتساب) ووفقاً للأنظمة المعمول بها."
              : "We share data only with essential service providers (such as our infrastructure and WhatsApp providers) and as required by applicable law."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "4. الأمان" : "4. Security"}</h2>
            <p>{ar
              ? "نستخدم تشفيراً وإجراءات حماية صارمة لتأمين بياناتك. ومع ذلك، لا يمكن ضمان أمان مطلق لأي نظام عبر الإنترنت."
              : "We use encryption and strict safeguards to protect your data. However, no internet system can guarantee absolute security."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "5. حقوقك" : "5. Your Rights"}</h2>
            <p>{ar
              ? "يمكنك طلب الوصول إلى بياناتك أو تعديلها أو حذفها في أي وقت عبر التواصل معنا."
              : "You may request access to, correction of, or deletion of your data at any time by contacting us."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "6. التواصل" : "6. Contact"}</h2>
            <p>{ar
              ? "لأي استفسار حول الخصوصية، تواصل معنا عبر: admin@basmaweb.com"
              : "For any privacy inquiry, contact us at: admin@basmaweb.com"}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
