"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function AccessibilityPage() {
  const { lang } = useI18n()
  const ar = lang === "ar"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> {ar ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <h1 className="text-3xl font-bold mb-2">{ar ? "إمكانية الوصول" : "Accessibility"}</h1>
        <p className="text-sm text-muted-foreground mb-10">{ar ? "التزامنا بسهولة الوصول للجميع" : "Our commitment to accessibility for all"}</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "معايير الامتثال" : "Compliance Standards"}</h2>
            <p>{ar
              ? "BASMA AI ملتزمة بمعايير ولتوجيهات الوصول للويب (WCAG) الإصدار 2.1 المستوى AA."
              : "BASMA AI is committed to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA."}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "ميزات الوصول" : "Accessibility Features"}</h2>
            <ul className="space-y-2 ps-5">
              <li>• <strong>{ar ? "قارئات الشاشة:" : "Screen Readers:"}</strong> {ar ? "الموقع متوافق مع NVDA و JAWS و VoiceOver" : "Compatible with NVDA, JAWS, and VoiceOver"}</li>
              <li>• <strong>{ar ? "لوحة المفاتيح:" : "Keyboard Navigation:"}</strong> {ar ? "التنقل الكامل عبر لوحة المفاتيح" : "Full keyboard navigation support"}</li>
              <li>• <strong>{ar ? "التباين:" : "Color Contrast:"}</strong> {ar ? "نسب تباين 4.5:1 أو أعلى" : "4.5:1 or higher contrast ratios"}</li>
              <li>• <strong>{ar ? "الخطوط:" : "Fonts:"}</strong> {ar ? "خطوط قابلة للقراءة وحجم قابل للتكبير" : "Readable fonts with resizable text"}</li>
              <li>• <strong>{ar ? "الوصف البديل:" : "Alt Text:"}</strong> {ar ? "وصف شامل للصور والرسوم" : "Comprehensive alt text for images and graphics"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "HTML الدلالي" : "Semantic HTML"}</h2>
            <ul className="space-y-2 ps-5">
              <li>• {ar ? "استخدام عناوين منطقية (H1, H2, H3)" : "Logical heading structure (H1, H2, H3)"}</li>
              <li>• {ar ? "تسميات النماذج المرتبطة بالحقول" : "Form labels properly associated with inputs"}</li>
              <li>• {ar ? "قوائم دلالية صحيحة" : "Proper semantic lists"}</li>
              <li>• {ar ? "عناصر nav و main و footer" : "Proper use of nav, main, and footer elements"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "الأجهزة والمتصفحات" : "Devices & Browsers"}</h2>
            <p className="mb-3">{ar
              ? "BASMA AI متوافقة مع:"
              : "BASMA AI is compatible with:"}</p>
            <ul className="space-y-1 ps-5 text-xs">
              <li>• {ar ? "أجهزة الكمبيوتر المكتبية والمحمولة والأجهزة اللوحية" : "Desktop, mobile, and tablet devices"}</li>
              <li>• {ar ? "جميع المتصفحات الحديثة (Chrome, Firefox, Safari, Edge)" : "All modern browsers (Chrome, Firefox, Safari, Edge)"}</li>
              <li>• {ar ? "أنظمة تشغيل الويب والهواتف الذكية" : "Web-based and mobile operating systems"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "الأداوات المساعدة" : "Assistive Tools"}</h2>
            <p>{ar
              ? "يدعم BASMA AI أدوات مثل:"
              : "BASMA AI supports tools such as:"}</p>
            <ul className="space-y-1 ps-5 text-xs mt-2">
              <li>• NVDA (النوافذ)</li>
              <li>• JAWS (النوافذ)</li>
              <li>• VoiceOver (Mac & iOS)</li>
              <li>• TalkBack (Android)</li>
              <li>• مكبّرات الشاشة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "التحسينات المستقبلية" : "Future Improvements"}</h2>
            <p>{ar
              ? "نعمل على تحسين الوصول بشكل مستمر. إذا واجهت مشكلة في الوصول، يرجى إخبارنا:"
              : "We continuously work on accessibility improvements. If you encounter any accessibility issues, please let us know:"}</p>
            <p className="mt-3"><a href="mailto:accessibility@basmaweb.com" className="text-primary hover:underline">accessibility@basmaweb.com</a></p>
          </section>

          <section className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs">{ar
              ? "آخر فحص تدقيق الوصول: يناير 2026"
              : "Last accessibility audit: January 2026"}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
