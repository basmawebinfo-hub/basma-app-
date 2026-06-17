"use client"
import { useEffect, useState } from "react"
import { Users, Server, MessageSquare, Wallet, Loader2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

interface Stats {
  total_users: number; suspended_users: number
  total_instances: number; connected_instances: number
  total_messages: number; messages_today: number
  total_balance: number; webhook_success_rate: number
  messages_week: { day: string; count: number }[]
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/stats").then((r) => r.json()).then(setStats).finally(() => setLoading(false)) }, [])
  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>
  if (!stats) return <div className="p-8 text-destructive">Failed to load stats</div>

  const cards = [
    { label: "Users", value: stats.total_users, sub: stats.suspended_users + " suspended", icon: Users },
    { label: "Active Connections", value: stats.connected_instances + " / " + stats.total_instances, sub: "connected / total", icon: Server },
    { label: "Messages Today", value: stats.messages_today, sub: stats.total_messages + " total", icon: MessageSquare },
    { label: "Total Balance", value: Number(stats.total_balance).toFixed(2), sub: "Webhooks " + stats.webhook_success_rate + "%", icon: Wallet },
  ]
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-muted-foreground">{c.label}</span><c.icon className="w-5 h-5 text-primary" /></div>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-border bg-card/50 p-5">
        <h2 className="text-sm font-semibold mb-4">Messages — Last 7 days</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.messages_week}><XAxis dataKey="day" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#58a68d" radius={[6, 6, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
