"use client"

import { useState, useEffect, useRef } from "react"
import {
  Plus, Play, Trash2, Loader2, Upload,
  CheckCircle2, XCircle, Clock, Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Instance {
  id: string
  display_name: string
  status: string
}

interface Campaign {
  id: string
  name: string
  status: string
  total_contacts: number
  sent_count: number
  delivered_count: number
  failed_count: number
  message_text: string
  created_at: string
  instances: { display_name: string; status: string } | null
}

const statusColor: Record<string, string> = {
  draft: "text-muted-foreground",
  scheduled: "text-blue-400",
  running: "text-yellow-400",
  completed: "text-green-500",
  failed: "text-destructive",
  paused: "text-orange-400",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  scheduled: "secondary",
  running: "secondary",
  completed: "default",
  failed: "destructive",
  paused: "secondary",
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [running, setRunning] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  // Form state
  const [form, setForm] = useState({
    name: "",
    instance_id: "",
    message_text: "",
    delay_seconds: "5",
  })
  const [contacts, setContacts] = useState<{ phone: string; name: string }[]>([])
  const [csvPreview, setCsvPreview] = useState<string>("")

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch("/api/campaigns").then((r) => r.json()),
      fetch("/api/instances").then((r) => r.json()),
    ]).then(([camps, insts]) => {
      setCampaigns(camps ?? [])
      setInstances((insts ?? []).filter((i: Instance) => i.status === "CONNECTED"))
    }).finally(() => setLoading(false))
  }, [])

  // ── CSV Upload ─────────────────────────────────────────────────────────────
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.trim().split("\n").filter(Boolean)
      const parsed: { phone: string; name: string }[] = []

      for (const line of lines) {
        const [phone, name] = line.split(",").map((s) => s.trim().replace(/"/g, ""))
        if (phone && phone.replace(/[^0-9]/g, "").length >= 7) {
          parsed.push({ phone: phone.replace(/[^0-9]/g, ""), name: name ?? "" })
        }
      }

      setContacts(parsed)
      setCsvPreview(`${parsed.length} contacts loaded`)
    }
    reader.readAsText(file)
  }

  // ── Create campaign ────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.name || !form.instance_id || !form.message_text || contacts.length === 0) {
      setError("Please fill all fields and upload contacts")
      return
    }
    setCreating(true)
    setError("")
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          delay_seconds: parseInt(form.delay_seconds),
          contacts,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCampaigns((prev) => [data, ...prev])
      setShowForm(false)
      setForm({ name: "", instance_id: "", message_text: "", delay_seconds: "5" })
      setContacts([])
      setCsvPreview("")
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setCreating(false)
    }
  }

  // ── Run campaign ───────────────────────────────────────────────────────────
  const handleRun = async (id: string) => {
    setRunning(id)
    try {
      const res = await fetch(`/api/campaigns/${id}/run`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "running" } : c))
      )
      // Poll for updates
      const interval = setInterval(async () => {
        const r = await fetch("/api/campaigns")
        const updated = await r.json()
        setCampaigns(updated)
        const camp = updated.find((c: Campaign) => c.id === id)
        if (camp?.status === "completed" || camp?.status === "failed") {
          clearInterval(interval)
        }
      }, 3000)
    } catch (e: unknown) {
      alert((e as Error).message)
    } finally {
      setRunning(null)
    }
  }

  // ── Delete campaign ────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return
    await fetch(`/api/campaigns?id=${id}`, { method: "DELETE" })
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">Send bulk messages to your contacts</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm((v) => !v)}>
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* ── Create Form ──────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-foreground">Create Campaign</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Campaign name</Label>
              <Input
                placeholder="e.g. Ramadan Offer 2025"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp instance</Label>
              <Select value={form.instance_id} onValueChange={(v) => setForm((p) => ({ ...p, instance_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select connected number..." />
                </SelectTrigger>
                <SelectContent>
                  {instances.length === 0 ? (
                    <SelectItem value="none" disabled>No connected instances</SelectItem>
                  ) : (
                    instances.map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.display_name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Hello {{name}}, we have a special offer for you..."
              value={form.message_text}
              onChange={(e) => setForm((p) => ({ ...p, message_text: e.target.value }))}
              rows={4}
            />
            <p className="text-[10px] text-muted-foreground">
              Use <code className="bg-muted px-1 rounded">{"{{name}}"}</code> to personalize with contact name
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Delay between messages (seconds)</Label>
              <Input
                type="number"
                min="3"
                max="60"
                value={form.delay_seconds}
                onChange={(e) => setForm((p) => ({ ...p, delay_seconds: e.target.value }))}
              />
              <p className="text-[10px] text-muted-foreground">Min 3s recommended to avoid WhatsApp ban</p>
            </div>

            <div className="space-y-2">
              <Label>Contacts (CSV file)</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </Button>
                {csvPreview && (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {csvPreview}
                  </span>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleCsvUpload}
              />
              <p className="text-[10px] text-muted-foreground">
                Format: phone,name (one per line). Example: 201234567890,Ahmed
              </p>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating} className="gap-2">
              {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Campaign"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* ── Campaign List ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No campaigns yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((camp) => {
            const progress = camp.total_contacts > 0
              ? Math.round(((camp.sent_count + camp.failed_count) / camp.total_contacts) * 100)
              : 0

            return (
              <div key={camp.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-foreground">{camp.name}</h3>
                      <Badge variant={statusVariant[camp.status]} className="text-[10px] uppercase">
                        {camp.status}
                      </Badge>
                      {camp.instances && (
                        <span className="text-[10px] text-muted-foreground">
                          via {camp.instances.display_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{camp.message_text}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(camp.status === "draft" || camp.status === "paused") && (
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => handleRun(camp.id)}
                        disabled={running === camp.id}
                        aria-label="Run campaign"
                      >
                        {running === camp.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Play className="w-4 h-4" />
                        }
                      </Button>
                    )}
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDelete(camp.id)}
                      disabled={camp.status === "running"}
                      aria-label="Delete campaign"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Total", value: camp.total_contacts, icon: Users, color: "" },
                    { label: "Sent", value: camp.sent_count, icon: CheckCircle2, color: "text-primary" },
                    { label: "Failed", value: camp.failed_count, icon: XCircle, color: "text-destructive" },
                    { label: "Progress", value: `${progress}%`, icon: Clock, color: "text-muted-foreground" },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted/20 rounded-lg p-2.5 text-center">
                      <p className={cn("text-lg font-bold text-foreground", s.color)}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                {camp.status === "running" && (
                  <div className="w-full bg-muted/30 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
