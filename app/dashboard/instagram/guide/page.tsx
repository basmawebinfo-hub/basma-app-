"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function InstagramGuidePage() {
  const steps = [
    { t: "أنشئ حساب على Make", d: "روح make.com واعمل حساب مجاني (الباقة المجانية كافية للبداية)." },
    { t: "أنشئ Scenario جديد", d: "من Make اضغط Create a new scenario." },
    { t: "أضف Instagram كـ Trigger", d: "اختر Instagram for Business، ثم 'Watch Comments' (لمراقبة التعليقات) أو 'Watch Messages'. سجّل دخول واربط حساب إنستغرام بتاعك بـ Make." },
    { t: "أضف HTTP Request", d: "بعد الـ Trigger، أضف module اسمه HTTP > Make a request. اضبطه: Method = POST، URL = الـ Webhook URL من صفحة الأتمتة في بصمة، Body type = JSON." },
    { t: "اضبط الـ Body", d: 'في الـ body ابعت: { "secret": "(الـ Secret من بصمة)", "type": "comment", "text": "(نص التعليق من الـ trigger)", "from_username": "(اسم المستخدم)" }' },
    { t: "أضف رد على إنستغرام", d: "بعد الـ HTTP، أضف Instagram module: 'Reply to Comment' و/أو 'Send Message'. استخدم القيم اللي رجّعتها بصمة (reply_comment و reply_dm) في الرد." },
    { t: "فعّل الـ Scenario", d: "اضغط ON وخليه يشتغل تلقائياً. خلاص! من دلوقتي تدير كل القواعد من بصمة." },
  ]
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/dashboard/instagram" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> رجوع لأتمتة إنستغرام</Link>
      <h1 className="text-2xl font-bold mb-2">دليل ربط إنستغرام عبر Make</h1>
      <p className="text-sm text-muted-foreground mb-8">إعداد لمرة واحدة فقط. بعده، كل القواعد والردود تتحكم فيها من بصمة مباشرة.</p>
      <div className="space-y-4">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-4 rounded-xl border border-border bg-card/40 p-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">{s.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">ملاحظة: تحتاج حساب إنستغرام Business مربوط بصفحة فيسبوك. الربط يتم عبر Make (المعتمد من Meta)، فلا تحتاج أي توثيق على بصمة.</p>
      </div>
    </div>
  )
}
