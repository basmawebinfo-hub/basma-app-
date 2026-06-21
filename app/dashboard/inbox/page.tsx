"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Paperclip, Send, Loader2, RefreshCw, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Instance {
  id: string
  instance_name: string
  display_name: string
  status: string
}

interface EvoChat {
  id: string
  remoteJid: string
  name?: string
  pushName?: string
  unreadCount?: number
  lastMsgTimestamp?: number
}

interface EvoMedia {
  thumbnail?: string | null
  mimetype?: string | null
  fileName?: string | null
  mediaUrl?: string | null
  seconds?: number | null
}
interface EvoMessage {
  key: { id: string; remoteJid: string; fromMe: boolean }
  message: {
    conversation?: string
    extendedTextMessage?: { text: string }
  }
  messageType?: string
  text?: string | null
  media?: EvoMedia | null
  messageTimestamp: number
  pushName?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMessageText(msg: EvoMessage): string {
  return (
    msg.text ??
    msg.message?.conversation ??
    msg.message?.extendedTextMessage?.text ??
    "[media]"
  )
}

function renderMessageBody(msg: EvoMessage) {
  const type = msg.messageType ?? "TEXT"
  const media = msg.media
  const caption = msg.text && !msg.text.startsWith("[") ? msg.text : null

  if (type === "IMAGE" || type === "STICKER") {
    const src = media?.thumbnail
    return (
      <div className="space-y-1">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="image" className="rounded-lg max-w-[220px] max-h-[220px] object-cover" />
        ) : (
          <p className="opacity-80">[image]</p>
        )}
        {caption && <p>{caption}</p>}
      </div>
    )
  }
  if (type === "VIDEO") {
    return (
      <div className="space-y-1">
        {media?.thumbnail ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.thumbnail} alt="video" className="rounded-lg max-w-[220px] object-cover" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">▶</span>
          </div>
        ) : (
          <p className="opacity-80">[video]</p>
        )}
        {caption && <p>{caption}</p>}
      </div>
    )
  }
  if (type === "AUDIO") {
    const secs = media?.seconds ? `${Math.round(media.seconds)}s` : ""
    return <p className="flex items-center gap-2">🎤 <span>Voice message {secs}</span></p>
  }
  if (type === "DOCUMENT") {
    return <p className="flex items-center gap-2">📄 <span>{media?.fileName ?? "Document"}</span></p>
  }
  if (type === "LOCATION") return <p>📍 Location</p>
  if (type === "CONTACT") return <p>👤 Contact card</p>
  return <p>{getMessageText(msg)}</p>
}

function formatTime(ts: number): string {
  const d = new Date(ts * 1000)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.round(diffMs / 60000)

  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffMin < 1440) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  return d.toLocaleDateString([], { day: "numeric", month: "short" })
}

