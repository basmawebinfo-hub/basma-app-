"use client"
import { useState, useEffect, useCallback } from "react"
import { Trash2, Loader2, Plus, ToggleLeft, ToggleRight, Webhook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Instance { id: string; instance_name: string; status: string }
interface WebhookConfig {
  id: string; name: string; destination_url: string | null
  events: string[]; is_active: boolean; instance_id: string | null; created_at: string
}

const ALL_EVENTS = [
  { key: "MESSAGE_RECEIVED", label: "رسالة واردة" },
  { key: "SEND_MESSAGE", label: "رسالة صادرة" },
  { key: "MESSAGE_UPDATE", label: "حالة الرسالة" },
  { key: "CONNECTION_UPDATE", label: "حالة الاتصال" },
]

export default function WebhooksPage() {
  const [configs, setConfigs] = useState<WebhookConfig[]>([])
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // quick-add form: just URL + instance + events (no name)
  const [url, setUrl] = useState("")
  const [instanceId, setInstanceId] = useState("")
  const [events, setEvents] = useState<string[]>(["MESSAGE_RECEIVED"])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [wc, ins] = await Promise.all([
        fetch("/api/webhooks").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/instances").then((r) => r.json()).catch(() => ({ data: [] })),
      ])
      setConfigs(Array.isArray(wc) ? wc : (wc.data ?? []))
      const list = Array.isArray(ins) ? ins : (ins.data ?? ins.instances ?? [])
      setInstances(list)
      if (list.length === 1) setInstanceId(list[0].id)
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const addWebhook = async () => {
    if (!url.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_type: "N8N",
          destination_url: url.trim(),
          instance_id: instanceId || null,
          events,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setConfigs((prev) => [data, ...prev])
        setUrl("")
      }
    } finally { setSaving(false) }
  }

  const toggleEvent = (k: string) =>
    setEvents((prev) => prev.includes(k) ? prev.filter((e) => e !== k) : [...prev, k])

  const handleDelete = async (id: string) => {
    await fetch(`/api/webhooks?id=${id}`, { method: "DELETE" }).catch(() => {})
    setConfigs((prev) => prev.filter((c) => c.id !== id))
  }

  const handleToggle = async (id: string, active: boolean) => {
    await fetch("/api/webhooks", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !active }),
    }).catch(() => {})
    setConfigs((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !active } : c))
  }

  const instName = (iid: string | null) =>
    instances.find((i) => i.id === iid)?.instance_name?.split("_")[0] ?? "كل الأرقام"

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Webhook className="w-6 h-6 text-primary" /> Webhooks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">اربط أرقامك بـ n8n / Make / Zapier لاستقبال الرسائل لحظياً.</p>
      </div>

      {/* ── Quick add: URL + instance + events, added instantly ── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">إضافة Webhook جديد</h2>

        {/* رابط الوجهة */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">رابط الوجهة (من n8n)</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://n8n.../webhook/.../basma"
            className="w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground outline-none focus:border-primary"
          />
          {url.includes("webhook-test")
            ? <span className="text-[11px] text-yellow-500">نوع: Test URL (للتجربة)</span>
            : url && <span className="text-[11px] text-primary">نوع: Production URL (للتشغيل)</span>}
        </div>

        {/* اختيار الرقم */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">الرقم المرتبط (يمنع التداخل بين أرقامك)</label>
          <select
            value={instanceId}
            onChange={(e) => setInstanceId(e.target.value)}
            className="w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">كل الأرقام</option>
            {instances.map((i) => (
              <option key={i.id} value={i.id}>{i.instance_name.split("_")[0]} ({i.status})</option>
            ))}
          </select>
        </div>

        {/* الأحداث */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">الأحداث</label>
          <div className="flex flex-wrap gap-2">
            {ALL_EVENTS.map((ev) => (
              <button
                key={ev.key}
                onClick={() => toggleEvent(ev.key)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs border transition",
                  events.includes(ev.key)
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-muted/30 text-muted-foreground border-border"
                )}
              >
                {ev.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={addWebhook} disabled={saving || !url.trim()} className="w-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          إضافة فوراً
        </Button>
      </div>

      {/* ── Active webhooks ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">الإعدادات النشطة</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : configs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">لا توجد webhooks بعد. أضف واحداً بالأعلى.</p>
        ) : (
          configs.map((cfg) => (
            <div key={cfg.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{cfg.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                    {instName(cfg.instance_id)}
                  </span>
                  {!cfg.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">موقوف</span>}
                </div>
                <p className="text-[11px] text-muted-foreground font-mono truncate mt-1">{cfg.destination_url}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{cfg.events?.length ?? 0} حدث</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleToggle(cfg.id, cfg.is_active)} className="text-muted-foreground hover:text-foreground transition" aria-label="toggle">
                  {cfg.is_active ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(cfg.id)} aria-label="delete">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
