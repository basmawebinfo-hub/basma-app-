"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Loader2, ToggleLeft, ToggleRight, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AutoReplyRule {
  id: string
  name: string
  trigger_type: string
  keywords: string[]
  reply_text: string
  is_active: boolean
  instance_id: string | null
  instances: { display_name: string } | null
}

interface Instance {
  id: string
  display_name: string
  status: string
}

const TRIGGER_LABELS: Record<string, string> = {
  keyword: "Keyword Match",
  welcome: "Welcome Message",
  away: "Away Hours",
  any: "Any Message",
}

export default function AutoReplyPage() {
  const [rules, setRules] = useState<AutoReplyRule[]>([])
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    instance_id: "",
    trigger_type: "keyword",
    keywords: "",
    reply_text: "",
    away_start: "",
    away_end: "",
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/auto-reply").then((r) => r.json()),
      fetch("/api/instances").then((r) => r.json()),
    ]).then(([rulesData, instsData]) => {
      setRules(Array.isArray(rulesData) ? rulesData : [])
      setInstances(Array.isArray(instsData) ? instsData : [])
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!form.name || !form.trigger_type || !form.reply_text) {
      setError("Name, trigger type, and reply text are required")
      return
    }
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/auto-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          instance_id: form.instance_id || null,
          trigger_type: form.trigger_type,
          keywords: form.keywords ? form.keywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
          reply_text: form.reply_text,
          away_start: form.away_start || null,
          away_end: form.away_end || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRules((prev) => [data, ...prev])
      setShowForm(false)
      setForm({ name: "", instance_id: "", trigger_type: "keyword", keywords: "", reply_text: "", away_start: "", away_end: "" })
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    const res = await fetch(`/api/auto-reply?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    })
    if (res.ok) {
      setRules((prev) => prev.map((r) => r.id === id ? { ...r, is_active: !current } : r))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rule?")) return
    await fetch(`/api/auto-reply?id=${id}`, { method: "DELETE" })
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Auto Reply</h1>
          <p className="text-sm text-muted-foreground mt-1">Automatically reply to incoming WhatsApp messages</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm((v) => !v)}>
          <Plus className="w-4 h-4" /> New Rule
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-foreground">Create Auto Reply Rule</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rule name</Label>
              <Input placeholder="e.g. Welcome Message" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp instance (optional)</Label>
              <Select value={form.instance_id} onValueChange={(v) => setForm((p) => ({ ...p, instance_id: v }))}>
                <SelectTrigger><SelectValue placeholder="All instances" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All instances</SelectItem>
                  {instances.map((i) => <SelectItem key={i.id} value={i.id}>{i.display_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Trigger type</Label>
            <Select value={form.trigger_type} onValueChange={(v) => setForm((p) => ({ ...p, trigger_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="keyword">Keyword Match</SelectItem>
                <SelectItem value="welcome">Welcome (first message)</SelectItem>
                <SelectItem value="away">Away Hours</SelectItem>
                <SelectItem value="any">Any Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.trigger_type === "keyword" && (
            <div className="space-y-2">
              <Label>Keywords (comma separated)</Label>
              <Input placeholder="hello, hi, مرحبا, سلام" value={form.keywords} onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))} />
              <p className="text-[10px] text-muted-foreground">Reply will trigger when message contains any of these words</p>
            </div>
          )}

          {form.trigger_type === "away" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Away from</Label>
                <Input type="time" value={form.away_start} onChange={(e) => setForm((p) => ({ ...p, away_start: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Away until</Label>
                <Input type="time" value={form.away_end} onChange={(e) => setForm((p) => ({ ...p, away_end: e.target.value }))} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reply message</Label>
            <Textarea
              placeholder="Hello! Thanks for contacting us. We will reply shortly."
              value={form.reply_text}
              onChange={(e) => setForm((p) => ({ ...p, reply_text: e.target.value }))}
              rows={3}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Rule"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Rules List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : rules.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No auto reply rules yet.</p>
          <p className="text-xs mt-1">Create a rule to automatically respond to incoming messages.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">{rule.name}</h3>
                    <Badge variant="outline" className="text-[10px]">{TRIGGER_LABELS[rule.trigger_type] ?? rule.trigger_type}</Badge>
                    {!rule.is_active && <Badge variant="secondary" className="text-[10px]">Paused</Badge>}
                    {rule.instances && <span className="text-[10px] text-muted-foreground">via {rule.instances.display_name}</span>}
                  </div>
                  {rule.keywords?.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Keywords: {rule.keywords.join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Reply: {rule.reply_text}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleToggle(rule.id, rule.is_active)} aria-label="Toggle">
                    {rule.is_active
                      ? <ToggleRight className="w-5 h-5 text-primary" />
                      : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                  </button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(rule.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
