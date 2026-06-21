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
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "حقك في حذف بياناتك" : "Your Right to Data Deletion"}</h2>
            <p>{ar
              ? "في بصمة، يحق لك طلب حذف جميع بياناتك الشخصية وبيانات حساباتك المرتبطة (بما في ذلك حسابات واتساب وإنستغرام المربوطة) في أي وقت."
              : "At BASMA, you have the right to request deletion of all your personal data and connected account data (including linked WhatsApp and Instagram accounts) at any time."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "كيف تطلب الحذف" : "How to Request Deletion"}</h2>
            <p className="mb-2">{ar ? "لديك طريقتان:" : "You have two options:"}</p>
            <ol className="list-decimal ps-5 space-y-2">
              <li>{ar
                ? "من داخل حسابك: افتح الإعدادات واطلب حذف الحساب — تُحذف كل بياناتك خلال 30 يوماً."
                : "From your account: open Settings and request account deletion — all your data is removed within 30 days."}</li>
              <li>{ar
                ? "عبر البريد: أرسل طلباً إلى admin@basmaweb.com من البريد المسجّل في حسابك، وسنؤكّد الحذف خلال 30 يوماً."
                : "By email: send a request to admin@basmaweb.com from your registered email, and we will confirm deletion within 30 days."}</li>
            </ol>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "ماذا يُحذف" : "What Gets Deleted"}</h2>
            <p>{ar
              ? "ملفك الشخصي، أرقام واتساب المربوطة، حسابات إنستغرام المربوطة، رسائلك، قواعد الأتمتة، وسجلّات النشاط. لا نحتفظ بأي بيانات بعد الحذف إلا ما يفرضه القانون."
              : "Your profile, linked WhatsApp numbers, linked Instagram accounts, your messages, automation rules, and activity logs. We retain no data after deletion except where required by law."}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "بيانات Meta / إنستغرام" : "Meta / Instagram Data"}</h2>
            <p>{ar
              ? "عند فصل حساب إنستغرام، نحذف رموز الوصول (tokens) وكل البيانات المرتبطة فوراً من خوادمنا."
              : "When you disconnect an Instagram account, we immediately delete the access tokens and all associated data from our servers."}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
