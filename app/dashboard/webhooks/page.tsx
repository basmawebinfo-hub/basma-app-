"use client"

import { useState } from "react"
import { Eye, EyeOff, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const EVENTS = [
  { key: "MESSAGE_RECEIVED", label: "New incoming message" },
  { key: "MESSAGE_UPDATE", label: "Message status update" },
  { key: "MESSAGE_DELETE", label: "Message deleted" },
  { key: "SEND_MESSAGE", label: "Outgoing message sent" },
  { key: "CONNECTION_UPDATE", label: "Connection status changed" },
  { key: "QRCODE_UPDATED", label: "QR code refreshed" },
  { key: "CONTACTS_UPSERT", label: "New / updated contact" },
  { key: "CONTACTS_UPDATE", label: "Contact updated" },
  { key: "CHATS_UPSERT", label: "New / updated chat" },
  { key: "CHATS_UPDATE", label: "Chat updated" },
  { key: "CHATS_DELETE", label: "Chat deleted" },
  { key: "GROUPS_UPSERT", label: "New / updated group" },
  { key: "GROUP_UPDATE", label: "Group info updated" },
  { key: "GROUP_PARTICIPANTS_UPDATE", label: "Group members changed" },
  { key: "PRESENCE_UPDATE", label: "Online presence update" },
  { key: "CONTACTS_SET", label: "Contacts list set" },
  { key: "CHATS_SET", label: "Chats list set" },
  { key: "LABELS_EDIT", label: "Label edited" },
  { key: "LABELS_ASSOCIATION", label: "Label associated" },
  { key: "CALL", label: "Incoming call" },
  { key: "TYPEBOT_START", label: "Typebot started" },
  { key: "TYPEBOT_CHANGE_STATUS", label: "Typebot status changed" },
]

const DELIVERY_LOG = [
  { event: "MESSAGE_RECEIVED", dest: "n8n workflow", status: "success", time: "Just now", code: 200, attempts: 1 },
  { event: "MESSAGE_STATUS", dest: "Zapier", status: "success", time: "1m ago", code: 200, attempts: 1 },
  { event: "MESSAGE_RECEIVED", dest: "https://api.client.com/wh", status: "success", time: "2m ago", code: 200, attempts: 1 },
  { event: "CALL", dest: "Make", status: "failed", time: "5m ago", code: 500, attempts: 3 },
  { event: "MESSAGE_RECEIVED", dest: "n8n workflow", status: "retrying", time: "8m ago", code: 503, attempts: 2 },
  { event: "CONTACT_UPDATED", dest: "HubSpot CRM", status: "success", time: "10m ago", code: 200, attempts: 1 },
  { event: "MESSAGE_RECEIVED", dest: "Slack", status: "success", time: "12m ago", code: 200, attempts: 1 },
  { event: "CONNECTION_UPDATE", dest: "Airtable", status: "failed", time: "15m ago", code: 404, attempts: 3 },
]

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  success: "default",
  failed: "destructive",
  retrying: "secondary",
}

export default function WebhooksPage() {
  const [destType, setDestType] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["MESSAGE_RECEIVED", "MESSAGE_STATUS"])

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

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure where WhatsApp events are delivered</p>
      </div>

      {/* Section A: Config form */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-foreground">Create Webhook Config</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Destination name */}
          <div className="space-y-2">
            <Label htmlFor="dest-name">Destination name</Label>
            <Input id="dest-name" placeholder="e.g. My n8n Workflow" />
          </div>

          {/* Destination type */}
          <div className="space-y-2">
            <Label>Destination type</Label>
            <Select onValueChange={setDestType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="n8n">n8n</SelectItem>
                <SelectItem value="zapier">Zapier</SelectItem>
                <SelectItem value="make">Make</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* URL or email */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="dest-url">
              {destType === "email" ? "Email address" : "Destination URL"}
            </Label>
            <Input
              id="dest-url"
              placeholder={
                destType === "email"
                  ? "notify@yourdomain.com"
                  : destType === "n8n"
                  ? "https://your-n8n.io/webhook/..."
                  : destType === "zapier"
                  ? "https://hooks.zapier.com/hooks/catch/..."
                  : "https://your-endpoint.com/webhook"
              }
            />
          </div>

          {/* Signing secret */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="secret">Signing secret (optional)</Label>
            <div className="relative">
              <Input
                id="secret"
                type={showSecret ? "text" : "password"}
                placeholder="Enter a secret for HMAC signing"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showSecret ? "Hide secret" : "Show secret"}
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Events grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Events to subscribe</Label>
            <button
              onClick={toggleAll}
              className="text-xs text-primary hover:underline"
            >
              {selectedEvents.length === EVENTS.length ? "Deselect all" : "Select all"}
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
                  <p className="text-xs font-medium text-foreground">{ev.label}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{ev.key}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="gap-2">Save Config</Button>
          <Button variant="outline" className="gap-2">
            <Send className="w-4 h-4" />
            Send Test Payload
          </Button>
        </div>
      </div>

      {/* Section B: Delivery log */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Delivery Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Event</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Destination</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Sent At</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Code</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Attempts</th>
              </tr>
            </thead>
            <tbody>
              {DELIVERY_LOG.map((row, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{row.event}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{row.dest}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={statusVariant[row.status]}
                      className="text-[10px] uppercase tracking-wide"
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.time}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.code}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
