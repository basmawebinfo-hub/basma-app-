"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Check, Trash2, Loader2, Plus, ArrowLeft, MessageSquare, Send, Wifi, WifiOff, QrCode, RefreshCw, Instagram } from "lucide-react"
import { TelegramLink } from "@/components/dashboard/telegram-link"
import { useI18n } from "@/lib/i18n"

interface Instance {
  id: string
  instance_name: string
  display_name: string
  phone: string | null
  status: "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "QR_READY"
  created_at: string
}

type View = "channels" | "whatsapp" | "telegram"
type Step = 1 | 2 | 3

export default function ConnectPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [view, setView] = useState<View>("channels")
  const [instances, setInstances] = useState<Instance[]>([])
  const [loadingInstances, setLoadingInstances] = useState(true)

  const [step, setStep] = useState<Step>(1)
  const [displayName, setDisplayName] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [showWizard, setShowWizard] = useState(false)

  const [newInstance, setNewInstance] = useState<Instance | null>(null)
  const [qrBase64, setQrBase64] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState("")

  const loadInstances = useCallback(async () => {
    const res = await fetch("/api/instances")
    if (res.ok) { const data = await res.json(); setInstances(data) }
    setLoadingInstances(false)
  }, [])
  useEffect(() => { loadInstances() }, [loadInstances])



  // Poll for connection after QR
  useEffect(() => {
    if (step !== 2 || !newInstance) return
    const interval = setInterval(async () => {
      const res = await fetch("/api/instances/" + newInstance.id + "/status")
      if (!res.ok) return
      const { status } = await res.json()
      if (status === "CONNECTED") {
        clearInterval(interval)
        setInstances((prev) => prev.map((i) => (i.id === newInstance.id ? { ...i, status: "CONNECTED" } : i)))
        setStep(3); loadInstances()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [step, newInstance, loadInstances])

  const fetchQR = useCallback(async (inst: Instance) => {
    setQrLoading(true); setQrError(""); setQrBase64(null)
    try {
      const res = await fetch("/api/instances/" + inst.id + "/qr")
      if (!res.ok) throw new Error("Failed to get QR code")
      const data = await res.json()
      setQrBase64(data.base64 ?? data.code ?? null)
    } catch (e: unknown) { setQrError((e as Error).message) } finally { setQrLoading(false) }
  }, [])

  const handleCreate = async () => {
    setCreating(true); setCreateError("")
    try {
      const res = await fetch("/api/instances", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ display_name: displayName }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create connection")
      const inst: Instance = data
      setNewInstance(inst); setInstances((prev) => [inst, ...prev])
      await fetchQR(inst); setStep(2)
    } catch (e: unknown) { setCreateError((e as Error).message) } finally { setCreating(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("cn.deleteConfirm"))) return
    await fetch("/api/instances?id=" + id, { method: "DELETE" })
    setInstances((prev) => prev.filter((i) => i.id !== id))
  }

  function resetWizard() { setShowWizard(false); setStep(1); setDisplayName(""); setNewInstance(null); setQrBase64(null); setQrError(""); setCreateError("") }

  const connectedCount = instances.filter((i) => i.status === "CONNECTED").length

  // ===== CHANNELS OVERVIEW =====
  if (view === "channels") {
    const channels = [
      { key: "whatsapp", name: t("cn.whatsapp"), desc: t("cn.whatsappDesc"), icon: MessageSquare, color: "text-green-500", bg: "bg-green-500/10", active: true, status: instances.length ? `${connectedCount}/${instances.length} connected` : "Not connected", onClick: () => setView("whatsapp") },
      { key: "telegram", name: t("cn.telegram"), desc: t("cn.telegramDesc"), icon: Send, color: "text-blue-500", bg: "bg-blue-500/10", active: true, status: t("cn.telegramAction"), onClick: () => setView("telegram") },
      { key: "instagram", name: "Instagram", desc: t("cn.igDesc"), icon: Instagram, color: "text-pink-500", bg: "bg-pink-500/10", active: false, status: t("cn.comingSoon"), onClick: () => {} },
    ]
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">{t("cn.title")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t("cn.subtitle")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((c) => (
            <button key={c.key} onClick={c.onClick} disabled={!c.active}
              className={"text-left rounded-2xl border p-5 transition-colors " + (c.active ? "border-border bg-card/50 hover:border-primary/50 cursor-pointer" : "border-border bg-card/30 opacity-60 cursor-not-allowed")}>
              <div className={"w-12 h-12 rounded-xl flex items-center justify-center mb-4 " + c.bg}><c.icon className={"w-6 h-6 " + c.color} /></div>
              <h3 className="font-semibold mb-1">{c.name}</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{c.desc}</p>
              <span className={"text-xs font-medium " + (c.active ? "text-primary" : "text-muted-foreground")}>{c.status}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ===== TELEGRAM MANAGEMENT =====
  if (view === "telegram") {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <button onClick={() => setView("channels")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5"><ArrowLeft className="w-4 h-4" /> Back to channels</button>
        <TelegramLink />
      </div>
    )
  }

  // ===== WHATSAPP MANAGEMENT =====
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button onClick={() => setView("channels")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5"><ArrowLeft className="w-4 h-4" /> Back to channels</button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="w-6 h-6 text-green-500" /> WhatsApp Numbers</h1>
          <p className="text-sm text-muted-foreground mt-1">{connectedCount} of {instances.length} connected</p>
        </div>
        {!showWizard && <button onClick={() => setShowWizard(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"><Plus className="w-4 h-4" /> Add number</button>}
      </div>

      {/* Wizard */}
      {showWizard && (
        <div className="rounded-2xl border border-border bg-card/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className={"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold " + (step >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{step > n ? <Check className="w-4 h-4" /> : n}</div>
              ))}
            </div>
            <button onClick={resetWizard} className="text-xs text-muted-foreground hover:text-foreground">{t("cn.cancel")}</button>
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <label className="text-sm font-medium"></label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Sales Line" className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
              {createError && <p className="text-xs text-red-500">{createError}</p>}
              <button onClick={handleCreate} disabled={creating || !displayName.trim()} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">{creating ? "Creating..." : "Next: Get QR Code"}</button>
            </div>
          )}
          {step === 2 && (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">Open WhatsApp on your phone -&gt; Linked Devices -&gt; Scan this code</p>
              <div className="flex items-center justify-center min-h-[220px]">
                {qrLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : qrError ? <p className="text-red-500 text-sm">{qrError}</p> : qrBase64 ? <img src={qrBase64.startsWith("data:") ? qrBase64 : "data:image/png;base64," + qrBase64} alt="QR" className="w-56 h-56 rounded-lg bg-white p-2" /> : <QrCode className="w-12 h-12 text-muted-foreground" />}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Waiting for scan...</div>
              {newInstance && <button onClick={() => fetchQR(newInstance)} className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto"><RefreshCw className="w-3 h-3" /> Refresh QR</button>}
            </div>
          )}
          {step === 3 && (
            <div className="text-center space-y-3 py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto"><Check className="w-7 h-7 text-green-500" /></div>
              <h3 className="font-semibold">{t("cn.connectedOk")}</h3>
              <button onClick={resetWizard} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">{t("cn.done")}</button>
            </div>
          )}
        </div>
      )}

      {/* Numbers list */}
      {loadingInstances ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : instances.length === 0 && !showWizard ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground text-sm">{t("cn.noNumbers")}</div>
      ) : (
        <div className="space-y-2">
          {instances.map((inst) => (
            <div key={inst.id} className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-4">
              <div className="flex items-center gap-3">
                <div className={"w-10 h-10 rounded-full flex items-center justify-center " + (inst.status === "CONNECTED" ? "bg-green-500/15" : "bg-muted/40")}>
                  {inst.status === "CONNECTED" ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div>
                  <div className="font-medium text-sm">{inst.display_name}</div>
                  <div className="text-xs text-muted-foreground">{inst.phone || "Not linked"} • <span className={inst.status === "CONNECTED" ? "text-green-500" : "text-muted-foreground"}>{inst.status}</span></div>
                </div>
              </div>
              <button onClick={() => handleDelete(inst.id)} className="p-2 rounded-md hover:bg-red-500/15 text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}