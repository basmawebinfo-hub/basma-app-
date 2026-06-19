"use client"
import { useEffect, useState } from "react"
import { Send, Check, Loader2, Copy } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LinkTelegramPage() {
  const router = useRouter()
  const [code, setCode] = useState<string | null>(null)
  const [botLink, setBotLink] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)

  async function generate() {
    setGenerating(true)
    try {
      const r = await fetch("/api/telegram/link", { method: "POST" })
      const d = await r.json()
      setCode(d.code ?? null)
      setBotLink(d.bot_link ?? null)
    } finally { setGenerating(false) }
  }

  async function checkLinked() {
    setChecking(true)
    try {
      const r = await fetch("/api/telegram/link")
      const d = await r.json()
      if (d.linked) { router.push("/dashboard") } else { alert("لم يتم الربط بعد. تأكد من إرسال الكود للبوت ثم حاول مجدداً.") }
    } finally { setChecking(false) }
  }

  useEffect(() => { generate() }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Send className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">اربط تليجرام للمتابعة</h1>
        <p className="text-muted-foreground text-sm mb-6">لاستخدام المنصة، يجب ربط حسابك بتليجرام لاستقبال تفاصيل اشتراكك ورصيدك وكل ما يخص حسابك.</p>

        <div className="rounded-xl border border-border bg-card/40 p-5 text-right">
          {generating ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : code ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2">1. افتح بوت تليجرام وأرسل هذا الكود:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-md bg-muted/40 border border-border text-sm font-mono text-center">{code}</code>
                  <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="p-2 rounded-md border border-border">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {botLink && <a href={botLink} target="_blank" rel="noopener noreferrer" className="block w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">افتح بوت تليجرام</a>}
              <p className="text-xs text-muted-foreground">2. بعد إرسال الكود، اضغط الزر بالأسفل.</p>
              <button onClick={checkLinked} disabled={checking} className="w-full py-2.5 rounded-lg border border-border text-sm font-medium disabled:opacity-50">
                {checking ? "جاري التحقق..." : "لقد أرسلت الكود — تحقق الآن"}
              </button>
            </div>
          ) : (
            <button onClick={generate} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">إنشاء كود الربط</button>
          )}
        </div>
      </div>
    </div>
  )
}
