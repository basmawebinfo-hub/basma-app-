"use client"
import { useEffect, useState } from "react"
import { Send, Loader2, Copy, Check, RefreshCw, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n"

export default function LinkTelegramPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [code, setCode] = useState<string | null>(null)
  const [botLink, setBotLink] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  async function generate() {
    setGenerating(true)
    try {
      const r = await fetch("/api/telegram/link", { method: "POST" })
      const d = await r.json()
      setCode(d.code ?? null)
      setBotLink(d.bot_link ?? null)
      setSecondsLeft(120) // 2 minutes
    } finally { setGenerating(false) }
  }

  async function checkLinked() {
    setChecking(true)
    try {
      const r = await fetch("/api/telegram/link")
      const d = await r.json()
      if (d.linked) { router.push("/dashboard") } else { alert(t("tg.notLinked")) }
    } finally { setChecking(false) }
  }

  useEffect(() => { generate() }, [])

  // countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [secondsLeft])

  const expired = code !== null && secondsLeft <= 0
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0")
  const ss = String(secondsLeft % 60).padStart(2, "0")

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Send className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t("tg.title")}</h1>
        <p className="text-muted-foreground text-sm mb-6">{t("tg.desc")}</p>

        <div className="rounded-xl border border-border bg-card/40 p-5 text-start">
          {generating ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : code ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2">{t("tg.step1")}</p>
                <div className={"flex items-center gap-2 " + (expired ? "opacity-40" : "")}>
                  <code className="flex-1 px-3 py-2 rounded-md bg-muted/40 border border-border text-sm font-mono text-center">{code}</code>
                  <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) }} disabled={expired} className="p-2 rounded-md border border-border">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expired ? (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-600 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" /> {t("tg.expired")}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" /> {t("tg.validFor")} <span className="font-mono font-bold text-foreground">{mm}:{ss}</span>
                </div>
              )}

              <button onClick={generate} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/40">
                <RefreshCw className="w-4 h-4" /> {t("tg.newCode")}
              </button>

              {botLink && !expired && <a href={botLink} target="_blank" rel="noopener noreferrer" className="block w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">{t("tg.openBot")}</a>}

              <p className="text-xs text-muted-foreground">{t("tg.step2")}</p>
              <button onClick={checkLinked} disabled={checking} className="w-full py-2.5 rounded-lg border border-border text-sm font-medium disabled:opacity-50">
                {checking ? t("tg.checking") : t("tg.sentCheck")}
              </button>
            </div>
          ) : (
            <button onClick={generate} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">{t("tg.genCode")}</button>
          )}
        </div>
      </div>
    </div>
  )
}
