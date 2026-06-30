"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  MessageSquare, Users, CheckCircle2, Clock, Loader2,
  Plug, Webhook, Inbox, BookOpen, FlaskConical, GraduationCap,
  ArrowUpRight, Activity, Bot, Star, History, Wrench, TrendingUp,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"
import { SmartChecklist } from "@/components/dashboard/smart-checklist"
import { WidgetContainer } from "@/components/dashboard/widget-container"
import { WidgetPlaceholder } from "@/components/dashboard/widget-placeholder"
import { UsageWidget } from "@/components/dashboard/usage-widget"

interface DashboardStats {
  messages_today: number
  active_chats: number
  webhook_success_rate: number
  avg_reply_time: string
  messages_week: { day: string; messages: number }[]
  recent_events: { event: string; dest: string; status: string; time: string; code: number }[]
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default", failed: "destructive", retrying: "secondary", pending: "secondary",
}

const EMPTY_STATS: DashboardStats = {
  messages_today: 0, active_chats: 0, webhook_success_rate: 100, avg_reply_time: "—",
  messages_week: [
    { day: "Sun", messages: 0 }, { day: "Mon", messages: 0 }, { day: "Tue", messages: 0 },
    { day: "Wed", messages: 0 }, { day: "Thu", messages: 0 }, { day: "Fri", messages: 0 }, { day: "Sat", messages: 0 },
  ],
  recent_events: [],
}

