"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Copy, RefreshCw, Loader2, Check, Key, Webhook, User, AlertTriangle } from "lucide-react"
import { TelegramLink } from "@/components/dashboard/telegram-link"

interface ApiKeyData { key_prefix: string | null; is_active: boolean | null; last_used_at: string | null }
interface WebhookTokenData { token: string | null; hmac_secret: string | null; is_active: boolean }

const WEBHOOK_URL = "https://www.basmaweb.com/api/evolution/webhook"

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button variant="outline" size="icon-sm" onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  )
}

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData | null>(null)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [loadingApiKey, setLoadingApiKey] = useState(true)
  const [generatingApiKey, setGeneratingApiKey] = useState(false)
  const [webhookData, setWebhookData] = useState<WebhookTokenData | null>(null)
  const [showHmac, setShowHmac] = useState(false)
  const [loadingWebhook, setLoadingWebhook] = useState(true)
  const [generatingWebhook, setGeneratingWebhook] = useState(false)
  const [usage, setUsage] = useState<{ endpoint: string; status: number; detail: string; created_at: string }[]>([])
  const [usageMonth, setUsageMonth] = useState(0)

  useEffect(() => {
    fetch("/api/user/profile").then(r => r.json()).then(d => { setDisplayName(d.full_name ?? ""); setEmail(d.email ?? "") }).catch(() => {})
    fetch("/api/user/api-key").then(r => r.json()).then(d => setApiKeyData(d)).finally(() => setLoadingApiKey(false))
    fetch("/api/user/webhook-token").then(r => r.json()).then(d => setWebhookData(d)).finally(() => setLoadingWebhook(false))
    fetch("/api/user/usage").then(r => r.json()).then(d => { setUsage(d.calls ?? []); setUsageMonth(d.month_total ?? 0) }).catch(() => {})
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    await fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: displayName }) })
    setSavingProfile(false); setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2000)
  }

  const handleGenerateApiKey = async () => {
    if (apiKeyData?.key_prefix && !confirm("This will invalidate your current API key. Continue?")) return
    setGeneratingApiKey(true); setNewApiKey(null)
    const res = await fetch("/api/user/api-key", { method: "POST" })
    const data = await res.json()
    if (data.key) { setNewApiKey(data.key); setApiKeyData({ key_prefix: data.prefix, is_active: true, last_used_at: null }); setShowApiKey(true) }
    setGeneratingApiKey(false)
  }

  const handleGenerateWebhook = async () => {
    setGeneratingWebhook(true)
    const res = await fetch("/api/user/webhook-token", { method: "POST" })
    const data = await res.json()
    setWebhookData(data); setGeneratingWebhook(false)
  }

  const keyExists = !!apiKeyData?.key_prefix
  const keyRevoked = keyExists && apiKeyData?.is_active === false

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and workspace preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /><h2 className="text-sm font-semibold">Account</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Display name</Label><Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} readOnly className="opacity-60 cursor-not-allowed" /></div>
        </div>
        <Button onClick={handleSaveProfile} disabled={savingProfile} className="gap-2">
          {savingProfile ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : profileSaved ? <><Check className="w-4 h-4 text-green-500" />Saved!</> : "Save Changes"}
        </Button>
      </div>

      <Separator />

      {/* API Key */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Key className="w-4 h-4 text-primary" /><h2 className="text-sm font-semibold">API Key</h2></div>
          {keyExists && !keyRevoked && <Badge variant="default" className="text-[10px]">Active</Badge>}
          {keyRevoked && <Badge variant="destructive" className="text-[10px]">Revoked</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">Use this key to authenticate requests to the Basma Web API.</p>
        {loadingApiKey ? <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Loading...</div> : (
          <>
            {newApiKey && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-yellow-500 font-medium"><AlertTriangle className="w-4 h-4" />Copy this key now — it will not be shown again</div>
                <div className="flex items-center gap-2">
                  <Input type={showApiKey ? "text" : "password"} value={newApiKey} readOnly className="flex-1 font-mono text-xs bg-background" />
                  <Button variant="ghost" size="icon-sm" onClick={() => setShowApiKey(v => !v)}>{showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
                  <CopyButton value={newApiKey} />
                </div>
              </div>
            )}
            {!newApiKey && keyExists && <div className="space-y-2"><Label>Current key</Label><Input value={apiKeyData?.key_prefix ?? ""} readOnly className="flex-1 font-mono text-xs opacity-70" /></div>}
            {!newApiKey && !keyExists && <p className="text-xs text-muted-foreground">No API key generated yet.</p>}
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={handleGenerateApiKey} disabled={generatingApiKey}>
                {generatingApiKey ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><RefreshCw className="w-4 h-4" />{keyExists ? "Regenerate" : "Generate"} Key</>}
              </Button>
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Webhook */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2"><Webhook className="w-4 h-4 text-primary" /><h2 className="text-sm font-semibold">Webhook URL</h2></div>
        <p className="text-xs text-muted-foreground">Set this URL in your Evolution API instance webhook settings.</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL (Evolution API)</Label>
            <div className="flex items-center gap-2">
              <Input value={WEBHOOK_URL} readOnly className="flex-1 font-mono text-xs bg-muted/30" />
              <CopyButton value={WEBHOOK_URL} />
            </div>
            <p className="text-[10px] text-green-500">Set this in Evolution API instance webhook settings</p>
          </div>

          {!loadingWebhook && webhookData?.hmac_secret && (
            <div className="space-y-2">
              <Label>HMAC Signing Secret</Label>
              <div className="flex items-center gap-2">
                <Input type={showHmac ? "text" : "password"} value={webhookData.hmac_secret} readOnly className="flex-1 font-mono text-xs bg-muted/30" />
                <Button variant="ghost" size="icon-sm" onClick={() => setShowHmac(v => !v)}>{showHmac ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
                <CopyButton value={webhookData.hmac_secret} />
              </div>
            </div>
          )}

          <div className="bg-muted/20 rounded-lg p-3 space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">How to configure in Evolution API:</p>
            <p>1. Open Evolution API dashboard → your instance → Webhook</p>
            <p>2. Set the URL above as the webhook endpoint</p>
            <p>3. Enable: MESSAGES_UPSERT, CONNECTION_UPDATE, MESSAGES_UPDATE</p>
            <p>4. Save and test</p>
          </div>
        </div>

        <Button variant="outline" className="gap-2" onClick={handleGenerateWebhook} disabled={generatingWebhook}>
          {generatingWebhook ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><RefreshCw className="w-4 h-4" />{webhookData?.hmac_secret ? "Regenerate HMAC Secret" : "Generate Webhook Config"}</>}
        </Button>
      </div>

      <Separator />

      <div className="bg-card border border-destructive/30 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">Deleting your workspace is permanent and cannot be undone.</p>
        <Button variant="destructive" onClick={() => confirm("Are you absolutely sure?")}>Delete Workspace</Button>
      </div>
      <Separator className="my-8" />

      {/* API Usage */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <Webhook className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold">API Usage</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Track the API calls made with your key. This month: <span className="font-medium text-foreground">{usageMonth}</span> calls.</p>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-muted-foreground"><tr className="text-left"><th className="p-3 font-medium">Endpoint</th><th className="p-3 font-medium">Detail</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Time</th></tr></thead>
            <tbody>
              {usage.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground text-xs">No API calls yet</td></tr>
              ) : usage.map((c, i) => (
                <tr key={i} className="border-t border-border/40">
                  <td className="p-3 font-mono text-xs">{c.endpoint}</td>
                  <td className="p-3 text-xs text-muted-foreground">{c.detail}</td>
                  <td className="p-3"><span className={"text-xs " + (c.status === 200 ? "text-green-600" : "text-red-600")}>{c.status}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Separator className="my-8" />
      <TelegramLink />

    </div>
  )
}