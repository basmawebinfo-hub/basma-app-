"use client"

import { useState, useEffect, useCallback } from "react"
import { Eye, EyeOff, Send, Trash2, Loader2, Plus, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

// ─── Types ────────────────────────────────────────────────────────────────────

interface WebhookConfig {
  id: string
  name: string
  destination_type: string
  destination_url: string | null
  destination_email: string | null
  events: string[]
  is_active: boolean
  secret: string | null
  created_at: string
}

interface DeliveryLog {
  id: string
  status: string
  attempts: number
  last_attempt_at: string | null
  response_status: number | null
  error: string | null
  created_at: string
  webhook_configs: { name: string; destination_type: string; destination_url: string | null } | null
  webhook_events: { event_type: string } | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENTS = [
  // Core messaging events (most automations only need these)
  { key: "MESSAGE_RECEIVED", labelKey: "wh.evMsgRecv" },
  { key: "SEND_MESSAGE", labelKey: "wh.evMsgSent" },
  { key: "MESSAGE_UPDATE", labelKey: "wh.evMsgStatus" },
  // Connection & contacts
  { key: "CONNECTION_UPDATE", labelKey: "wh.evConn" },
  { key: "CONTACTS_UPSERT", labelKey: "wh.evContact" },
  { key: "CHATS_UPSERT", labelKey: "wh.evChat" },
  // Calls
  { key: "CALL", labelKey: "wh.evCall" },
]

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  SUCCESS: "default",
  FAILED: "destructive",
  RETRYING: "secondary",
  PENDING: "secondary",
}

const EMPTY_FORM = {
  name: "",
  destination_type: "",
  destination_url: "",
  destination_email: "",
  secret: "",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WebhooksPage() {
  const { t } = useI18n()
  const [configs, setConfigs] = useState<WebhookConfig[]>([])
  const [logs, setLogs] = useState<DeliveryLog[]>([])
  const [loadingConfigs, setLoadingConfigs] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["MESSAGE_RECEIVED"])
  const [showSecret, setShowSecret] = useState(false)

  // ─── Load data ───────────────────────────────────────────────────────────────
  const loadConfigs = useCallback(async () => {
    const res = await fetch("/api/webhooks")
    if (res.ok) setConfigs(await res.json())
    setLoadingConfigs(false)
  }, [])

  const loadLogs = useCallback(async () => {
    const res = await fetch("/api/webhooks/logs")
    if (res.ok) setLogs(await res.json())
    setLoadingLogs(false)
  }, [])

  useEffect(() => { loadConfigs(); loadLogs() }, [loadConfigs, loadLogs])

  // ─── Event toggles ────────────────────────────────────────────────────────────
  const toggleEvent = (key: string) => {
    setSelectedEvents((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
    )
  }

  const toggleAll = () => {
    setSelectedEvents((prev) =>
      prev.length === EVENTS.length ? [] : EVENTS.map((e) => e.key)
    )
  }

  // ─── Save config ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    setSaveError("")
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        destination_type: form.destination_type,
        events: selectedEvents,
        secret: form.secret || undefined,
      }
      if (form.destination_type === "EMAIL") {
        body.destination_email = form.destination_email
      } else {
        body.destination_url = form.destination_url
      }

      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? t("wh.saveFail"))
      setConfigs((prev) => [data, ...prev])
      setForm(EMPTY_FORM)
      setSelectedEvents(["MESSAGE_RECEIVED"])
    } catch (e: unknown) {
      setSaveError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  // ─── Toggle active ────────────────────────────────────────────────────────────
  const handleToggle = async (id: string, current: boolean) => {
    const res = await fetch(`/api/webhooks?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    })
    if (res.ok) {
      setConfigs((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c))
      )
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    await fetch(`/api/webhooks?id=${id}`, { method: "DELETE" })
    setConfigs((prev) => prev.filter((c) => c.id !== id))
  }

  // ─── Send test ────────────────────────────────────────────────────────────────
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null)

  const handleTest = async (config: WebhookConfig) => {
    if (!config.destination_url) return
    setTestingId(config.id)
    setTestResult(null)
    // Replay the LAST REAL incoming WhatsApp message to this webhook (real data, full circle)
    try {
      const res = await fetch("/api/webhooks/replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: config.destination_url, secret: config.secret }),
      })
      const d = await res.json().catch(() => ({}))
      setTestResult({
        id: config.id,
        ok: res.ok && d.ok !== false,
        msg: d.message || d.error || (res.ok ? "تم الإرسال!" : "فشل الإرسال"),
      })
    } catch {
      setTestResult({ id: config.id, ok: false, msg: "تعذّر الوصول" })
    } finally {
      setTestingId(null)
    }
  }

  const destIsUrl = form.destination_type !== "EMAIL"

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("wh.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("wh.subtitle")}</p>
      </div>

      {/* ─── Existing configs ─────────────────────────────────────────────────── */}
      {!loadingConfigs && configs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">{t("wh.activeConfigs")}</h2>
          <div className="space-y-2">
            {configs.map((cfg) => (
              <div
                key={cfg.id}
                className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{cfg.name}</p>
                    <Badge variant="outline" className="text-[10px] uppercase">{cfg.destination_type}</Badge>
                    {!cfg.is_active && <Badge variant="secondary" className="text-[10px]">{t("wh.paused")}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {cfg.destination_url ?? cfg.destination_email ?? "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {cfg.events.length} event{cfg.events.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(cfg.id, cfg.is_active)}
                    aria-label={cfg.is_active ? "Pause" : t("wh.resume")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cfg.is_active
                      ? <ToggleRight className="w-5 h-5 text-primary" />
                      : <ToggleLeft className="w-5 h-5" />
                    }
                  </button>
                  {cfg.destination_url && (
                    <Button variant="ghost" size="icon-sm" aria-label="Test" title="إرسال رسالة اختبار" onClick={() => handleTest(cfg)} disabled={testingId === cfg.id}>
                      {testingId === cfg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-sm" aria-label={t("wh.delete")} onClick={() => handleDelete(cfg.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Create form ──────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t("wh.newConfig")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="dest-name">Name</Label>
            <Input
              id="dest-name"
              placeholder="e.g. My n8n Workflow"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("wh.destType")}</Label>
            <Select
              value={form.destination_type}
              onValueChange={(v) => setForm((p) => ({ ...p, destination_type: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("wh.selectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="URL">URL</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="N8N">n8n</SelectItem>
                <SelectItem value="ZAPIER">Zapier</SelectItem>
                <SelectItem value="MAKE">Make</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="dest-url">{!destIsUrl ? t("wh.emailAddr") : t("wh.destUrl")}</Label>
            <Input
              id="dest-url"
              placeholder={
                !destIsUrl ? "notify@yourdomain.com"
                  : form.destination_type === "N8N" ? "https://your-n8n.io/webhook/..."
                  : form.destination_type === "ZAPIER" ? "https://hooks.zapier.com/hooks/catch/..."
                  : "https://your-endpoint.com/webhook"
              }
              value={destIsUrl ? form.destination_url : form.destination_email}
              onChange={(e) =>
                setForm((p) =>
                  destIsUrl
                    ? { ...p, destination_url: e.target.value }
                    : { ...p, destination_email: e.target.value }
                )
              }
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="secret">{t("wh.signingSecret")}</Label>
            <div className="relative">
              <Input
                id="secret"
                type={showSecret ? "text" : "password"}
                placeholder="HMAC signing secret"
                value={form.secret}
                onChange={(e) => setForm((p) => ({ ...p, secret: e.target.value }))}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showSecret ? t("wh.hideSecret") : t("wh.showSecret")}
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Events */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t("wh.events")}</Label>
            <button onClick={toggleAll} className="text-xs text-primary hover:underline">
              {selectedEvents.length === EVENTS.length ? t("wh.deselectAll") : t("wh.selectAll")}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {EVENTS.map((ev) => (
              <label
                key={ev.key}
                className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedEvents.includes(ev.key)}
                  onCheckedChange={() => toggleEvent(ev.key)}
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">{t(ev.labelKey)}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{ev.key}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {saveError && <p className="text-xs text-destructive">{saveError}</p>}

        <Button
          className="gap-2"
          onClick={handleSave}
          disabled={!form.name || !form.destination_type || selectedEvents.length === 0 || saving}
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : t("wh.saveConfig")}
        </Button>
      </div>

      {/* ─── Delivery log ─────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">{t("wh.deliveryLog")}</h2>
        </div>
        <div className="overflow-x-auto">
          {loadingLogs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-muted-foreground px-6 py-8">{t("wh.noLogs")}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Event", t("wh.colDest"), "Status", t("wh.colSentAt"), "Code", t("wh.colAttempts")].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr key={row.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {row.webhook_events?.event_type ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">
                      {row.webhook_configs?.destination_url ?? row.webhook_configs?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={statusVariant[row.status?.toUpperCase()] ?? "secondary"}
                        className="text-[10px] uppercase tracking-wide"
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {row.last_attempt_at
                        ? new Date(row.last_attempt_at).toLocaleString("ar-EG", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {row.response_status ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.attempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}