"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search, Download } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface AdminUser {
  id: string
  email: string | null
  full_name: string | null
  role: string
  status: string
  balance: number
  whatsapp: string | null
  plan_name: string | null
  requested_plan: string | null
  is_custom_limit?: boolean
  effective_max_instances?: number
  days_left: number | null
  instances_total: number
  instances_connected: number
  messages_sent: number
  messages_received: number
  avatar_url?: string | null
  is_trial?: boolean
  trial_day?: number | null
}

export default function AdminUsers() {
  const { t } = useI18n()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(d.users ?? [])).finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = !q || (u.email ?? "").toLowerCase().includes(q) || (u.full_name ?? "").toLowerCase().includes(q)
    const matchStatus = statusFilter === "all" || u.status === statusFilter
    return matchSearch && matchStatus
  })

  function exportCSV() {
    const headers = ["email", "full_name", "whatsapp", "role", "status", "plan_name", "balance", "instances_total", "messages_sent", "messages_received"]
    const rows = filtered.map((u) => headers.map((h) => JSON.stringify((u as Record<string, unknown>)[h] ?? "")).join(","))
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "basma-users.csv"; a.click(); URL.revokeObjectURL(url)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t("au.title")}</h1>
        <span className="text-sm text-muted-foreground">{filtered.length} / {users.length} users</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input placeholder=t("au.search") value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm">
          <option value="all">{t("au.allStatuses")}</option>
          <option value="pending">{t("au.pending")}</option>
          <option value="active">{t("au.active")}</option>
          <option value="suspended">{t("au.suspended")}</option>
        </select>
        <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted/40"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      <p className="text-xs text-muted-foreground mb-3">Click on any user to open their full profile and manage them.</p>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-muted-foreground">
            <tr className="text-left">
              <th className="p-3 font-medium">{t("au.colUser")}</th>
              <th className="p-3 font-medium">{t("au.colStatus")}</th>
              <th className="p-3 font-medium">{t("au.colPlan")}</th>
              <th className="p-3 font-medium">{t("au.colBalance")}</th>
              <th className="p-3 font-medium">{t("au.colConn")}</th>
              <th className="p-3 font-medium">{t("au.colMsgs")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} onClick={() => router.push("/admin/users/" + u.id)} className="border-t border-border/40 hover:bg-card/30 cursor-pointer">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">{u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.full_name || u.email || "?").slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div className="font-medium">{u.email ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.full_name} {u.role !== "user" && "• " + u.role}</div>
                      {u.whatsapp && <a href={"https://wa.me/" + (u.whatsapp || "").replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-green-600 hover:underline">{u.whatsapp}</a>}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className={"px-2 py-0.5 rounded-full text-xs " + (u.status === "active" ? "bg-green-500/15 text-green-600" : u.status === "pending" ? "bg-amber-500/15 text-amber-600" : "bg-red-500/15 text-red-600")}>{u.status}</span>
                </td>
                <td className="p-3">
                  <div>{u.is_custom_limit ? "Custom" : (u.plan_name ?? "—")}</div>
                  <div className="text-xs text-muted-foreground">{u.effective_max_instances ?? "—"} numbers allowed</div>
                  {u.is_trial && u.trial_day ? <div className="text-xs text-primary">Trial - Day {u.trial_day}</div> : (u.days_left !== null && u.days_left !== undefined && <div className={"text-xs " + ((u.days_left ?? 0) <= 5 ? "text-red-500" : "text-muted-foreground")}>{u.days_left} days left</div>)}
                  {u.requested_plan && <div className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-600 font-medium">wants: {u.requested_plan}</div>}
                </td>
                <td className="p-3 font-medium">${Number(u.balance).toFixed(2)}</td>
                <td className="p-3">{u.instances_connected}/{u.instances_total}</td>
                <td className="p-3">{u.messages_sent} / {u.messages_received}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}