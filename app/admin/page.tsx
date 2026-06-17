"use client"
import { useEffect, useState } from "react"
import { Users, Server, MessageSquare, Wallet, Loader2 } from "lucide-react"

interface Stats {
  total_users: number; suspended_users: number
  total_instances: number; connected_instances: number
  total_messages: number; messages_today: number
  total_balance: number; webhook_success_rate: number
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then((d) => setStats(d)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>
  if (!stats) return <div className="p-8 text-destructive">تعذّر تحميل الإحصائيات</div>

  const cards = [
    { label: "المستخدمين", value: stats.total_users, sub: stats.suspended_users + " موقوف", icon: Users },
    { label: "الاتصالات النشطة", value: stats.connected_instances + " / " + stats.total_instances, sub: "متصل / إجمالي", icon: Server },
    { label: "رسائل اليوم", value: stats.messages_today, sub: stats.total_messages + " إجمالي", icon: MessageSquare },
    { label: "إجمالي الأرصدة", value: Number(stats.total_balance).toFixed(2), sub: "نجاح Webhooks " + stats.webhook_success_rate + "%", icon: Wallet },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">نظرة عامة على المنصة</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
