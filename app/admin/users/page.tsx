"use client"
import { useEffect, useState } from "react"
import { Loader2, Ban, CheckCircle, Wallet, MinusCircle, Bell, Trash2, Settings2, X, Search, Download, CreditCard, KeyRound, UserCheck } from "lucide-react"

interface AdminUser {
  id: string
  email: string | null
  full_name: string | null
  role: string
  status: string
  balance: number
  max_instances: number
  max_messages: number
  whatsapp: string | null
  plan_name: string | null
  plan_id: string | null
  requested_plan: string | null
  days_left: number | null
  custom_max_instances?: number | null
  instances_total: number
  instances_connected: number
  messages_sent: number
  messages_received: number
}

interface Plan { id: string; name: string; max_instances: number; price_monthly: number }

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [modal, setModal] = useState<{ type: string; user: AdminUser } | null>(null)
  const [input, setInput] = useState("")
  const [input2, setInput2] = useState("")
  const [selPlan, setSelPlan] = useState("")
  const [input3, setInput3] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const load = () => {
    setLoading(true)
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(d.users ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])
  useEffect(() => { fetch("/api/admin/plans").then((r) => r.json()).then((d) => setPlans(d.plans ?? [])).catch(() => {}) }, [])

  async function act(userId: string, action: string, payload: Record<string, unknown> = {}) {
    setBusy(userId)
    try {
      const r = await fetch("/api/admin/users/" + userId + "/action", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...payload }),
      })
      if (!r.ok) { const e = await r.json(); alert(e.error ?? "Failed") }
      setModal(null); setInput(""); setInput2(""); setInput3(""); setSelPlan(""); load()
    } finally { setBusy(null) }
  }

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
        <h1 className="text-2xl font-bold">User Management</h1>
        <span className="text-sm text-muted-foreground">{filtered.length} / {users.length} users</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input placeholder="Search by email or name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted/40"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-muted-foreground">
            <tr className="text-left">
              <th className="p-3 font-medium">User</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Plan</th>
              <th className="p-3 font-medium">Balance</th>
              <th className="p-3 font-medium">Conn.</th>
              <th className="p-3 font-medium">Msgs (out/in)</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-border/40 hover:bg-card/30">
                <td className="p-3">
                  <div className="font-medium">{u.email ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.full_name} {u.role !== "user" && "• " + u.role}</div>
                  {u.whatsapp && <a href={"https://wa.me/" + (u.whatsapp || "").replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">{u.whatsapp}</a>}
                </td>
                <td className="p-3">
                  <span className={"px-2 py-0.5 rounded-full text-xs " + (u.status === "active" ? "bg-green-500/15 text-green-600" : u.status === "pending" ? "bg-amber-500/15 text-amber-600" : "bg-red-500/15 text-red-600")}>{u.status}</span>
                </td>
                <td className="p-3">
                  <div>{u.plan_name ?? "—"}</div>
                  {u.days_left !== null && u.days_left !== undefined && <div className={"text-xs " + ((u.days_left ?? 0) <= 5 ? "text-red-500" : "text-muted-foreground")}>{u.days_left} days left</div>}
                  {u.requested_plan && <div className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-600 font-medium">wants: {u.requested_plan}</div>}
                </td>
                <td className="p-3 font-medium">${Number(u.balance).toFixed(2)}</td>
                <td className="p-3">{u.instances_connected}/{u.instances_total}</td>
                <td className="p-3">{u.messages_sent} / {u.messages_received}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    {u.status === "pending" ? (
                      <button title="Approve" disabled={busy === u.id} onClick={() => act(u.id, "approve")} className="p-1.5 rounded-md hover:bg-green-500/15 text-green-600"><UserCheck className="w-4 h-4" /></button>
                    ) : u.status === "active" ? (
                      <button title="Suspend" disabled={busy === u.id} onClick={() => act(u.id, "suspend")} className="p-1.5 rounded-md hover:bg-red-500/15 text-red-600"><Ban className="w-4 h-4" /></button>
                    ) : (
                      <button title="Activate" disabled={busy === u.id} onClick={() => act(u.id, "activate")} className="p-1.5 rounded-md hover:bg-green-500/15 text-green-600"><CheckCircle className="w-4 h-4" /></button>
                    )}
                    <button title="Top up" onClick={() => setModal({ type: "topup", user: u })} className="p-1.5 rounded-md hover:bg-primary/15 text-primary"><Wallet className="w-4 h-4" /></button>
                    <button title="Deduct balance" onClick={() => setModal({ type: "debit", user: u })} className="p-1.5 rounded-md hover:bg-red-500/15 text-red-600"><MinusCircle className="w-4 h-4" /></button>
                    <button title="Notify" onClick={() => setModal({ type: "notify", user: u })} className="p-1.5 rounded-md hover:bg-blue-500/15 text-blue-600"><Bell className="w-4 h-4" /></button>
                    <button title="Limits" onClick={() => setModal({ type: "limits", user: u })} className="p-1.5 rounded-md hover:bg-muted text-foreground"><Settings2 className="w-4 h-4" /></button>
                    <button title="Change plan" onClick={() => { setSelPlan(u.plan_id ?? ""); setModal({ type: "plan", user: u }) }} className="p-1.5 rounded-md hover:bg-amber-500/15 text-amber-600"><CreditCard className="w-4 h-4" /></button>
                    <button title="Reset password" onClick={() => setModal({ type: "password", user: u })} className="p-1.5 rounded-md hover:bg-orange-500/15 text-orange-600"><KeyRound className="w-4 h-4" /></button>
                    <button title="Delete" onClick={() => { if (confirm("Delete this user permanently?")) act(u.id, "delete") }} className="p-1.5 rounded-md hover:bg-red-500/15 text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="bg-card border border-border rounded-xl p-6 w-[400px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {modal.type === "topup" && "Top up balance"}
                {modal.type === "debit" && "Deduct balance"}
                {modal.type === "notify" && "Send notification"}
                {modal.type === "password" && "Reset password"}
                {modal.type === "plan" && "Change plan"}
                {modal.type === "limits" && "Edit limits"}
              </h3>
              <button onClick={() => setModal(null)}><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{modal.user.email}</p>

            {modal.type === "topup" && (
              <>
                <input type="number" placeholder="Amount ($)" value={input} onChange={(e) => setInput(e.target.value)} className="w-full mb-2 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <input placeholder="Reason (optional)" value={input2} onChange={(e) => setInput2(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <button onClick={() => act(modal.user.id, "topup", { amount: Number(input), reason: input2 })} className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">Top up</button>
              </>
            )}
            {modal.type === "debit" && (
              <>
                <input type="number" placeholder="Amount to deduct ($)" value={input} onChange={(e) => setInput(e.target.value)} className="w-full mb-2 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <input placeholder="Reason (optional)" value={input2} onChange={(e) => setInput2(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <button onClick={() => act(modal.user.id, "debit", { amount: Number(input), reason: input2 })} className="w-full py-2 rounded-md bg-red-600 text-white text-sm font-medium">Deduct</button>
              </>
            )}
            {modal.type === "notify" && (
              <>
                <input placeholder="Title" value={input} onChange={(e) => setInput(e.target.value)} className="w-full mb-2 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <textarea placeholder="Message" value={input2} onChange={(e) => setInput2(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" rows={3} />
                <button onClick={() => act(modal.user.id, "notify", { title: input, body: input2 })} className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">Send</button>
              </>
            )}
            {modal.type === "password" && (
              <>
                <p className="text-xs text-muted-foreground mb-2">Set a new password (after verifying identity).</p>
                <input type="text" placeholder="New password" value={input} onChange={(e) => setInput(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <button onClick={() => act(modal.user.id, "reset_password", { password: input })} disabled={input.length < 6} className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">Set password</button>
              </>
            )}
            {modal.type === "plan" && (
              <>
                <label className="text-xs text-muted-foreground">Select plan</label>
                <select value={selPlan} onChange={(e) => setSelPlan(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm">
                  <option value="">— select —</option>
                  {plans.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.max_instances} numbers - ${p.price_monthly})</option>)}
                </select>
                <button onClick={() => act(modal.user.id, "set_plan", { plan_id: selPlan })} disabled={!selPlan} className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">Activate plan</button>
              </>
            )}
            {modal.type === "limits" && (
              <>
                <label className="text-xs text-muted-foreground">Custom number of connections (overrides plan — use for &gt;25 / custom plans)</label>
                <input type="number" placeholder={modal.user.custom_max_instances?.toString() ?? "e.g. 40"} value={input3} onChange={(e) => setInput3(e.target.value)} className="w-full mb-1 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <p className="text-[10px] text-muted-foreground mb-3">Leave empty and Save to clear the override (use plan default). Current: {modal.user.custom_max_instances ?? "none"}</p>
                <label className="text-xs text-muted-foreground">Max messages/month (0 = unlimited)</label>
                <input type="number" placeholder={modal.user.max_messages?.toString()} value={input2} onChange={(e) => setInput2(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <button onClick={() => act(modal.user.id, "set_limits", { custom_max_instances: input3 === "" ? "" : Number(input3), max_messages: input2 === "" ? modal.user.max_messages : Number(input2) })} className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">Save</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
