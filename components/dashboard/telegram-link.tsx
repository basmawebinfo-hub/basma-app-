"use client"
import { useEffect, useState } from "react"
import { Send, Check, Loader2, Copy } from "lucide-react"

interface TgStatus { linked: boolean; linked_at: string | null }

export function TelegramLink() {
  const [status, setStatus] = useState<TgStatus | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [botLink, setBotLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const load = () => fetch("/api/telegram/link").then((r) => r.json()).then(setStatus).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  async function generate() {
    setGenerating(true)
    try {
      const r = await fetch("/api/telegram/link", { method: "POST" })
      const d = await r.json()
      setCode(d.code ?? null)
      setBotLink(d.bot_link ?? null)
    } finally { setGenerating(false) }
  }

  if (loading) return <div className="py-6"><Loader2 className="w-5 h-5 animate-spin" /></div>

  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <Send className="w-4 h-4 text-primary" />
        <h2 className="text-base font-semibold">Telegram Notifications</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Link your Telegram to receive alerts (subscription reminders, admin messages).</p>

      {status?.linked ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <div>
            <div className="text-sm font-medium">Telegram connected</div>
            <div className="text-xs text-muted-foreground">You will receive alerts on Telegram.</div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card/40 p-4">
          {!code ? (
            <button onClick={generate} disabled={generating} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
              {generating ? "Generating..." : "Generate link code"}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">1. Open our Telegram bot and send this code:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-md bg-muted/40 border border-border text-sm font-mono">{code}</code>
                <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="p-2 rounded-md border border-border">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {botLink && <a href={botLink} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Open Telegram bot</a>}
              <p className="text-xs text-muted-foreground">2. After sending the code, your Telegram will be linked automatically.</p>
              <button onClick={load} className="text-xs text-primary hover:underline">I have sent it — refresh status</button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
