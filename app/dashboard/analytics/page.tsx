"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// 30 days of message data
const LINE_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  messages: Math.floor(600 + Math.random() * 800 + Math.sin(i / 3) * 200),
}))

// Messages by hour 0–23
const BAR_DATA = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}:00`,
  messages: Math.floor(
    h >= 9 && h <= 21
      ? 80 + Math.random() * 120 + (h === 12 || h === 19 ? 80 : 0)
      : 5 + Math.random() * 20
  ),
}))

const PIE_DATA = [
  { name: "Text", value: 65 },
  { name: "Image", value: 20 },
  { name: "Audio", value: 10 },
  { name: "Other", value: 5 },
]

const PIE_COLORS = [
  "oklch(0.92 0.16 125)",
  "oklch(0.75 0.14 125)",
  "oklch(0.55 0.1 125)",
  "oklch(0.4 0.04 125)",
]

const TOP_CONTACTS = [
  { name: "Ahmed Mohamed", phone: "+20 123 456 7890", count: 284, last: "Just now" },
  { name: "Fatima Al-Rashid", phone: "+966 50 123 4567", count: 201, last: "3m ago" },
  { name: "James Wilson", phone: "+44 7911 123456", count: 178, last: "12m ago" },
  { name: "Nour Hassan", phone: "+20 100 987 6543", count: 155, last: "1h ago" },
  { name: "Carlos Rivera", phone: "+52 55 1234 5678", count: 142, last: "2h ago" },
  { name: "Yuki Tanaka", phone: "+81 90 1234 5678", count: 118, last: "3h ago" },
  { name: "Sara Al-Omari", phone: "+962 79 123 4567", count: 97, last: "5h ago" },
  { name: "Marc Dubois", phone: "+33 6 12 34 56 78", count: 84, last: "8h ago" },
  { name: "Priya Sharma", phone: "+91 98765 43210", count: 71, last: "12h ago" },
  { name: "Lucas Oliveira", phone: "+55 11 91234 5678", count: 60, last: "1d ago" },
]

const tooltipStyle = {
  backgroundColor: "oklch(0.11 0 0)",
  border: "1px solid oklch(0.2 0 0)",
  borderRadius: "8px",
  fontSize: "11px",
}

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Message volume, patterns, and top contacts</p>
      </div>

      {/* Row 1: Line + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30-day line chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Messages — Last 30 days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={LINE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" />
              <XAxis
                dataKey="day"
                tick={{ fill: "oklch(0.5 0 0)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: "oklch(0.5 0 0)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "oklch(0.95 0 0)" }}
                itemStyle={{ color: "oklch(0.92 0.16 125)" }}
              />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="oklch(0.92 0.16 125)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly bar chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Messages by Hour of Day</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BAR_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" />
              <XAxis
                dataKey="hour"
                tick={{ fill: "oklch(0.5 0 0)", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fill: "oklch(0.5 0 0)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "oklch(0.95 0 0)" }}
                itemStyle={{ color: "oklch(0.92 0.16 125)" }}
              />
              <Bar dataKey="messages" fill="oklch(0.92 0.16 125)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Pie + Top contacts table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Message Type Breakdown</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {PIE_DATA.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value}%`]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {PIE_DATA.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i] }}
                  />
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                  <span className="text-xs font-medium text-foreground ml-auto">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top contacts */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Top 10 Active Contacts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2 text-[10px] text-muted-foreground font-medium">#</th>
                  <th className="text-left px-4 py-2 text-[10px] text-muted-foreground font-medium">Name</th>
                  <th className="text-left px-4 py-2 text-[10px] text-muted-foreground font-medium">Messages</th>
                  <th className="text-left px-4 py-2 text-[10px] text-muted-foreground font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {TOP_CONTACTS.map((c, i) => (
                  <tr key={c.phone} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2 text-xs text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2">
                      <p className="text-xs font-medium text-foreground truncate max-w-[110px]">{c.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{c.phone}</p>
                    </td>
                    <td className="px-4 py-2 text-xs font-semibold text-primary">{c.count}</td>
                    <td className="px-4 py-2 text-[10px] text-muted-foreground">{c.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
