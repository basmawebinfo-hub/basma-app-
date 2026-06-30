"use client"
import { useState } from "react"
import { Copy, Check, Webhook, Send, KeyRound, MessageSquare, Users, Eye } from "lucide-react"

// ── reusable code block with copy ──
function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group my-3">
      <pre className="bg-black/60 border border-border rounded-lg p-4 text-[11px] overflow-x-auto font-mono leading-relaxed text-foreground whitespace-pre">{children}</pre>
      <button onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-card border border-border opacity-0 group-hover:opacity-100 transition">
        {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

function Method({ m }: { m: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    POST: "bg-primary/15 text-primary border-primary/30",
    PUT: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
  }
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${colors[m] ?? "bg-muted"}`}>{m}</span>
}

function CodeTabs({ curl, js, py }: { curl: string; js: string; py: string }) {
  const [tab, setTab] = useState<"curl" | "js" | "py">("curl")
  const map = { curl, js, py }
  const labels = { curl: "cURL", js: "JavaScript", py: "Python" }
  return (
    <div className="mt-3">
      <div className="flex gap-1 mb-1">
        {(["curl", "js", "py"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-3 py-1 text-[11px] rounded-t-md font-semibold transition ${tab === k ? "bg-black/60 text-primary border-b-2 border-primary" : "bg-muted/30 text-muted-foreground"}`}>
            {labels[k]}
          </button>
        ))}
      </div>
      <CodeBlock>{map[tab]}</CodeBlock>
    </div>
  )
}

function Endpoint({ id, method, path, title, desc, body, resp, examples }: {
  id: string; method: string; path: string; title: string; desc: string; body?: string; resp?: string
  examples?: { curl: string; js: string; py: string }
}) {
  return (
    <div id={id} className="scroll-mt-20 border-b border-border py-6">
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Method m={method} />
        <code className="text-xs font-mono text-muted-foreground bg-muted/40 px-2 py-1 rounded">{path}</code>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{desc}</p>
      {body && (<><div className="text-[11px] font-semibold text-foreground mt-3">Request Body:</div><CodeBlock>{body}</CodeBlock></>)}
      {examples && (<><div className="text-[11px] font-semibold text-foreground mt-3">أمثلة الكود:</div><CodeTabs curl={examples.curl} js={examples.js} py={examples.py} /></>)}
      {resp && (<><div className="text-[11px] font-semibold text-foreground mt-3">Response:</div><CodeBlock>{resp}</CodeBlock></>)}
    </div>
  )
}

const SECTIONS = [
  { h: "البداية", items: [["intro", "مقدمة"], ["auth", "المصادقة"]] },
  { h: "إرسال الرسائل", items: [["send-text", "إرسال نص"], ["send-image", "إرسال صورة"], ["send-video", "إرسال فيديو"], ["send-doc", "إرسال مستند"], ["send-audio", "إرسال صوت"], ["send-sticker", "إرسال ملصق"], ["send-location", "إرسال موقع"], ["send-contact", "إرسال جهة اتصال"], ["send-poll", "إرسال تصويت"]] },
  { h: "الجودة", items: [["typing", "جاري الكتابة"], ["mark-read", "تحديد كمقروء"]] },
  { h: "بيانات", items: [["me", "معلومات الحساب"], ["contacts", "جهات الاتصال"], ["groups", "المجموعات"]] },
  { h: "الاستقبال", items: [["webhook", "Webhook (الرسائل الواردة)"]] },
]

