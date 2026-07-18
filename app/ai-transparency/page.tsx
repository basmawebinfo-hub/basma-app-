"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function AITransparencyPage() {
  const { lang } = useI18n()
  const ar = lang === "ar"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> {ar ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <h1 className="text-3xl font-bold mb-2">{ar ? "شفافية الذكاء الاصطناعي" : "AI Transparency"}</h1>
        <p className="text-sm text-muted-foreground mb-10">{ar ? "كيف نستخدم الذكاء الاصطناعي بشفافية" : "How we use AI responsibly"}</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "استخدام الذكاء الاصطناعي في BASMA AI" : "AI Usage in BASMA AI"}</h2>
            <p>{ar
              ? "BASMA AI يستخدم الذكاء الاصطناعي فقط في المجالات التالية المحددة:"
              : "BASMA AI uses AI only in these specific, defined areas:"}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "1. تحليل الرسائل" : "1. Message Analysis"}</h2>
            <ul className="space-y-2 ps-5">
              <li>• {ar ? "تصنيف نوع الرسالة (سؤال، شكوى، طلب)" : "Categorizing message type (question, complaint, request)"}</li>
              <li>• {ar ? "كشف المشاعر الأساسية (إيجابي، سلبي، محايد)" : "Basic sentiment detection (positive, negative, neutral)"}</li>
              <li>• {ar ? "تحديد أولويات الرسائل" : "Prioritizing messages"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "2. الردود الذكية" : "2. Intelligent Suggestions"}</h2>
            <ul className="space-y-2 ps-5">
              <li>• {ar ? "اقتراح نماذج ردود استناداً على محتوى الرسالة" : "Suggesting reply templates based on message content"}</li>
              <li>• {ar ? "جميع الردود البشرية تخضع لمراجعة وموافقة الإنسان قبل الإرسال" : "All AI suggestions are reviewed and approved by humans before sending"}</li>
              <li>• {ar ? "لا توجد ردود تلقائية 100% من الذكاء الاصطناعي" : "No 100% automated AI responses"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "3. الإحصائيات والتقارير" : "3. Analytics & Reports"}</h2>
            <ul className="space-y-2 ps-5">
              <li>• {ar ? "تحليل أنماط الرسائل والأوقات الذروة" : "Analyzing message patterns and peak hours"}</li>
              <li>• {ar ? "تحديد المواضيع الشائعة" : "Identifying trending topics"}</li>
              <li>• {ar ? "توقع حجم الرسائل المستقبلي" : "Predicting future message volume"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "التحكم والشفافية" : "Control & Transparency"}</h2>
            <ul className="space-y-2 ps-5">
              <li>• {ar ? "يمكنك تعطيل أي ميزة ذكاء اصطناعي من الإعدادات" : "You can disable any AI feature from settings"}</li>
              <li>• {ar ? "كل عملية ذكاء اصطناعي قابلة للتدقيق والمراجعة" : "Every AI operation is auditable and reviewable"}</li>
              <li>• {ar ? "لا يتم بيع بيانات الذكاء الاصطناعي لأطراف ثالثة" : "AI data is never sold to third parties"}</li>
              <li>• {ar ? "البيانات الشخصية لا تُستخدم لتدريب نماذج عامة" : "Your personal data is not used to train public models"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">{ar ? "الحد من التحيز" : "Bias Mitigation"}</h2>
            <p className="mb-3">{ar
              ? "نعمل على تقليل التحيزات المحتملة:"
              : "We work to reduce potential biases:"}</p>
            <ul className="space-y-2 ps-5">
              <li>• {ar ? "مراقبة دورية لتحديد التحيزات" : "Regular monitoring for bias detection"}</li>
              <li>• {ar ? "فريق متنوع يراجع النتائج" : "Diverse team reviewing outputs"}</li>
              <li>• {ar ? "إعادة تدريب النماذج عند الحاجة" : "Model retraining when necessary"}</li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs">{ar
              ? "للمزيد من المعلومات عن استخدام الذكاء الاصطناعي، تواصل معنا: ai@basmaweb.com"
              : "For more information about AI usage, contact: ai@basmaweb.com"}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
