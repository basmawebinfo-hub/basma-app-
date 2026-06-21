"use client"
import { useEffect, useState } from "react"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2, MessageSquare, Send, Inbox } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface Data {
  line: { day: string; messages: number }[]
  byHour: { hour: string; messages: number }[]
  byType: { name: string; value: number }[]
  topContacts: { phone: string; count: number; last: string }[]
  totals: { total: number; sent: number; received: number }
}
const COLORS = ["#58a68d", "#4f86c6", "#e9c46a", "#e07a5f", "#8e7cc3", "#6c757d"]

export default function AnalyticsPage() {
  const { t } = useI18n()
  const [d, setD] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/analytics").then(r=>r.json()).then(setD).finally(()=>setLoading(false)) }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>
  if (!d) return <div className="p-6 text-destructive">{t("an.loadError")}</div>

  const empty = d.totals.total === 0
  const cards = [
    { label: t("an.total"), value: d.totals.total, icon: MessageSquare },
    { label: t("an.sent"), value: d.totals.sent, icon: Send },
    { label: t("an.received"), value: d.totals.received, icon: Inbox },
  ]

  return (
    <div className="p-6 space-y-6" >
      <div>
        <h1 className="text-2xl font-bold">{t("an.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("an.subtitle")}</p>
      </div>

      {empty ? (
        <div className="rounded-xl border border-border bg-card/50 p-10 text-center text-muted-foreground">
          {t("an.empty")}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map(c => (
              <div key={c.label} className="rounded-xl border border-border bg-card/50 p-5">
                <div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">{c.label}</span><c.icon className="w-5 h-5 text-primary" /></div>
                <div className="text-2xl font-bold">{c.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-4">{t("an.last30")}</h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={d.line}><CartesianGrid strokeDasharray="3 3" opacity={0.1} /><XAxis dataKey="day" tick={{fontSize:10}} interval={4} /><YAxis tick={{fontSize:11}} /><Tooltip /><Line type="monotone" dataKey="messages" stroke="#58a68d" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-4">{t("an.byHour")}</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={d.byHour}><XAxis dataKey="hour" tick={{fontSize:9}} interval={2} /><YAxis tick={{fontSize:11}} /><Tooltip /><Bar dataKey="messages" fill="#58a68d" radius={[4,4,0,0]} /></BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-4">{t("an.types")}</h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart><Pie data={d.byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{d.byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-4">{t("an.topContacts")}</h2>
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {d.topContacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b border-border/30 pb-2">
                    <span className="text-muted-foreground">{c.phone}</span>
                    <span className="font-medium">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
