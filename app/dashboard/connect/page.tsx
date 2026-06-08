"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Check, RefreshCw, QrCode, ArrowRight, Trash2,
  Wifi, WifiOff, Loader2, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Step = 1 | 2 | 3

interface Instance {
  id: string
  instance_name: string
  display_name: string
  phone: string | null
  status: "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "QR_READY"
  created_at: string
}

const statusColor: Record<Instance["status"], string> = {
  CONNECTED: "text-green-500",
  CONNECTING: "text-yellow-500",
  QR_READY: "text-blue-400",
  DISCONNECTED: "text-muted-foreground",
}

const statusBadge: Record<Instance["status"], "default" | "secondary" | "destructive" | "outline"> = {
  CONNECTED: "default",
  CONNECTING: "secondary",
  QR_READY: "secondary",
  DISCONNECTED: "outline",
}

const steps = [
  { number: 1, label: "Name" },
  { number: 2, label: "Scan QR" },
  { number: 3, label: "Connected" },
]

export default function ConnectPage() {
  const [instances, setInstances] = useState<Instance[]>([])
  const [loadingInstances, setLoadingInstances] = useState(true)

  // New connection wizard state
  const [step, setStep] = useState<Step>(1)
  const [displayName, setDisplayName] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  // QR state
  const [newInstance, setNewInstance] = useState<Instance | null>(null)
  const [qrBase64, setQrBase64] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState("")
  const [countdown, setCountdown] = useState(30)
  const [polling, setPolling] = useState(false)

  // ─── Load existing instances ────────────────────────────────────────────────
  const loadInstances = useCallback(async () => {
    const res = await fetch("/api/instances")
    if (res.ok) {
      const data = await res.json()
      setInstances(data)
    }
    setLoadingInstances(false)
  }, [])

  useEffect(() => { loadInstances() }, [loadInstances])

  // ─── Poll for connection status after QR shown ──────────────────────────────
  useEffect(() => {
    if (step !== 2 || !newInstance) return
    setPolling(true)

    const interval = setInterval(async () => {
      const res = await fetch(`/api/instances/${newInstance.id}/status`)
      if (!res.ok) return
      const { status } = await res.json()
      if (status === "CONNECTED") {
        clearInterval(interval)
        setPolling(false)
        setInstances((prev) =>
          prev.map((i) => (i.id === newInstance.id ? { ...i, status: "CONNECTED" } : i))
        )
        setNewInstance((prev) => prev ? { ...prev, status: "CONNECTED" } : prev)
        setStep(3)
      }
    }, 3000)

    return () => { clearInterval(interval); setPolling(false) }
  }, [step, newInstance])

  // ─── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 2) return
    setCountdown(30)
    const t = setInterval(() => {
      setCountdown((p) => {
        if (p <= 1) { clearInterval(t); return 0 }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [step, qrBase64])

  // ─── Fetch QR code ───────────────────────────────────────────────────────────
  const fetchQR = useCallback(async (inst: Instance) => {
    setQrLoading(true)
    setQrError("")
    setQrBase64(null)
    try {
      const res = await fetch(`/api/instances/${inst.id}/qr`)
      if (!res.ok) throw new Error("Failed to get QR code")
      const data = await res.json()
      const base64 = data.base64 ?? data.code ?? null
      setQrBase64(base64)
    } catch (e: unknown) {
      setQrError((e as Error).message)
    } finally {
      setQrLoading(false)
    }
  }, [])

  // ─── Step 1: Create instance ─────────────────────────────────────────────────
  const handleCreate = async () => {
    setCreating(true)
    setCreateError("")
    try {
      const res = await fetch("/api/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create connection")
      const inst: Instance = data
      setNewInstance(inst)
      setInstances((prev) => [inst, ...prev])
      await fetchQR(inst)
      setStep(2)
    } catch (e: unknown) {
      setCreateError((e as Error).message)
    } finally {
      setCreating(false)
    }
  }

  // ─── Delete instance ─────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    await fetch(`/api/instances?id=${id}`, { method: "DELETE" })
    setInstances((prev) => prev.filter((i) => i.id !== id))
  }

  // ─── Reset wizard ─────────────────────────────────────────────────────────────
  const resetWizard = () => {
    setStep(1)
    setDisplayName("")
    setNewInstance(null)
    setQrBase64(null)
    setQrError("")
    setCreateError("")
  }

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Connect WhatsApp</h1>
        <p className="text-sm text-muted-foreground mt-1">Link a WhatsApp number in under 30 seconds</p>
      </div>

      {/* ─── Existing instances ─────────────────────────────────────────────── */}
      {!loadingInstances && instances.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Your Connections</h2>
          <div className="space-y-2">
            {instances.map((inst) => (
              <div
                key={inst.id}
                className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", {
                    "bg-green-500": inst.status === "CONNECTED",
                    "bg-yellow-400": inst.status === "CONNECTING" || inst.status === "QR_READY",
                    "bg-zinc-500": inst.status === "DISCONNECTED",
                  })} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{inst.display_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{inst.instance_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusBadge[inst.status]} className="text-[10px] uppercase">
                    {inst.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete connection"
                    onClick={() => handleDelete(inst.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Wizard ──────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center gap-0">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                  step > s.number
                    ? "bg-primary border-primary text-primary-foreground"
                    : step === s.number
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground"
                )}>
                  {step > s.number ? <Check className="w-4 h-4" /> : s.number}
                </div>
                <span className="text-[10px] text-muted-foreground text-center whitespace-nowrap">
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mt-[-14px] mx-1 transition-colors",
                  step > s.number ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Name your connection</h2>
              <p className="text-sm text-muted-foreground mt-1">Give this WhatsApp number a recognizable name.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conn-name">Connection name</Label>
              <Input
                id="conn-name"
                placeholder="e.g. Customer Support, Sales Line"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && displayName.trim() && !creating && handleCreate()}
              />
            </div>
            {createError && (
              <p className="text-xs text-destructive">{createError}</p>
            )}
            <Button
              className="w-full gap-2"
              onClick={handleCreate}
              disabled={!displayName.trim() || creating}
            >
              {creating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              ) : (
                <><Plus className="w-4 h-4" /> Create Connection</>
              )}
            </Button>
          </div>
        )}

        {/* Step 2: QR Code */}
        {step === 2 && newInstance && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-5 text-center">
            <div>
              <h2 className="text-base font-semibold text-foreground">Scan QR Code</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Open WhatsApp &rarr; Linked Devices &rarr; Link a Device
              </p>
            </div>

            <div className="mx-auto w-64 h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 bg-muted/20 overflow-hidden">
              {qrLoading ? (
                <><Loader2 className="w-10 h-10 animate-spin text-muted-foreground/40" /><span className="text-xs text-muted-foreground">Loading QR...</span></>
              ) : qrError ? (
                <><QrCode className="w-12 h-12 text-destructive/40" /><span className="text-xs text-destructive text-center px-4">{qrError}</span></>
              ) : qrBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`} alt="WhatsApp QR Code" className="w-56 h-56 object-contain" />
              ) : (
                <><QrCode className="w-16 h-16 text-muted-foreground/40" /><span className="text-xs text-muted-foreground">No QR yet</span></>
              )}
            </div>

            {!qrLoading && (
              <div className="flex flex-col items-center gap-1">
                {countdown > 0 ? (
                  <span className="text-[10px] text-muted-foreground">Expires in {countdown}s</span>
                ) : (
                  <span className="text-[10px] text-destructive">QR code expired</span>
                )}
                <button
                  onClick={() => fetchQR(newInstance)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh QR
                </button>
              </div>
            )}

            {polling && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Waiting for connection...
              </div>
            )}

            <Button variant="outline" className="w-full" onClick={resetWizard}>
              Cancel
            </Button>
          </div>
        )}

        {/* Step 3: Connected */}
        {step === 3 && newInstance && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-5 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Connection successful!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium text-foreground">{newInstance.display_name}</span> is now connected.
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-left space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Instance name</span>
                <span className="font-mono text-foreground truncate max-w-[180px]">{newInstance.instance_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="text-green-500 font-medium">Connected</span>
              </div>
            </div>
            <Button className="w-full gap-2" variant="outline" onClick={resetWizard}>
              <Plus className="w-4 h-4" />
              Add Another Connection
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
