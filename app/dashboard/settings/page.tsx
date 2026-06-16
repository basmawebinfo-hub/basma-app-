"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Eye, EyeOff, Copy, RefreshCw, Loader2, Check,
  Key, Webhook, User, AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApiKeyData {
  key_prefix: string | null
  is_active: boolean
  last_used_at: string | null
  created_at: string | null
}

interface WebhookTokenData {
  token: string | null
  webhook_url: string | null
  hmac_secret: string | null
  is_active: boolean
}

// ─── Copy helper ──────────────────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button variant="outline" size="icon-sm" onClick={copy} aria-label="Copy">
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  // Profile
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // API Key
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData | null>(null)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [loadingApiKey, setLoadingApiKey] = useState(true)
  const [generatingApiKey, setGeneratingApiKey] = useState(false)

  // Webhook Token
  const [webhookData, setWebhookData] = useState<WebhookTokenData | null>(null)
  const [showHmac, setShowHmac] = useState(false)
  const [loadingWebhook, setLoadingWebhook] = useState(true)
  const [generatingWebhook, setGeneratingWebhook] = useState(false)

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Load profile from Supabase session
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        setDisplayName(d.full_name ?? "")
        setEmail(d.email ?? "")
      })
      .catch(() => {})

    // Load API key info
    fetch("/api/user/api-key")
      .then((r) => r.json())
      .then((d) => setApiKeyData(d))
      .finally(() => setLoadingApiKey(false))

    // Load webhook token
    fetch("/api/user/webhook-token")
      .then((r) => r.json())
      .then((d) => setWebhookData(d))
      .finally(() => setLoadingWebhook(false))
  }, [])

  // ── Save profile ───────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true)
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: displayName }),
    })
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  // ── Generate API Key ───────────────────────────────────────────────────────
  const handleGenerateApiKey = async () => {
    if (!confirm("This will invalidate your current API key. Continue?")) return
    setGeneratingApiKey(true)
    setNewApiKey(null)
    const res = await fetch("/api/user/api-key", { method: "POST" })
    const data = await res.json()
    if (data.key) {
      setNewApiKey(data.key)
      setApiKeyData({ key_prefix: data.prefix, is_active: true, last_used_at: null, created_at: new Date().toISOString() })
      setShowApiKey(true)
    }
    setGeneratingApiKey(false)
  }

  // ── Revoke API Key ─────────────────────────────────────────────────────────
  const handleRevokeApiKey = async () => {
    if (!confirm("Revoke your API key? All integrations using it will stop working.")) return
    await fetch("/api/user/api-key", { method: "DELETE" })
    setApiKeyData((prev) => prev ? { ...prev, is_active: false } : null)
    setNewApiKey(null)
  }

  // ── Generate Webhook Token ─────────────────────────────────────────────────
  const handleGenerateWebhook = async () => {
    if (webhookData?.token && !confirm("This will change your webhook URL. Continue?")) return
    setGeneratingWebhook(true)
    const res = await fetch("/api/user/webhook-token", { method: "POST" })
    const data = await res.json()
    setWebhookData(data)
    setGeneratingWebhook(false)
  }

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and workspace preferences</p>
      </div>

      {/* ── Profile ─────────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Account</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} readOnly className="opacity-60 cursor-not-allowed" />
          </div>
        </div>
        <Button onClick={handleSaveProfile} disabled={savingProfile} className="gap-2">
          {savingProfile ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : profileSaved ? (
            <><Check className="w-4 h-4 text-green-500" /> Saved!</>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      <Separator />

      {/* ── API Key ──────────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">API Key</h2>
          </div>
          {apiKeyData?.is_active && (
            <Badge variant="default" className="text-[10px]">Active</Badge>
          )}
          {apiKeyData && !apiKeyData.is_active && (
            <Badge variant="destructive" className="text-[10px]">Revoked</Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Use this key to authenticate requests to the Basma Web API from your own applications.
        </p>

        {loadingApiKey ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : (
          <>
            {/* Show new key once */}
            {newApiKey && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-yellow-500 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  Copy this key now — it will not be shown again
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={newApiKey}
                    readOnly
                    className="flex-1 font-mono text-xs bg-background"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowApiKey((v) => !v)}
                    aria-label="Toggle visibility"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <CopyButton value={newApiKey} />
                </div>
              </div>
            )}

            {/* Key prefix display */}
            {!newApiKey && apiKeyData?.key_prefix && (
              <div className="space-y-2">
                <Label>Current key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={apiKeyData.key_prefix}
                    readOnly
                    className="flex-1 font-mono text-xs opacity-70"
                  />
                  {apiKeyData.last_used_at && (
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      Last used: {new Date(apiKeyData.last_used_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}

            {!newApiKey && !apiKeyData?.key_prefix && (
              <p className="text-xs text-muted-foreground">No API key generated yet.</p>
            )}

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleGenerateApiKey}
                disabled={generatingApiKey}
              >
                {generatingApiKey ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><RefreshCw className="w-4 h-4" /> {apiKeyData?.key_prefix ? "Regenerate" : "Generate"} Key</>
                )}
              </Button>
              {apiKeyData?.is_active && (
                <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={handleRevokeApiKey}>
                  Revoke Key
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* ── Webhook Token ────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Webhook className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Your Webhook URL</h2>
        </div>

        <p className="text-xs text-muted-foreground">
          Set this URL in your Evolution API instance webhook settings. All WhatsApp events will be delivered here and forwarded to your configured destinations.
        </p>

        {loadingWebhook ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : (
          <>
            {webhookData?.webhook_url ? (
              <div className="space-y-4">
                {/* Webhook URL */}
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={webhookData.webhook_url}
                      readOnly
                      className="flex-1 font-mono text-xs bg-muted/30"
                    />
                    <CopyButton value={webhookData.webhook_url} />
                  </div>
                </div>

                {/* HMAC Secret */}
                <div className="space-y-2">
                  <Label>HMAC Signing Secret</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type={showHmac ? "text" : "password"}
                      value={webhookData.hmac_secret ?? ""}
                      readOnly
                      className="flex-1 font-mono text-xs bg-muted/30"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setShowHmac((v) => !v)}
                      aria-label="Toggle HMAC visibility"
                    >
                      {showHmac ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <CopyButton value={webhookData.hmac_secret ?? ""} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Evolution API will sign requests with this secret. Used to verify authenticity.
                  </p>
                </div>

                {/* How to use */}
                <div className="bg-muted/20 rounded-lg p-3 space-y-1 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">How to configure in Evolution API:</p>
                  <p>1. Open your Evolution API dashboard</p>
                  <p>2. Go to your instance → Webhook settings</p>
                  <p>3. Set the URL above as the webhook endpoint</p>
                  <p>4. Enable the events you want to receive</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No webhook URL generated yet.</p>
            )}

            <Button
              variant="outline"
              className="gap-2"
              onClick={handleGenerateWebhook}
              disabled={generatingWebhook}
            >
              {generatingWebhook ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><RefreshCw className="w-4 h-4" /> {webhookData?.token ? "Regenerate" : "Generate"} Webhook URL</>
              )}
            </Button>
          </>
        )}
      </div>

      <Separator />

      {/* ── Danger Zone ──────────────────────────────────────────────────────── */}
      <div className="bg-card border border-destructive/30 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Deleting your workspace is permanent and cannot be undone. All instances, messages, and data will be lost.
        </p>
        <Button variant="destructive" onClick={() => confirm("Are you absolutely sure?")}>
          Delete Workspace
        </Button>
      </div>
    </div>
  )
}
