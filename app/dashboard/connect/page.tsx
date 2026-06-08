"use client"

import { useState, useEffect } from "react"
import { Check, RefreshCw, QrCode, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Step = 1 | 2 | 3

export default function ConnectPage() {
  const [step, setStep] = useState<Step>(1)
  const [connectionName, setConnectionName] = useState("")
  const [countdown, setCountdown] = useState(30)
  const [connectedPhone] = useState("+20 123 456 7890")

  // Countdown timer on step 2
  useEffect(() => {
    if (step !== 2) return
    setCountdown(30)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [step])

  const handleRefreshQR = () => {
    setCountdown(30)
  }

  const steps = [
    { number: 1, label: "Create Connection" },
    { number: 2, label: "Scan QR Code" },
    { number: 3, label: "Connected" },
  ]

  return (
    <div className="p-6 max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Connect WhatsApp</h1>
        <p className="text-sm text-muted-foreground mt-1">Link a WhatsApp number in under 30 seconds</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                  step > s.number
                    ? "bg-primary border-primary text-primary-foreground"
                    : step === s.number
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground"
                )}
              >
                {step > s.number ? <Check className="w-4 h-4" /> : s.number}
              </div>
              <span className="text-[10px] text-muted-foreground text-center whitespace-nowrap">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mt-[-14px] mx-1 transition-colors",
                  step > s.number ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Name input */}
      {step === 1 && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-foreground">Name your connection</h2>
            <p className="text-sm text-muted-foreground">Give this WhatsApp number a recognizable name.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="conn-name">Connection name</Label>
            <Input
              id="conn-name"
              placeholder="e.g. Customer Support, Sales Line"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
            />
          </div>
          <Button
            className="w-full gap-2"
            onClick={() => setStep(2)}
            disabled={!connectionName.trim()}
          >
            Create Connection
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Step 2: QR Code */}
      {step === 2 && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5 text-center">
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-foreground">Scan QR Code</h2>
            <p className="text-sm text-muted-foreground">
              Open WhatsApp &rarr; Linked Devices &rarr; Link a Device
            </p>
          </div>

          {/* QR placeholder */}
          <div className="mx-auto w-64 h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 bg-muted/20">
            <QrCode className="w-16 h-16 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground">QR Code</span>
            {countdown > 0 ? (
              <span className="text-[10px] text-muted-foreground">Expires in {countdown}s</span>
            ) : (
              <span className="text-[10px] text-destructive">QR code expired</span>
            )}
          </div>

          <button
            onClick={handleRefreshQR}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline mx-auto"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh QR
          </button>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button className="flex-1 gap-2" onClick={() => setStep(3)}>
              Simulate Connected
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Connected */}
      {step === 3 && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-foreground">Connection successful!</h2>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{connectionName}</span> is now connected.
            </p>
            <p className="text-sm text-primary font-medium">{connectedPhone}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-left space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Instance ID</span>
              <span className="font-mono text-foreground">550e8400-e29b</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className="text-green-500 font-medium">Connected</span>
            </div>
            <div className="flex justify-between">
              <span>Connected at</span>
              <span className="text-foreground">Just now</span>
            </div>
          </div>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              setStep(1)
              setConnectionName("")
            }}
          >
            Add Another Connection
          </Button>
        </div>
      )}
    </div>
  )
}
