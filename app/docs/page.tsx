"use client"
import Link from "next/link"
import { ArrowLeft, Send, Webhook, KeyRound, Zap } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function DocsPage() {
  const { lang } = useI18n()
  const ar = lang === "ar"
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> {ar ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <h1 className="text-3xl font-bold mb-2">{ar ? "دليل المطوّر" : "Developer Docs"}</h1>
        <p className="text-sm text-muted-foreground mb-10">{ar ? "كل ما تحتاجه لربط بصمة بأدوات الأتمتة." : "Everything you need to connect Basma to your automation tools."}</p>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card/40 p-5">
            <div className="flex items-center gap-2 mb-2"><Send className="w-4 h-4 text-primary" /><h2 className="font-semibold">{ar ? "إرسال رسالة" : "Send a message"}</h2></div>
            <p className="text-sm text-muted-foreground mb-3">{ar ? "أرسل POST إلى نقطة الإرسال مع مفتاح الـ API الخاص بك:" : "Send a POST request to the send endpoint with your API key:"}</p>
            <pre className="bg-muted/40 border border-border rounded-lg p-3 text-xs overflow-x-auto text-left" dir="ltr"><code>{`POST https://www.basmaweb.com/api/send
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "to": "201234567890",
  "text": "Hello from BASMA"
}`}</code></pre>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-5">
            <div className="flex items-center gap-2 mb-2"><Webhook className="w-4 h-4 text-primary" /><h2 className="font-semibold">{ar ? "استقبال الرسائل (Webhook)" : "Receive messages (Webhook)"}</h2></div>
            <p className="text-sm text-muted-foreground">{ar ? "أي رسالة واردة تُرسل تلقائياً إلى رابط الـ webhook الذي تحدّده في صفحة Webhooks، بصيغة JSON تحتوي على نص الرسالة ورقم المرسل واسمه." : "Every incoming message is automatically forwarded to the webhook URL you set on the Webhooks page, as JSON containing the message text, sender number, and name."}</p>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-5">
            <div className="flex items-center gap-2 mb-2"><KeyRound className="w-4 h-4 text-primary" /><h2 className="font-semibold">{ar ? "المصادقة" : "Authentication"}</h2></div>
            <p className="text-sm text-muted-foreground">{ar ? "كل طلبات الـ API محمية بمفتاح API. أنشئ مفتاحك من صفحة الإعدادات، وأرسله في ترويسة Authorization." : "All API requests are protected by an API key. Generate yours from the Settings page and send it in the Authorization header."}</p>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-5">
            <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-primary" /><h2 className="font-semibold">{ar ? "الربط مع n8n / Zapier / Make" : "Connect to n8n / Zapier / Make"}</h2></div>
            <p className="text-sm text-muted-foreground">{ar ? "استخدم رابط الـ webhook لاستقبال الرسائل في أداة الأتمتة، واستخدم نقطة /api/send لإرسال الردود. بهذا تبني بوت رد تلقائي كامل بدون كود." : "Use the webhook URL to receive messages in your automation tool, and the /api/send endpoint to send replies. This lets you build a full auto-reply bot with no code."}</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            {ar ? "ابدأ مجاناً" : "Get Started Free"}
          </Link>
        </div>
      </div>
    </div>
  )
}
