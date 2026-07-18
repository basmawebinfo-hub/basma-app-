"use client"
import Link from "next/link"
import { ArrowLeft, Mail, Clock, Globe } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  const { lang } = useI18n()
  const ar = lang === "ar"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> {ar ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{ar ? "اتصل بنا" : "Contact Us"}</h1>
        <p className="text-sm text-muted-foreground mb-10">{ar ? "نحن هنا للمساعدة" : "We're here to help"}</p>

        <div className="space-y-12">
          {/* Email Addresses */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-6">{ar ? "الاتصال" : "Contact Channels"}</h2>
            <div className="grid gap-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-start gap-3 mb-2">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">{ar ? "الدعم الفني" : "Technical Support"}</h3>
                    <a href="mailto:support@basmaweb.com" className="text-sm text-primary hover:underline">support@basmaweb.com</a>
                    <p className="text-xs text-muted-foreground mt-1">{ar ? "مساعدة فنية، حل المشاكل" : "Technical help, troubleshooting"}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-start gap-3 mb-2">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">{ar ? "الاستفسارات العامة" : "General Inquiries"}</h3>
                    <a href="mailto:info@basmaweb.com" className="text-sm text-primary hover:underline">info@basmaweb.com</a>
                    <p className="text-xs text-muted-foreground mt-1">{ar ? "عام، معلومات، شراكات" : "General, information, partnerships"}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-start gap-3 mb-2">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">{ar ? "الشؤون القانونية" : "Legal & Compliance"}</h3>
                    <a href="mailto:legal@basmaweb.com" className="text-sm text-primary hover:underline">legal@basmaweb.com</a>
                    <p className="text-xs text-muted-foreground mt-1">{ar ? "قانوني، خصوصية، امتثال" : "Legal, privacy, compliance"}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-start gap-3 mb-2">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">{ar ? "الأمان والإفصاح المسؤول" : "Security"}</h3>
                    <a href="mailto:security@basmaweb.com" className="text-sm text-primary hover:underline">security@basmaweb.com</a>
                    <p className="text-xs text-muted-foreground mt-1">{ar ? "إفصاح عن ثغرات أمنية" : "Security vulnerability disclosure"}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-start gap-3 mb-2">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">{ar ? "الخصوصية" : "Privacy"}</h3>
                    <a href="mailto:privacy@basmaweb.com" className="text-sm text-primary hover:underline">privacy@basmaweb.com</a>
                    <p className="text-xs text-muted-foreground mt-1">{ar ? "طلبات GDPR، حذف البيانات" : "GDPR requests, data deletion"}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Response Times */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {ar ? "أوقات الرد" : "Response Times"}
            </h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span>{ar ? "الدعم الفني (الأولوية)" : "Technical Support (Priority)"}</span>
                  <strong className="text-primary">{ar ? "24 ساعة" : "24 hours"}</strong>
                </li>
                <li className="flex justify-between">
                  <span>{ar ? "استفسارات عامة" : "General Inquiries"}</span>
                  <strong className="text-primary">{ar ? "48 ساعة" : "48 hours"}</strong>
                </li>
                <li className="flex justify-between">
                  <span>{ar ? "طلبات قانونية" : "Legal Requests"}</span>
                  <strong className="text-primary">{ar ? "5 أيام عمل" : "5 business days"}</strong>
                </li>
                <li className="flex justify-between">
                  <span>{ar ? "طلبات GDPR" : "GDPR Requests"}</span>
                  <strong className="text-primary">{ar ? "7 أيام" : "7 days"}</strong>
                </li>
              </ul>
            </div>
          </section>

          {/* Business Hours */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {ar ? "ساعات العمل" : "Business Hours"}
            </h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-4">
                {ar
                  ? "يمكنك التواصل معنا في أي وقت عبر البريد الإلكتروني. الدعم الفوري متاح خلال ساعات العمل."
                  : "You can contact us anytime via email. Live support is available during business hours."}
              </p>
              <ul className="space-y-2 text-sm">
                <li><strong>{ar ? "من الاثنين إلى الجمعة" : "Monday - Friday"}</strong>: 9:00 AM - 6:00 PM UTC</li>
                <li><strong>{ar ? "السبت والأحد" : "Saturday - Sunday"}</strong>: {ar ? "يوم عطلة (البريد متاح)" : "Closed (email available)"}</li>
              </ul>
            </div>
          </section>

          {/* FAQ Link */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{ar ? "هل تحتاج إجابات سريعة؟" : "Need Quick Answers?"}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {ar
                ? "تحقق من أسئلتنا الشائعة أو قراءة التوثيق."
                : "Check our FAQ or read the documentation."}
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="#faq">{ar ? "الأسئلة الشائعة" : "FAQ"}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/docs">{ar ? "التوثيق" : "Docs"}</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
