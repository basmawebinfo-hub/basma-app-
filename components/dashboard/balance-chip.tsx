"use client"
import { useEffect, useState } from "react"
import { Wallet } from "lucide-react"

export function BalanceChip() {
  const [bal, setBal] = useState<number | null>(null)
  const [plan, setPlan] = useState<string>("")
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  useEffect(() => {
    const load = () => fetch("/api/me").then(r=>r.json()).then(d=>{ setBal(d.balance ?? 0); setPlan(d.plan_name ?? ""); setDaysLeft(d.days_left ?? null) }).catch(()=>{})
    load(); const t = setInterval(load, 30000); return () => clearInterval(t)
  }, [])
  if (bal === null) return null
  const low = daysLeft !== null && daysLeft <= 5
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 text-sm">
      <Wallet className="w-4 h-4 text-primary" />
      <span className="font-medium">${Number(bal).toFixed(2)}</span>
      {plan && plan !== "—" && <span className="text-xs text-muted-foreground">• {plan}</span>}
      {daysLeft !== null && (
        <span className={"text-xs " + (low ? "text-red-500 font-medium" : "text-muted-foreground")}>
          • {daysLeft} {daysLeft === 1 ? "day" : "days"} left
        </span>
      )}
    </div>
  )
}
