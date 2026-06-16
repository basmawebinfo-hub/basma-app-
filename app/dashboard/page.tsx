"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Users, CheckCircle2, Clock, Loader2 } from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
import { Badge } from "@/components/ui/badge"

interface DashboardStats {
  messages_today: number
  active_chats: number
  webhook_success_rate: number
  avg_reply_time: string
  messages_week: { day: string; messages: number }[]
  recent_events: {
    event: string
    dest: string
    status: string
    time: string
    code: number
  }[]
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  failed: "destructive",
  retrying: "secondary",
  pending: "secondary",
}

const EMPTY_STATS: DashboardStats = {
  messages_today: 0,
  active_chats: 0,
  webhook_success_rate: 100,
  avg_reply_time: "—",
  messages_week: [
    { day: "Sun", messages: 0 },
    { day: "Mon", messages: 0 },
    { day: "Tue", messages: 0 },
    { day: "Wed", messages: 0 },
    { day: "Thu", messages: 0 },
    { day: "Fri", messages: 0 },
    { day: "Sat", messages: 0 },
  ],
  recent_events: [],
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load stats")
        return r.json()
      })
      .then((d) => {
        if (d && typeof d === "object" && !d.error) {
          setStats({ ...EMPTY_STATS, ...d })
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const STAT_CARDS = [
    { label: "Messages Today",   value: stats.messages_today.toLocaleString(), icon: MessageSquare, delta: "last 24h" },
    { label: "Active Chats",     value: stats.active_chats.toString(),          icon: Users,         delta: "open conversations" },
    { label: "Webhook Success",  value: stats.webhook_success_rate + "%",       icon: CheckCircle2,  delta: "last 24h" },
    { label: "Avg. Reply Time",  value: stats.avg_reply_time,                   icon: Clock,         delta: "estimated" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Your WhatsApp platform at a glance</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
          <p className="text-xs text-destructive">Could not load stats: {error}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.delta}</p>
            </div>
          )
        })}
      </div>

      {/* Line chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Messages — Last 7 days</h2>
        {stats.messages_week.some((d) => d.messages > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.messages_week} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" />
              <XAxis dataKey="day" tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "oklch(0.11 0 0)", border: "1px solid oklch(0.2 0 0)", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "oklch(0.95 0 0)" }}
                itemStyle={{ color: "oklch(0.92 0.16 125)" }}
              />
              <Line type="monotone" dataKey="messages" stroke="oklch(0.92 0.16 125)" strokeWidth={2} dot={{ fill: "oklch(0.92 0.16 125)", r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-muted-foreground">
            <MessageSquare className="w-10 h-10 opacity-20" />
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs">Connect a WhatsApp number and start messaging.</p>
          </div>
        )}
      </div>

      {/* Recent webhook events */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent Webhook Events</h2>
        </div>
        {!stats.recent_events.length ? (
          <p className="text-xs text-muted-foreground px-6 py-8">
            No webhook events yet. Configure a webhook destination in the Webhooks tab.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium">Event</th>
                  <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium">Destination</th>
                  <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium">Code</th>
                  <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_events.map((ev, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-foreground">{ev.event}</td>
                    <td className="px-6 py-3 text-xs text-muted-foreground max-w-[180px] truncate">{ev.dest}</td>
                    <td className="px-6 py-3">
                      <Badge variant={statusVariant[ev.status] ?? "secondary"} className="text-[10px] uppercase tracking-wide">
                        {ev.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{ev.code}</td>
                    <td className="px-6 py-3 text-xs text-muted-foreground">{ev.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