export default function DocsPage() {
  const [active, setActive] = useState("intro")
  const base = "https://www.basmaweb.com"
  return (
    <div className="flex gap-6 p-6 max-w-6xl mx-auto">
      {/* Sidebar */}
      <aside className="hidden md:block w-56 shrink-0 sticky top-6 self-start max-h-[85vh] overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-foreground">API Documentation</h2>
          <p className="text-[11px] text-muted-foreground">BASMA WhatsApp API</p>
        </div>
        {SECTIONS.map((s) => (
          <div key={s.h} className="mb-4">
            <div className="text-[11px] font-bold text-muted-foreground uppercase mb-1">{s.h}</div>
            {s.items.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => setActive(id)}
                className={`block text-xs py-1 px-2 rounded transition ${active === id ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
                {label}
              </a>
            ))}
          </div>
        ))}
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold mb-2">توثيق واجهة برمجة تطبيقات BASMA</h1>
        <p className="text-muted-foreground mb-8 text-sm">ابدأ الدمج مع BASMA في دقائق — أرسل رسائل واتساب، استقبل الأحداث، وأتمت أعمالك.</p>

        <section id="intro" className="scroll-mt-20 mb-6">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> مقدمة</h2>
          <p className="text-sm text-muted-foreground">تتيح BASMA API إرسال واستقبال رسائل واتساب بكل أنواعها (نص، صورة، فيديو، صوت، مستند، ملصق، موقع، جهة اتصال، تصويت) وأتمتة التفاعلات. كل الطلبات عبر HTTPS وتُرجع JSON.</p>
        </section>

        <section id="auth" className="scroll-mt-20 mb-8 rounded-xl border border-border bg-card p-5">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /> المصادقة</h2>
          <p className="text-sm text-muted-foreground mb-2">احصل على مفتاح API من <b>الإعدادات → API Key</b> (يبدأ بـ <code className="font-mono text-primary">bsm_live_</code>). أرسله في ترويسة كل طلب:</p>
          <CodeBlock>{`Authorization: Bearer bsm_live_xxxxxxxxxxxx`}</CodeBlock>
          <p className="text-[11px] text-muted-foreground">Base URL: <code className="font-mono text-primary">{base}</code></p>
        </section>

        <h2 className="text-xl font-bold mb-2 mt-8 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> إرسال الرسائل</h2>

        <Endpoint id="send-text" method="POST" path="/api/send" title="إرسال رسالة نصية"
          desc="يرسل رسالة نصية لرقم واتساب."
          body={`{
  "to": "201234567890",
  "type": "text",
  "text": "مرحباً من بصمة"
}`}
          examples={{
            curl: `curl -X POST https://www.basmaweb.com/api/send \\
  -H "Authorization: Bearer bsm_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"to":"201234567890","type":"text","text":"مرحباً"}'`,
            js: `const res = await fetch("https://www.basmaweb.com/api/send", {
  method: "POST",
  headers: {
    "Authorization": "Bearer bsm_live_xxxx",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ to: "201234567890", type: "text", text: "مرحباً" }),
});
const data = await res.json();`,
            py: `import requests
res = requests.post(
    "https://www.basmaweb.com/api/send",
    headers={"Authorization": "Bearer bsm_live_xxxx"},
    json={"to": "201234567890", "type": "text", "text": "مرحباً"},
)
print(res.json())`
          }}
          resp={`{ "ok": true, "result": { "key": { "id": "..." }, "status": "PENDING" } }`} />

        <Endpoint id="send-image" method="POST" path="/api/send" title="إرسال صورة"
          desc="يرسل صورة عبر رابط أو base64 مع caption اختياري."
          body={`{
  "to": "201234567890",
  "type": "image",
  "media": "https://.../image.jpg",
  "caption": "وصف الصورة"
}`} />

        <Endpoint id="send-video" method="POST" path="/api/send" title="إرسال فيديو"
          desc="يرسل فيديو عبر رابط أو base64 مع caption اختياري."
          body={`{
  "to": "201234567890",
  "type": "video",
  "media": "https://.../video.mp4",
  "caption": "وصف الفيديو"
}`} />

        <Endpoint id="send-doc" method="POST" path="/api/send" title="إرسال مستند"
          desc="يرسل مستند (PDF, Word...) مع اسم ملف اختياري."
          body={`{
  "to": "201234567890",
  "type": "document",
  "media": "https://.../file.pdf",
  "fileName": "تقرير.pdf"
}`} />

        <Endpoint id="send-audio" method="POST" path="/api/send" title="إرسال رسالة صوتية"
          desc="يرسل ملف صوتي عبر رابط أو base64."
          body={`{
  "to": "201234567890",
  "type": "audio",
  "media": "https://.../audio.mp3"
}`} />

        <Endpoint id="send-sticker" method="POST" path="/api/send" title="إرسال ملصق"
          desc="يرسل ملصق (webp)."
          body={`{
  "to": "201234567890",
  "type": "sticker",
  "media": "https://.../sticker.webp"
}`} />

        <Endpoint id="send-location" method="POST" path="/api/send" title="إرسال موقع"
          desc="يرسل موقع جغرافي (إحداثيات)."
          body={`{
  "to": "201234567890",
  "type": "location",
  "latitude": 30.0444,
  "longitude": 31.2357,
  "name": "القاهرة",
  "address": "مصر"
}`} />

        <Endpoint id="send-contact" method="POST" path="/api/send" title="إرسال جهة اتصال"
          desc="يرسل بطاقة جهة اتصال."
          body={`{
  "to": "201234567890",
  "type": "contact",
  "contact": { "fullName": "أحمد", "phoneNumber": "201111111111" }
}`} />

        <Endpoint id="send-poll" method="POST" path="/api/send" title="إرسال تصويت"
          desc="يرسل استطلاع رأي بخيارات متعددة."
          body={`{
  "to": "201234567890",
  "type": "poll",
  "question": "أنهي باقة تفضل؟",
  "options": ["3 أرقام", "8 أرقام", "13 رقم"],
  "selectableCount": 1
}`} />

        <h2 className="text-xl font-bold mb-2 mt-8 flex items-center gap-2"><Eye className="w-5 h-5 text-primary" /> الجودة (Anti-ban)</h2>

        <Endpoint id="typing" method="POST" path="/api/presence" title="جاري الكتابة"
          desc="يُظهر 'جاري الكتابة...' للعميل قبل الرد (يحاكي البشر ويقلل الحظر)."
          body={`{
  "to": "201234567890",
  "presence": "composing",
  "delay": 3000
}`} />

        <Endpoint id="mark-read" method="POST" path="/api/mark-read" title="تحديد كمقروء"
          desc="يحدّد رسالة واردة كمقروءة (الصح الأزرق)."
          body={`{
  "to": "201234567890",
  "messageId": "ABC123..."
}`} />

        <h2 className="text-xl font-bold mb-2 mt-8 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> بيانات</h2>

        <Endpoint id="me" method="GET" path="/api/me" title="معلومات الحساب"
          desc="يرجّع معلومات الحساب والرقم المتصل." />

        <Endpoint id="contacts" method="GET" path="/api/contacts" title="جهات الاتصال"
          desc="يرجّع قائمة جهات الاتصال المتزامنة." />

        <Endpoint id="groups" method="GET" path="/api/groups" title="المجموعات"
          desc="يرجّع قائمة المجموعات التي ينتمي إليها الرقم." />

        <Endpoint id="participants" method="GET" path="/api/groups/participants" title="أعضاء المجموعة"
          desc="يرجّع قائمة أعضاء مجموعة معيّنة (GET)، أو يضيف/يحذف أعضاء (POST)." />

        <Endpoint id="media" method="POST" path="/api/media" title="رفع ملف وسائط"
          desc="يرفع ملف (صورة/فيديو/مستند) ويرجّع رابطاً تستخدمه في الإرسال."
          body={`{
  "file": "<base64 أو رابط>",
  "fileName": "image.jpg"
}`} />

        <h2 className="text-xl font-bold mb-2 mt-8 flex items-center gap-2"><Webhook className="w-5 h-5 text-primary" /> استقبال الرسائل (Webhook)</h2>

        <div id="webhook" className="scroll-mt-20 border-b border-border py-6">
          <h3 className="text-base font-bold text-foreground mb-1">استقبال الأحداث الواردة</h3>
          <p className="text-sm text-muted-foreground mb-2">اذهب إلى صفحة <b>Webhooks</b>، أضف رابط منصتك (n8n / Make / Zapier)، واختر الأحداث. سترسل BASMA كل رسالة واردة فوراً إلى الرابط بصيغة JSON:</p>
          <CodeBlock>{`{
  "event": "MESSAGE_RECEIVED",
  "data": {
    "key": { "remoteJid": "201234567890@s.whatsapp.net", "fromMe": false, "id": "..." },
    "message": { "conversation": "نص الرسالة" },
    "pushName": "اسم العميل"
  }
}`}</CodeBlock>
          <p className="text-[11px] text-muted-foreground">في n8n استخدم <b>BASMA Trigger</b> — يطلّع حقول نظيفة: <code className="font-mono text-primary">from, text, pushName, messageType, mediaBase64, messageId</code></p>
        </div>
      </main>
    </div>
  )
}
