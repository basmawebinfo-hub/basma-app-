"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function AboutPage() {
  const { lang } = useI18n()
  const ar = lang === "ar"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> {ar ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{ar ? "عن BASMA AI" : "About BASMA AI"}</h1>
        <p className="text-sm text-muted-foreground mb-10">{ar ? "آخر تحديث: يناير 2026" : "Last updated: January 2026"}</p>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "من نحن" : "Who We Are"}</h2>
            <p>{ar
              ? "BASMA AI هي منصة برمجيات سحابية تساعد الشركات على أتمتة سير العمل، تنظيم التواصل مع العملاء، وتحسين الكفاءة التشغيلية باستخدام الذكاء الاصطناعي."
              : "BASMA AI is a cloud-based software platform that helps businesses automate workflows, organize customer communications, and improve operational efficiency using artificial intelligence."}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "ماذا نفعل" : "What We Do"}</h2>
            <p className="mb-3">{ar
              ? "نوفر حلاً متكاملاً يسمح للشركات بـ:"
              : "We provide an integrated solution that enables businesses to:"}</p>
            <ul className="space-y-2 ps-5">
              <li>• {ar ? "ربط WhatsApp وتنظيم المحادثات" : "Connect WhatsApp and organize conversations"}</li>
              <li>• {ar ? "أتمتة الرسائل والإجابات الذكية" : "Automate messaging and intelligent responses"}</li>
              <li>• {ar ? "التكامل مع أدوات الأتمتة مثل n8n و Zapier و Make" : "Integrate with automation tools like n8n, Zapier, and Make"}</li>
              <li>• {ar ? "مراقبة أداء التواصل عبر لوحة إحصائيات شاملة" : "Monitor communication performance via comprehensive analytics"}</li>
              <li>• {ar ? "تحسين استجابة العملاء وإدارة العلاقات" : "Improve customer response and relationship management"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "رؤيتنا" : "Our Vision"}</h2>
            <p>{ar
              ? "نسعى لتمكين كل شركة بأدوات أتمتة قوية وسهلة الاستخدام، بغض النظر عن حجمها أو مجال عملها. هدفنا تحرير فرق العمل من المهام المتكررة والرتيبة ليركزوا على ما يحقق قيمة حقيقية."
              : "We aim to empower every business with powerful, easy-to-use automation tools, regardless of size or industry. Our goal is to free teams from repetitive tasks so they can focus on what truly matters."}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "التزامنا" : "Our Commitment"}</h2>
            <ul className="space-y-2 ps-5">
              <li>• <strong>{ar ? "الأمان:" : "Security:"}</strong> {ar ? "بيانات عملاؤنا مشفرة ومحمية بأعلى معايير الصناعة" : "Our customers' data is encrypted and protected to the highest industry standards"}</li>
              <li>• <strong>{ar ? "الشفافية:" : "Transparency:"}</strong> {ar ? "نحن صريحون بشأن كيفية استخدامنا للبيانات وكيف يعمل نظامنا" : "We are transparent about how we use data and how our system operates"}</li>
              <li>• <strong>{ar ? "الموثوقية:" : "Reliability:"}</strong> {ar ? "التزام بتوفير خدمة مستقرة وسريسة 24/7" : "Commitment to providing a stable, fast service 24/7"}</li>
              <li>• <strong>{ar ? "الامتثال:" : "Compliance:"}</strong> {ar ? "الامتثال التام لقوانين الخصوصية والحماية GDPR و CCPA" : "Full compliance with privacy and protection laws including GDPR and CCPA"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "المعلومات القانونية" : "Legal Information"}</h2>
            <ul className="space-y-2">
              <li><strong>{ar ? "اسم الشركة:" : "Company Name:"}</strong> BASMA AI Inc.</li>
              <li><strong>{ar ? "البريد:" : "Email:"}</strong> <a href="mailto:info@basmaweb.com" className="text-primary hover:underline">info@basmaweb.com</a></li>
              <li><strong>{ar ? "الموقع:" : "Website:"}</strong> <a href="https://basmaweb.com" className="text-primary hover:underline">basmaweb.com</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "تواصل معنا" : "Get in Touch"}</h2>
            <p>{ar
              ? "هل لديك أسئلة أو استفسارات؟ نحن هنا للمساعدة. تواصل معنا عبر:"
              : "Have questions or feedback? We'd love to hear from you. Reach out at:"}</p>
            <ul className="mt-3 space-y-1">
              <li><a href="mailto:support@basmaweb.com" className="text-primary hover:underline">support@basmaweb.com</a></li>
              <li><a href="mailto:info@basmaweb.com" className="text-primary hover:underline">info@basmaweb.com</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
