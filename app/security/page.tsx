"use client"
import Link from "next/link"
import { ArrowLeft, Shield, Lock, Server, AlertCircle, FileText } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function SecurityPage() {
  const { lang } = useI18n()
  const ar = lang === "ar"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> {ar ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{ar ? "الأمان" : "Security"}</h1>
        <p className="text-sm text-muted-foreground mb-10">{ar ? "كيف نحمي بيانات عملاؤنا" : "How we protect your data"}</p>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{ar ? "التشفير" : "Encryption"}</h2>
            </div>
            <ul className="space-y-2 ps-5">
              <li>• <strong>TLS 1.3+:</strong> {ar ? "جميع الاتصالات محمية بـ TLS 1.3 أو أحدث" : "All connections are protected with TLS 1.3 or higher"}</li>
              <li>• <strong>AES-256:</strong> {ar ? "البيانات المخزنة مشفرة باستخدام AES-256" : "Stored data is encrypted with AES-256"}</li>
              <li>• <strong>HMAC-SHA256:</strong> {ar ? "توقيع الـ Webhooks آمن" : "Webhook payloads are signed with HMAC-SHA256"}</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{ar ? "البنية التحتية" : "Infrastructure"}</h2>
            </div>
            <ul className="space-y-2 ps-5">
              <li>• <strong>{ar ? "مزود الخدمة:" : "Hosting:"}</strong> Vercel & Neon (مزودات موثوقة enterprise-grade / enterprise-grade providers)</li>
              <li>• <strong>{ar ? "الفعالية الجغرافية:" : "Geographic Redundancy:"}</strong> {ar ? "خوادم موزعة عالمياً للموثوقية" : "Servers distributed globally for reliability"}</li>
              <li>• <strong>DDoS Protection:</strong> {ar ? "حماية Cloudflare ضد هجمات DDoS" : "Protected by Cloudflare's DDoS mitigation"}</li>
              <li>• <strong>{ar ? "النسخ الاحتياطية:" : "Backups:"}</strong> {ar ? "نسخ احتياطية يومية مع استرجاع فوري" : "Daily automated backups with instant recovery"}</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{ar ? "المراقبة والأمان" : "Monitoring & Security"}</h2>
            </div>
            <ul className="space-y-2 ps-5">
              <li>• <strong>{ar ? "المراقبة 24/7:" : "24/7 Monitoring:"}</strong> {ar ? "رصد مستمر للأمان والأداء" : "Continuous security and performance monitoring"}</li>
              <li>• <strong>{ar ? "التصحيحات:" : "Patching:"}</strong> {ar ? "تحديثات أمنية فورية" : "Immediate security patches"}</li>
              <li>• <strong>Firewalls:</strong> {ar ? "جدران حماية طبقات متعددة" : "Multi-layer firewalls"}</li>
              <li>• <strong>WAF:</strong> {ar ? "جدار تطبيقات ويب لحماية من هجمات الويب الشائعة" : "Web Application Firewall protects against common web attacks"}</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{ar ? "الإفصاح المسؤول" : "Responsible Disclosure"}</h2>
            </div>
            <p className="mb-3">{ar
              ? "إذا اكتشفت ثغرة أمنية، يرجى عدم نشرها علناً. بدلاً من ذلك:"
              : "If you discover a security vulnerability, please do not publicly disclose it. Instead:"}</p>
            <ol className="space-y-2 ps-5 list-decimal">
              <li>{ar ? "تواصل معنا عبر: security@basmaweb.com" : "Contact us at: security@basmaweb.com"}</li>
              <li>{ar ? "اشرح الثغرة بالتفصيل" : "Describe the vulnerability in detail"}</li>
              <li>{ar ? "امنحنا وقت معقول (عادة 90 يوم) لإصلاحها" : "Allow us reasonable time (typically 90 days) to fix it"}</li>
              <li>{ar ? "سننسب الفضل لك عند الإصلاح إذا أردت" : "We will credit you when we fix it, if you wish"}</li>
            </ol>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{ar ? "سياسات الامتثال" : "Compliance Policies"}</h2>
            </div>
            <ul className="space-y-2 ps-5">
              <li>• <strong>GDPR:</strong> {ar ? "الامتثال الكامل بقانون الحماية العام للبيانات" : "Full compliance with General Data Protection Regulation"}</li>
              <li>• <strong>CCPA:</strong> {ar ? "الامتثال لقانون خصوصية المستهلك الكاليفورني" : "Compliance with California Consumer Privacy Act"}</li>
              <li>• <strong>{ar ? "حماية البيانات:" : "Data Processing:"}</strong> {ar ? "اتفاقيات معالجة البيانات DPA متاحة" : "Data Processing Agreements (DPA) available"}</li>
              <li>• <strong>ROI/DPA: </strong> {ar ? "توقيع DPA مع جميع العملاء" : "DPA signed with enterprise customers"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{ar ? "إدارة الحوادث" : "Incident Response"}</h2>
            <p className="mb-3">{ar
              ? "في حالة حدوث حادثة أمنية:"
              : "In the event of a security incident:"}</p>
            <ol className="space-y-2 ps-5 list-decimal">
              <li>{ar ? "سنتحقق من سبب الحادثة فوراً" : "We immediately investigate the incident"}</li>
              <li>{ar ? "سنعزل النظام المتأثر" : "We isolate affected systems"}</li>
              <li>{ar ? "سنخطرك خلال 24 ساعة" : "We notify you within 24 hours"}</li>
              <li>{ar ? "سنوفر خطة استرجاع ورد فعل شاملة" : "We provide a comprehensive recovery and response plan"}</li>
            </ol>
          </section>

          <section className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">{ar
              ? "للمزيد من المعلومات الأمنية، تواصل معنا عبر: security@basmaweb.com"
              : "For more security information, contact us at: security@basmaweb.com"}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
