"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function CookiesPage() {
  const { lang } = useI18n()
  const ar = lang === "ar"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> {ar ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <h1 className="text-3xl font-bold mb-2">{ar ? "سياسة الكوكيز" : "Cookie Policy"}</h1>
        <p className="text-sm text-muted-foreground mb-10">{ar ? "آخر تحديث: يناير 2026" : "Last updated: January 2026"}</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "ما هي الكوكيز؟" : "What Are Cookies?"}</h2>
            <p>{ar
              ? "الكوكيز هي ملفات صغيرة يتم تخزينها على جهازك لتحسين تجربتك. نستخدمها لتتبع تفضيلاتك وتسجيل دخولك وتحسين الموقع."
              : "Cookies are small files stored on your device to enhance your experience. We use them to remember your preferences, keep you logged in, and improve the site."}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "أنواع الكوكيز" : "Types of Cookies"}</h2>
            <ul className="space-y-3 ps-5">
              <li>
                <strong>{ar ? "ضرورية:" : "Necessary:"}</strong>
                <p className="text-xs mt-1">{ar
                  ? "للمصادقة والأمان (session cookies). لا يمكن تعطيلها."
                  : "For authentication and security (session cookies). Cannot be disabled."}</p>
              </li>
              <li>
                <strong>{ar ? "التحليلات:" : "Analytics:"}</strong>
                <p className="text-xs mt-1">{ar
                  ? "لفهم كيفية استخدام الموقع (Vercel Analytics). يمكن تعطيلها."
                  : "To understand how users interact with the site. Can be disabled."}</p>
              </li>
              <li>
                <strong>{ar ? "التفضيلات:" : "Preferences:"}</strong>
                <p className="text-xs mt-1">{ar
                  ? "لحفظ اختياراتك (اللغة، المظهر). يمكن تعطيلها."
                  : "To save your choices (language, theme). Can be disabled."}</p>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "التحكم في الكوكيز" : "Managing Cookies"}</h2>
            <p className="mb-3">{ar
              ? "يمكنك التحكم في الكوكيز من خلال إعدادات متصفحك:"
              : "You can control cookies through your browser settings:"}</p>
            <ul className="list-disc ps-5 space-y-1 text-xs">
              <li>{ar ? "Chrome:" : "Chrome:"} Settings → Privacy and security → Cookies and other site data</li>
              <li>{ar ? "Firefox:" : "Firefox:"} Preferences → Privacy & Security → Cookies and Site Data</li>
              <li>{ar ? "Safari:" : "Safari:"} Preferences → Privacy → Manage Website Data</li>
              <li>{ar ? "Edge:" : "Edge:"} Settings → Privacy → Cookies and other site permissions</li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs">{ar
              ? "للمزيد من المعلومات أو لديك أسئلة، تواصل معنا: privacy@basmaweb.com"
              : "For more information or questions, contact us: privacy@basmaweb.com"}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