function jidToPhone(jid: string): string {
  return "+" + jid.replace(/@.*/, "").replace(/[^0-9]/g, "")
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InboxPage() {
  const { t } = useI18n()
  const [instances, setInstances] = useState<Instance[]>([])
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null)
  const [chats, setChats] = useState<EvoChat[]>([])
  const [selectedChat, setSelectedChat] = useState<EvoChat | null>(null)
  const [messages, setMessages] = useState<EvoMessage[]>([])
  const [search, setSearch] = useState("")
  const [input, setInput] = useState("")

  const [loadingInstances, setLoadingInstances] = useState(true)
  const [loadingChats, setLoadingChats] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ─── Load instances ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/instances")
      .then((r) => r.json())
      .then((data: Instance[]) => {
        setInstances(data)
        const connected = data.find((i) => i.status === "CONNECTED")
        if (connected) setSelectedInstance(connected)
      })
      .finally(() => setLoadingInstances(false))
  }, [])

  // ─── Load chats when instance selected ───────────────────────────────────────
  const loadChats = useCallback(async (inst: Instance) => {
    setLoadingChats(true)
    setError("")
    setChats([])
    setSelectedChat(null)
    setMessages([])
    try {
      const res = await fetch(`/api/messages?instance_id=${inst.id}`)
      if (!res.ok) throw new Error("Failed to load chats")
      const data = await res.json()
      const chatList: EvoChat[] = (data.chats ?? [])
        .filter((c: EvoChat) => c.remoteJid && !c.remoteJid.includes("@g.us")) // exclude groups for now
        .sort((a: EvoChat, b: EvoChat) => (b.lastMsgTimestamp ?? 0) - (a.lastMsgTimestamp ?? 0))
      setChats(chatList)
      if (chatList.length > 0) setSelectedChat(chatList[0])
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoadingChats(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedInstance) return
    loadChats(selectedInstance)

    // Poll chat list every 8s for new chats / new messages (silent, no flicker)
    const timer = setInterval(() => {
      fetch(`/api/messages?instance_id=${selectedInstance.id}`)
        .then((r) => r.json())
        .then((data) => {
          const chatList: EvoChat[] = (data.chats ?? [])
            .filter((c: EvoChat) => c.remoteJid && !c.remoteJid.includes("@g.us"))
            .sort((a: EvoChat, b: EvoChat) => (b.lastMsgTimestamp ?? 0) - (a.lastMsgTimestamp ?? 0))
          setChats(chatList)
        })
        .catch(() => {})
    }, 8000)
    return () => clearInterval(timer)
  }, [selectedInstance, loadChats])

  // ─── Load messages when chat selected + poll every 5s ────────────────────────
  const loadMessages = useCallback(async (inst: Instance, chat: EvoChat, initial = false) => {
    if (initial) setLoadingMessages(true)
    try {
      const res = await fetch(`/api/messages?instance_id=${inst.id}&jid=${encodeURIComponent(chat.remoteJid)}`)
      const data = await res.json()
      const sorted = (data.messages ?? []).sort(
        (a: EvoMessage, b: EvoMessage) => a.messageTimestamp - b.messageTimestamp
      )
      setMessages(sorted)
    } finally {
      if (initial) setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedChat || !selectedInstance) return
    setMessages([])
    loadMessages(selectedInstance, selectedChat, true)

    // Poll every 5 seconds for new messages
    const timer = setInterval(() => {
      loadMessages(selectedInstance, selectedChat, false)
    }, 5000)
    return () => clearInterval(timer)
  }, [selectedChat, selectedInstance, loadMessages])

  // ─── Scroll to bottom on new messages ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ─── Send message ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || !selectedChat || !selectedInstance) return
    const text = input.trim()
    setInput("")
    setSending(true)
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instance_id: selectedInstance.id,
          to: jidToPhone(selectedChat.remoteJid),
          text,
        }),
      })
      // Optimistically add the message
      const optimistic: EvoMessage = {
        key: { id: `opt_${Date.now()}`, remoteJid: selectedChat.remoteJid, fromMe: true },
        message: { conversation: text },
        messageTimestamp: Math.floor(Date.now() / 1000),
      }
      setMessages((prev) => [...prev, optimistic])
    } finally {
      setSending(false)
    }
  }

  const filteredChats = chats.filter((c) =>
    (c.pushName ?? c.name ?? jidToPhone(c.remoteJid))
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // ─── No instances ─────────────────────────────────────────────────────────────
  if (!loadingInstances && instances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("ib.noConn")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Go to <a href="/dashboard/connect" className="text-primary underline">{t("ib.connections")}</a> to link a WhatsApp number first.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-65px)] lg:h-screen">

      {/* ─── Chat list ──────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[30%] border-r border-border flex flex-col shrink-0">
        {/* Header + instance selector */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-foreground">{t("ib.title")}</h1>
            {instances.length > 1 && (
              <select
                className="text-xs bg-muted/30 border border-border rounded-md px-2 py-1 text-foreground"
                value={selectedInstance?.id ?? ""}
                onChange={(e) => {
                  const inst = instances.find((i) => i.id === e.target.value)
                  if (inst) setSelectedInstance(inst)
                }}
              >
                {instances.map((i) => (
                  <option key={i.id} value={i.id}>{i.display_name}</option>
                ))}
              </select>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("ib.refreshChats")}
              onClick={() => selectedInstance && loadChats(selectedInstance)}
              disabled={loadingChats}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loadingChats && "animate-spin")} />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder={t("ib.searchChats")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-muted/30"
            />
          </div>
        </div>

        {/* Chat items */}
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-xs text-destructive p-4">{error}</p>
          ) : filteredChats.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4">{t("ib.noChats")}</p>
          ) : (
            filteredChats.map((chat) => {
              const name = chat.pushName ?? chat.name ?? jidToPhone(chat.remoteJid)
              const phone = jidToPhone(chat.remoteJid)
              const isSelected = selectedChat?.remoteJid === chat.remoteJid
              return (
                <button
                  key={chat.remoteJid}
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-border/30",
                    isSelected
                      ? "bg-primary/10 border-l-2 border-l-primary"
                      : "hover:bg-muted/30"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium text-foreground truncate">{name}</span>
                      {chat.lastMsgTimestamp && (
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {formatTime(chat.lastMsgTimestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground truncate">{phone}</span>
                      {(chat.unreadCount ?? 0) > 0 && (
                        <Badge className="ml-2 shrink-0 w-4 h-4 p-0 flex items-center justify-center text-[10px]">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ─── Chat window ────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 flex-col min-w-0">
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            {t("ib.selectChat")}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card/50">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                {(selectedChat.pushName ?? jidToPhone(selectedChat.remoteJid)).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {selectedChat.pushName ?? selectedChat.name ?? jidToPhone(selectedChat.remoteJid)}
                </p>
                <p className="text-xs text-muted-foreground">{jidToPhone(selectedChat.remoteJid)}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
              {loadingMessages ? (
                <div className="flex justify-center pt-10">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground pt-10">{t("ib.noMsg")}</p>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={msg.key.id ?? i}
                    className={cn("flex", msg.key.fromMe ? "justify-end" : "justify-start")}
                  >
                    <div className={cn(
                      "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm",
                      msg.key.fromMe
                        ? "bg-green-600 text-white rounded-br-sm"
                        : "bg-card border border-border text-foreground rounded-bl-sm"
                    )}>
                      <MediaMessage msg={msg} instanceId={selectedInstance?.id ?? ""} />
                      <p className={cn(
                        "text-[10px] mt-1 text-right",
                        msg.key.fromMe ? "text-white/70" : "text-muted-foreground"
                      )}>
                        {formatTime(msg.messageTimestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-border bg-card/30">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon-sm" aria-label={t("ib.attachFile")}>
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder={t("ib.typeMsg")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="flex-1 bg-muted/30"
                  disabled={sending}
                />
                <Button
                  size="icon-sm"
                  onClick={handleSend}
                  aria-label={t("ib.sendMsg")}
                  disabled={!input.trim() || sending}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}