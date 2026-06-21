"use client"
import { useEffect, useRef, useState } from "react"
import { Loader2, Send, MessageCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface Convo { chat_id: string; user_id: string | null; name: string; avatar_url: string | null; last_body: string; last_at: string; unread: number }
interface Msg { direction: string; body: string; created_at: string }
interface Customer { name: string; email: string | null; avatar_url: string | null }

function Avatar({ name, url, size = 9 }: { name: string; url: string | null; size?: number }) {
  const cls = `w-${size} h-${size}`
  if (url) return <img src={url} alt={name} className={`${cls} rounded-full object-cover shrink-0`} />
  return <div className={`${cls} rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0`}>{(name || "?").slice(0, 2).toUpperCase()}</div>
}

export default function SupportPage() {
  const { t } = useI18n()
  const [convos, setConvos] = useState<Convo[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const loadConvos = () => fetch("/api/admin/support").then((r) => r.json()).then((d) => setConvos(d.conversations ?? [])).finally(() => setLoading(false))
  useEffect(() => { loadConvos(); const tm = setInterval(loadConvos, 15000); return () => clearInterval(tm) }, [])

  function openChat(chatId: string) {
    setActive(chatId)
    fetch("/api/admin/support?chat_id=" + chatId).then((r) => r.json()).then((d) => { setMsgs(d.messages ?? []); setActiveCustomer(d.customer ?? null); loadConvos() })
  }

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs])

  async function send() {
    if (!reply.trim() || !active) return
    setSending(true)
    try {
      const r = await fetch("/api/admin/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: active, body: reply }) })
      const d = await r.json()
      if (!d.delivered) alert(t("sup.notDelivered"))
      setReply("")
      openChat(active)
    } finally { setSending(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{t("sup.title")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
        {/* Conversations list */}
        <div className="rounded-xl border border-border overflow-y-auto">
          {convos.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">{t("sup.noConvos")}</div>
          ) : convos.map((c) => (
            <button key={c.chat_id} onClick={() => openChat(c.chat_id)} className={"w-full text-start p-3 border-b border-border/40 hover:bg-card/40 flex items-center gap-3 " + (active === c.chat_id ? "bg-card/60" : "")}>
              <Avatar name={c.name} url={c.avatar_url} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">{c.name}</span>
                  {c.unread > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary text-primary-foreground shrink-0">{c.unread}</span>}
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">{c.last_body}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div className="md:col-span-2 rounded-xl border border-border flex flex-col">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm"><MessageCircle className="w-5 h-5 me-2" /> {t("sup.selectConvo")}</div>
          ) : (
            <>
              {/* Chat header with customer name + avatar */}
              {activeCustomer && (
                <div className="flex items-center gap-3 p-3 border-b border-border bg-card/30">
                  <Avatar name={activeCustomer.name} url={activeCustomer.avatar_url} size={10} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{activeCustomer.name}</p>
                    {activeCustomer.email && <p className="text-xs text-muted-foreground truncate">{activeCustomer.email}</p>}
                  </div>
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {msgs.map((m, i) => (
                  <div key={i} className={"flex " + (m.direction === "out" ? "justify-end" : "justify-start")}>
                    <div className={"max-w-[75%] px-3 py-2 rounded-2xl text-sm " + (m.direction === "out" ? "bg-primary text-primary-foreground" : "bg-muted/40")}>
                      {m.body}
                      <div className={"text-[10px] mt-1 " + (m.direction === "out" ? "text-primary-foreground/70" : "text-muted-foreground")}>{new Date(m.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="p-3 border-t border-border flex items-center gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send() }} placeholder={t("sup.typeReply")} className="flex-1 px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
                <button onClick={send} disabled={sending || !reply.trim()} className="p-2.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"><Send className="w-4 h-4" /></button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
