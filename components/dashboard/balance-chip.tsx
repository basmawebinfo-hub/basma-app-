"use client"
import { useEffect, useState } from "react"
import { Wallet, Sparkles, AlertTriangle } from "lucide-react"

export function BalanceChip() {
  const [data, setData] = useState<{
    balance: number; plan: string | null; days_left: number | null
    is_trial: boolean; past_due: boolean; max_instances: number | null; numbers_used: number
  } | null>(null)

  useEffect(() => {
    const load = () => fetch("/api/my-subscription").then((r) => r.json()).then((d) => {
      setData({
        balance: d.balance ?? 0, plan: d.plan ?? null, days_left: d.days_left ?? null,
        is_trial: !!d.is_trial, past_due: !!d.past_due,
        max_instances: d.max_instances ?? null, numbers_used: d.numbers_used ?? 0,
      })
    }).catch(() => {})
    load(); const t = setInterval(load, 30000); return () => clearInterval(t)
  }, [])

  if (!data) return null
  const low = data.days_left !== null && data.days_left <= 5

  // Past due -> renewal warning
  if (data.past_due) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-500 text-sm font-medium">
        <AlertTriangle className="w-4 h-4" /> يلزم تجديد الرصيد
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 text-sm">
      {data.is_trial ? (
        <span className="flex items-center gap-1.5 text-primary font-medium"><Sparkles className="w-4 h-4" /> تجريبي{data.days_left !== null ? ` - ${data.days_left} يوم` : ""}</span>
      ) : (
        <>
          <Wallet className="w-4 h-4 text-primary" />
          <span className="font-medium">${Number(data.balance).toFixed(2)}</span>
          {data.plan && data.plan !== "—" && <span className="text-xs text-muted-foreground">• {data.plan}</span>}
          {data.max_instances !== null && <span className="text-xs text-muted-foreground">• {data.numbers_used}/{data.max_instances} رقم</span>}
          {data.days_left !== null && <span className={"text-xs " + (low ? "text-red-500 font-medium" : "text-muted-foreground")}>• {data.days_left} يوم متبقي</span>}
        </>
      )}
    </div>
  )
}
