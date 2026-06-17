"use client"
import { useEffect, useState } from "react"
import { Wallet } from "lucide-react"

export function BalanceChip() {
  const [bal, setBal] = useState<number | null>(null)
  const [plan, setPlan] = useState<string>("")
  useEffect(() => {
    const load = () => fetch("/api/me").then(r=>r.json()).then(d=>{ setBal(d.balance ?? 0); setPlan(d.plan_name ?? "") }).catch(()=>{})
    load(); const t = setInterval(load, 30000); return () => clearInterval(t)
  }, [])
  if (bal === null) return null
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 text-sm">
      <Wallet className="w-4 h-4 text-primary" />
      <span className="font-medium">${Number(bal).toFixed(2)}</span>
      {plan && plan !== "—" && <span className="text-xs text-muted-foreground">• {plan}</span>}
    </div>
  )
}
