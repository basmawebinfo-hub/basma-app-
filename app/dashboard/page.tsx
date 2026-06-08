"use client"

import { MessageSquare, Users, CheckCircle2, Clock } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Badge } from "@/components/ui/badge"

const STATS = [
  { label: "Messages Today", value: "1,284", icon: MessageSquare, delta: "+12%" },
  { label: "Active Chats", value: "47", icon: Users, delta: "+5" },
  { label: "Webhook Success", value: "98.2%", icon: CheckCircle2, delta: "last 24h" },
  { label: "Avg. Reply Time", value: "1.4 min", icon: Clock, delta: "-8%" },
]

const CHART_DATA = [
  { day: "Mon", messages: 820 },
  { day: "Tue", messages: 1050 },
  { day: "Wed", messages: 940 },
  { day: "Thu", messages: 1180 },
  { day: "Fri", messages: 1284 },
  { day: "Sat", messages: 760 },
  { day: "Sun", messages: 630 },
]

const RECENT_EVENTS = [
  { event: "MESSAGE_RECEIVED", dest: "n8n workflow", status: "success", time: "Just now", code: 200 },
  { event: "MESSAGE_STATUS", dest: "Zapier", status: "success", time: "1m ago", code: 200 },
  { event: "MESSAGE_RECEIVED", dest: "https://api.client.com/wh", status: "success", time: "2m ago", code: 200 },
  { event: "CALL", dest: "Make", status: "failed", time: "5m ago", code: 500 },
  { event: "MESSAGE_RECEIVED", dest: "n8n workflow", status: "retrying", time: "8m ago", code: 503 },
  { event: "CONTACT_UPDATED", dest: "HubSpot CRM", status: "success", time: "10m ago", code: 200 },
  { event: "MESSAGE_RECEIVED", dest: "Slack", status: "success", time: "12m ago", code: 200 },
  { event: "MESSAGE_STATUS", dest: "Airtable", status: "success", time: "15m ago", code: 200 },
  { event: "CHAT_UPDATED", dest: "Google Sheets", status: "success", time: "18m ago", code: 200 },
  { event: "MESSAGE_RECEIVED", dest: "Zapier", status: "success", time: "20m ago", code: 200 },
]

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  failed: "destructive",
  retrying: "secondary",
}

export default function DashboardOverview() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Your WhatsApp platform at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
            >
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
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={CHART_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.11 0 0)",
                border: "1px solid oklch(0.2 0 0)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "oklch(0.95 0 0)" }}
              itemStyle={{ color: "oklch(0.92 0.16 125)" }}
            />
            <Line
              type="monotone"
              dataKey="messages"
              stroke="oklch(0.92 0.16 125)"
              strokeWidth={2}
              dot={{ fill: "oklch(0.92 0.16 125)", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent delivery events */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent Webhook Events</h2>
        </div>
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
              {RECENT_EVENTS.map((ev, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-foreground">{ev.event}</td>
                  <td className="px-6 py-3 text-xs text-muted-foreground max-w-[180px] truncate">{ev.dest}</td>
                  <td className="px-6 py-3">
                    <Badge variant={statusVariant[ev.status]} className="text-[10px] uppercase tracking-wide">
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
      </div>
    </div>
  )
}