export default function DashboardOverview() {
  const { t } = useI18n()
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => { if (!r.ok) throw new Error("Failed to load stats"); return r.json() })
      .then((d) => { if (d && typeof d === "object" && !d.error) setStats({ ...EMPTY_STATS, ...d }) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const STAT_CARDS = [
    { labelKey: "dash.msgToday", value: stats.messages_today.toLocaleString(), icon: MessageSquare, deltaKey: "dash.msgTodayD", color: "text-[#58a68d]", bg: "bg-[#58a68d]/10" },
    { labelKey: "dash.activeChats", value: stats.active_chats.toString(), icon: Users, deltaKey: "dash.activeChatsD", color: "text-[#4f86c6]", bg: "bg-[#4f86c6]/10" },
    { labelKey: "dash.webhookSuccess", value: stats.webhook_success_rate + "%", icon: CheckCircle2, deltaKey: "dash.webhookSuccessD", color: "text-[#e9c46a]", bg: "bg-[#e9c46a]/10" },
    { labelKey: "dash.avgReply", value: stats.avg_reply_time, icon: Clock, deltaKey: "dash.avgReplyD", color: "text-[#8e7cc3]", bg: "bg-[#8e7cc3]/10" },
  ]

  const QUICK = [
    { key: "dash.qaConnect",  href: "/dashboard/connect",  icon: Plug },
    { key: "dash.qaInbox",    href: "/dashboard/inbox",    icon: Inbox },
    { key: "dash.qaWebhook",  href: "/dashboard/webhooks", icon: Webhook },
    { key: "dash.qaLab",      href: "/dashboard/lab",      icon: FlaskConical },
    { key: "dash.qaAcademy",  href: "/dashboard/academy",  icon: GraduationCap },
    { key: "dash.qaDocs",     href: "/dashboard/docs",     icon: BookOpen },
  ]

  // Placeholder labels (passed into WidgetPlaceholder; localized via t()).
  const placeholderLabels = {
    phaseLabel: t("widget.phase2"),   // localized "Coming in Phase 2"
    tierLabel: t("widget.tierPro"),   // localized "Available on Pro"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <header className="space-y-1 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {t("dash.welcome")} 👋
        </h1>
        <p className="text-sm text-muted-foreground">{t("dash.subtitle")}</p>
      </header>

      {/*
        ────────────────────────────────────────────────────────────
        FINAL DASHBOARD GRID — locked layout.
        Adding a widget = drop a new <div className="lg:col-span-N">
        into one of the rows below. No reflow of existing widgets.
        ────────────────────────────────────────────────────────────
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

        {/* Row 1 — Smart Checklist (auto-hides when done) */}
        <div className="lg:col-span-12">
          <SmartChecklist />
        </div>

        {/* Row 2 — Stats (4 cards) */}
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.labelKey} className="md:col-span-1 lg:col-span-3">
              <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 transition-all duration-150 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">{t(stat.labelKey)}</span>
                  <span className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{t(stat.deltaKey)}</p>
              </div>
            </div>
          )
        })}

        {/* Row 3 — Usage (7) + AI Agent Status (5, future) */}
        <div className="lg:col-span-7">
          <UsageWidget />
        </div>
        <div className="lg:col-span-5">
          <WidgetPlaceholder
            title={t("dash.aiStatus.title")}
            description={t("dash.aiStatus.description")}
            icon={Bot}
            phase={3}
            pitch={t("dash.aiStatus.pitch")}
            labels={placeholderLabels}
          />
        </div>

        {/* Row 4 — Quick Actions (full) */}
        <div className="lg:col-span-12">
          <WidgetContainer
            title={t("dash.quickActions")}
            icon={Wrench}
            minBodyHeight={0}
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 p-5">
              {QUICK.map((q) => {
                const Icon = q.icon
                return (
                  <Link
                    key={q.key}
                    href={q.href}
                    className="flex items-center gap-3 bg-background/40 border border-border rounded-xl p-4 transition-all duration-150 hover:border-primary/40 hover:bg-background/70 hover:-translate-y-px group"
                  >
                    <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-150">
                      <Icon className="w-4 h-4 text-primary" />
                    </span>
                    <span className="text-sm font-medium text-foreground flex-1">{t(q.key)}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150" />
                  </Link>
                )
              })}
            </div>
          </WidgetContainer>
        </div>

        {/* Row 5 — Continue Learning (7) + Automation Health (5, future) */}
        <div className="lg:col-span-7">
          <WidgetPlaceholder
            title={t("dash.continueLearning.title")}
            description={t("dash.continueLearning.description")}
            icon={GraduationCap}
            phase={2}
            pitch={t("dash.continueLearning.pitch")}
            labels={placeholderLabels}
          />
        </div>
        <div className="lg:col-span-5">
          <WidgetPlaceholder
            title={t("dash.automation.title")}
            description={t("dash.automation.description")}
            icon={TrendingUp}
            phase={3}
            pitch={t("dash.automation.pitch")}
            labels={placeholderLabels}
          />
        </div>

        {/* Row 6 — Recent Work (7) + Featured (5) */}
        <div className="lg:col-span-7">
          <WidgetPlaceholder
            title={t("dash.recentWork.title")}
            description={t("dash.recentWork.description")}
            icon={History}
            phase={2}
            pitch={t("dash.recentWork.pitch")}
            labels={placeholderLabels}
          />
        </div>
        <div className="lg:col-span-5">
          <WidgetPlaceholder
            title={t("dash.featured.title")}
            description={t("dash.featured.description")}
            icon={Star}
            phase={2}
            pitch={t("dash.featured.pitch")}
            labels={placeholderLabels}
          />
        </div>

        {/* Row 7 — Messages chart (full) */}
        <div className="lg:col-span-12">
          <WidgetContainer
            title={t("dash.chartTitle")}
            icon={MessageSquare}
            minBodyHeight={0}
          >
            {stats.messages_week.some((d) => d.messages > 0) ? (
              <div className="p-5">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats.messages_week} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" />
                    <XAxis dataKey="day" tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.11 0 0)", border: "1px solid oklch(0.2 0 0)",
                        borderRadius: "8px", fontSize: "12px",
                      }}
                      labelStyle={{ color: "oklch(0.95 0 0)" }}
                      itemStyle={{ color: "oklch(0.92 0.16 125)" }}
                    />
                    <Line
                      type="monotone" dataKey="messages"
                      stroke="oklch(0.92 0.16 125)" strokeWidth={2}
                      dot={{ fill: "oklch(0.92 0.16 125)", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] gap-3 text-muted-foreground py-8">
                <div className="w-12 h-12 rounded-2xl bg-secondary/40 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 opacity-40" />
                </div>
                <p className="text-sm text-foreground/80">{t("dash.noMsg")}</p>
                <p className="text-xs">{t("dash.noMsgHint")}</p>
              </div>
            )}
          </WidgetContainer>
        </div>

        {/* Row 8 — Recent Activity (full) */}
        <div className="lg:col-span-12">
          <WidgetContainer
            title={t("dash.activity.title")}
            icon={Activity}
            minBodyHeight={0}
          >
            {!stats.recent_events.length ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] gap-3 text-muted-foreground py-8">
                <div className="w-12 h-12 rounded-2xl bg-secondary/40 flex items-center justify-center">
                  <Webhook className="w-6 h-6 opacity-40" />
                </div>
                <p className="text-sm">{t("dash.noEvents")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20">
                      <th className="text-start px-6 py-3 text-xs text-muted-foreground font-medium">{t("dash.colEvent")}</th>
                      <th className="text-start px-6 py-3 text-xs text-muted-foreground font-medium">{t("dash.colDest")}</th>
                      <th className="text-start px-6 py-3 text-xs text-muted-foreground font-medium">{t("dash.colStatus")}</th>
                      <th className="text-start px-6 py-3 text-xs text-muted-foreground font-medium">{t("dash.colCode")}</th>
                      <th className="text-start px-6 py-3 text-xs text-muted-foreground font-medium">{t("dash.colTime")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_events.map((ev, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors duration-150">
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
          </WidgetContainer>
        </div>

        {/* Inline error banner — spans the full grid */}
        {error && (
          <div className="lg:col-span-12">
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
