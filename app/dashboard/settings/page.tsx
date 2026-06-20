"use client"
import { useEffect, useRef, useState } from "react"
import { Eye, EyeOff, Copy, Check, Loader2, Key, Webhook, User, RefreshCw, Camera, Activity, LogOut, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { logout } from "@/app/actions/auth"

const WEBHOOK_URL = "https://www.basmaweb.com/api/evolution/webhook"

function Copyable({ value }: { value: string }) {
  const [c, setC] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(value); setC(true); setTimeout(() => setC(false), 1500) }} className="p-2 rounded-md border border-border hover:bg-muted/40">
      {c ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [apiKey, setApiKey] = useState<{ key_prefix: string | null; last_used_at: string | null } | null>(null)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [genKey, setGenKey] = useState(false)

  const [webhook, setWebhook] = useState<{ token: string | null; hmac_secret: string | null } | null>(null)
  const [showHmac, setShowHmac] = useState(false)

  const [usage, setUsage] = useState<{ endpoint: string; status: number; detail: string; created_at: string }[]>([])
  const [usageMonth, setUsageMonth] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/user/profile").then((r) => r.json()).then((d) => { setDisplayName(d.full_name ?? ""); setEmail(d.email ?? ""); setAvatar(d.avatar_url ?? null) }).catch(() => {}),
      fetch("/api/user/api-key").then((r) => r.json()).then(setApiKey).catch(() => {}),
      fetch("/api/user/webhook-token").then((r) => r.json()).then(setWebhook).catch(() => {}),
      fetch("/api/user/usage").then((r) => r.json()).then((d) => { setUsage(d.calls ?? []); setUsageMonth(d.month_total ?? 0) }).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  async function saveProfile() {
    setSavingProfile(true)
    await fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: displayName }) })
    setSavingProfile(false); setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2000)
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert("Image too large (max 2MB)"); return }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const r = await fetch("/api/user/avatar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: reader.result }) })
      const d = await r.json()
      if (r.ok) setAvatar(d.avatar_url); else alert(d.error ?? "Upload failed")
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  async function genApiKey() {
    if (apiKey?.key_prefix && !confirm("This invalidates your current API key. Continue?")) return
    setGenKey(true); setNewApiKey(null)
    const r = await fetch("/api/user/api-key", { method: "POST" })
    const d = await r.json()
    if (d.key) { setNewApiKey(d.key); setApiKey({ key_prefix: d.key.slice(0, 12), last_used_at: null }) }
    setGenKey(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>

  const initials = (displayName || email || "?").slice(0, 2).toUpperCase()

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile card with avatar */}
      <section className="rounded-2xl border border-border bg-card/50 p-6">
        <div className="flex items-center gap-2 mb-5"><User className="w-4 h-4 text-primary" /><h2 className="text-base font-semibold">Profile</h2></div>
        <div className="flex items-center gap-5 mb-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/15 text-primary flex items-center justify-center text-2xl font-bold">
              {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : initials}
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
          </div>
          <div>
            <div className="font-medium">{displayName || "—"}</div>
            <div className="text-sm text-muted-foreground">{email}</div>
            <button onClick={() => fileRef.current?.click()} className="text-xs text-primary hover:underline mt-1">Change photo</button>
          </div>
        </div>
        <label className="text-xs text-muted-foreground">Display name</label>
        <div className="flex items-center gap-2 mt-1">
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
          <button onClick={saveProfile} disabled={savingProfile} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">{profileSaved ? "Saved" : savingProfile ? "..." : "Save"}</button>
        </div>
      </section>

      {/* API Key */}
      <section className="rounded-2xl border border-border bg-card/50 p-6">
        <div className="flex items-center gap-2 mb-3"><Key className="w-4 h-4 text-primary" /><h2 className="text-base font-semibold">API Key</h2></div>
        <p className="text-sm text-muted-foreground mb-4">Use this key in n8n / Make to send messages via <code className="text-xs">/api/send</code>.</p>
        {newApiKey ? (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 mb-3">
            <p className="text-xs text-amber-700 mb-2">Copy your key now — it won't be shown again:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-md bg-background border border-border text-xs font-mono break-all">{showKey ? newApiKey : newApiKey.slice(0, 12) + "••••••••"}</code>
              <button onClick={() => setShowKey(!showKey)} className="p-2 rounded-md border border-border">{showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
              <Copyable value={newApiKey} />
            </div>
          </div>
        ) : apiKey?.key_prefix ? (
          <div className="flex items-center gap-2 mb-3">
            <code className="flex-1 px-3 py-2 rounded-md bg-muted/30 border border-border text-xs font-mono">{apiKey.key_prefix}••••••••</code>
            <span className="text-xs text-muted-foreground">{apiKey.last_used_at ? "Last used " + new Date(apiKey.last_used_at).toLocaleDateString() : "Never used"}</span>
          </div>
        ) : <p className="text-sm text-muted-foreground mb-3">No API key yet.</p>}
        <button onClick={genApiKey} disabled={genKey} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/40 disabled:opacity-50"><RefreshCw className="w-4 h-4" /> {apiKey?.key_prefix ? "Regenerate key" : "Generate key"}</button>
      </section>

      {/* Webhook */}
      <section className="rounded-2xl border border-border bg-card/50 p-6">
        <div className="flex items-center gap-2 mb-3"><Webhook className="w-4 h-4 text-primary" /><h2 className="text-base font-semibold">Incoming Webhook</h2></div>
        <p className="text-sm text-muted-foreground mb-4">Receive messages in n8n. Configure your destination URL on the Webhooks page.</p>
        <label className="text-xs text-muted-foreground">Platform webhook URL</label>
        <div className="flex items-center gap-2 mt-1 mb-3"><code className="flex-1 px-3 py-2 rounded-md bg-muted/30 border border-border text-xs font-mono break-all">{WEBHOOK_URL}</code><Copyable value={WEBHOOK_URL} /></div>
        {webhook?.hmac_secret && (
          <>
            <label className="text-xs text-muted-foreground">HMAC secret (verify signatures)</label>
            <div className="flex items-center gap-2 mt-1"><code className="flex-1 px-3 py-2 rounded-md bg-muted/30 border border-border text-xs font-mono break-all">{showHmac ? webhook.hmac_secret : "••••••••••••••••"}</code><button onClick={() => setShowHmac(!showHmac)} className="p-2 rounded-md border border-border">{showHmac ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button><Copyable value={webhook.hmac_secret} /></div>
          </>
        )}
      </section>

      {/* API Usage */}
      <section className="rounded-2xl border border-border bg-card/50 p-6">
        <div className="flex items-center gap-2 mb-1"><Activity className="w-4 h-4 text-primary" /><h2 className="text-base font-semibold">API Usage</h2></div>
        <p className="text-sm text-muted-foreground mb-4">This month: <span className="font-medium text-foreground">{usageMonth}</span> calls.</p>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-muted-foreground"><tr className="text-left"><th className="p-3 font-medium">Endpoint</th><th className="p-3 font-medium">Detail</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Time</th></tr></thead>
            <tbody>
              {usage.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-muted-foreground text-xs">No API calls yet</td></tr> : usage.map((c, i) => (
                <tr key={i} className="border-t border-border/40"><td className="p-3 font-mono text-xs">{c.endpoint}</td><td className="p-3 text-xs text-muted-foreground">{c.detail}</td><td className="p-3"><span className={"text-xs " + (c.status === 200 ? "text-green-600" : "text-red-600")}>{c.status}</span></td><td className="p-3 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* Account */}
      <section className="rounded-2xl border border-border bg-card/50 p-6">
        <div className="flex items-center gap-2 mb-4"><User className="w-4 h-4 text-primary" /><h2 className="text-base font-semibold">Account</h2></div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/40">
            <ArrowLeft className="w-4 h-4" /> Back to landing page
          </Link>
          <form action={logout} className="flex-1">
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/30 text-sm font-medium text-red-600 hover:bg-red-500/10">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </form>
        </div>
      </section>

    </div>
  )
}
