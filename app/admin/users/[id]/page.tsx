"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Ban, CheckCircle, Wallet, MinusCircle, Bell, KeyRound, Trash2, Server, MessageSquare, Send, Check, X } from "lucide-react"

interface Detail {
  profile: { id: string; email: string; full_name: string; company: string | null; role: string; status: string; balance: number; plan_name: string; whatsapp: string | null; telegram_linked: boolean; telegram_linked_at: string | null; effective_max_instances: number; created_at: string }
  instances: { id: string; display_name: string; phone: string | null; status: string; created_at: string }[]
  transactions: { amount: number; type: string; reason: string | null; balance_after: number; created_at: string }[]
  usage: { endpoint: string; status: number; detail: string; created_at: string }[]
  plan_requests: { plan_id: string; status: string; created_at: string }[]
  message_stats: { sent: number; received: number }
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [d, setD] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("overview")
  const [modal, setModal] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [input2, setInput2] = useState("")

  const load = () => { setLoading(true); fetch("/api/admin/users/" + id + "/detail").then((r) => r.json()).then(setD).finally(() => setLoading(false)) }
  useEffect(() => { if (id) load() }, [id])

  async function act(action: string, payload: Record<string, unknown> = {}) {
    const r = await fetch("/api/admin/users/" + id + "/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...payload }) })
    if (!r.ok) { const e = await r.json(); alert(e.error ?? "Failed") }
    if (action === "delete") { router.push("/admin/users"); return }
    setModal(null); setInput(""); setInput2(""); load()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>
  if (!d) return <div className="p-8 text-destructive">User not found</div>

  const p = d.profile
  const initials = (p.full_name || p.email || "?").slice(0, 2).toUpperCase()
  const tabs = [["overview", "Overview"], ["connections", "Connections"], ["billing", "Billing"], ["activity", "API Activity"]]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button onClick={() => router.push("/admin/users")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5"><ArrowLeft className="w-4 h-4" /> Back to users</button>

      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card/50 p-6 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-bold">{initials}</div>
            <div>
              <h1 className="text-xl font-bold">{p.full_name || "—"}</h1>
              <div className="text-sm text-muted-foreground">{p.email}</div>
              {p.whatsapp && <a href={"https://wa.me/" + p.whatsapp.replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline">{p.whatsapp}</a>}
              <div className="flex items-center gap-2 mt-2">
                <span className={"px-2 py-0.5 rounded-full text-xs " + (p.status === "active" ? "bg-green-500/15 text-green-600" : p.status === "pending" ? "bg-amber-500/15 text-amber-600" : "bg-red-500/15 text-red-600")}>{p.status}</span>
                {p.role !== "user" && <span className="px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary">{p.role}</span>}
                <span className={"px-2 py-0.5 rounded-full text-xs " + (p.telegram_linked ? "bg-blue-500/15 text-blue-600" : "bg-muted text-muted-foreground")}>{p.telegram_linked ? "Telegram linked" : "Telegram not linked"}</span>
              </div>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {p.status === "pending" ? <button title="Approve" onClick={() => act("approve")} className="p-2 rounded-md hover:bg-green-500/15 text-green-600"><CheckCircle className="w-4 h-4" /></button>
             : p.status === "active" ? <button title="Suspend" onClick={() => act("suspend")} className="p-2 rounded-md hover:bg-red-500/15 text-red-600"><Ban className="w-4 h-4" /></button>
             : <button title="Activate" onClick={() => act("activate")} className="p-2 rounded-md hover:bg-green-500/15 text-green-600"><CheckCircle className="w-4 h-4" /></button>}
            <button title="Top up" onClick={() => setModal("topup")} className="p-2 rounded-md hover:bg-primary/15 text-primary"><Wallet className="w-4 h-4" /></button>
            <button title="Deduct" onClick={() => setModal("debit")} className="p-2 rounded-md hover:bg-red-500/15 text-red-600"><MinusCircle className="w-4 h-4" /></button>
            <button title="Notify" onClick={() => setModal("notify")} className="p-2 rounded-md hover:bg-blue-500/15 text-blue-600"><Bell className="w-4 h-4" /></button>
            <button title="Reset password" onClick={() => setModal("password")} className="p-2 rounded-md hover:bg-orange-500/15 text-orange-600"><KeyRound className="w-4 h-4" /></button>
            <button title="Delete" onClick={() => { if (confirm("Delete this user permanently?")) act("delete") }} className="p-2 rounded-md hover:bg-red-500/15 text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="rounded-lg bg-muted/20 p-3"><div className="text-xs text-muted-foreground">Balance</div><div className="text-lg font-bold">${Number(p.balance).toFixed(2)}</div></div>
          <div className="rounded-lg bg-muted/20 p-3"><div className="text-xs text-muted-foreground">Plan</div><div className="text-lg font-bold">{p.plan_name}</div></div>
          <div className="rounded-lg bg-muted/20 p-3"><div className="text-xs text-muted-foreground">Numbers allowed</div><div className="text-lg font-bold">{p.effective_max_instances}</div></div>
          <div className="rounded-lg bg-muted/20 p-3"><div className="text-xs text-muted-foreground">Joined</div><div className="text-sm font-medium">{new Date(p.created_at).toLocaleDateString()}</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-5">
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={"px-4 py-2 text-sm font-medium border-b-2 -mb-px " + (tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card/40 p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Server className="w-4 h-4" /> Connections</div><div className="text-2xl font-bold">{d.instances.length}</div></div>
          <div className="rounded-xl border border-border bg-card/40 p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><MessageSquare className="w-4 h-4" /> Sent</div><div className="text-2xl font-bold">{d.message_stats.sent}</div></div>
          <div className="rounded-xl border border-border bg-card/40 p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><MessageSquare className="w-4 h-4" /> Received</div><div className="text-2xl font-bold">{d.message_stats.received}</div></div>
          <div className="md:col-span-3 rounded-xl border border-border bg-card/40 p-4 text-sm">
            <div className="font-medium mb-2">Telegram</div>
            {p.telegram_linked ? <div className="text-green-600 flex items-center gap-2"><Check className="w-4 h-4" /> Linked {p.telegram_linked_at && "on " + new Date(p.telegram_linked_at).toLocaleString()}</div> : <div className="text-muted-foreground">Not linked yet</div>}
          </div>
        </div>
      )}
      {tab === "connections" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-card/60 text-muted-foreground"><tr className="text-left"><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Status</th><th className="p-3">Created</th></tr></thead>
            <tbody>{d.instances.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-muted-foreground text-xs">No connections</td></tr> : d.instances.map((i, n) => (
              <tr key={n} className="border-t border-border/40"><td className="p-3 font-medium">{i.display_name}</td><td className="p-3">{i.phone ?? "—"}</td><td className="p-3"><span className={"text-xs " + (i.status === "CONNECTED" ? "text-green-600" : "text-muted-foreground")}>{i.status}</span></td><td className="p-3 text-xs text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</td></tr>
            ))}</tbody></table>
        </div>
      )}
      {tab === "billing" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-card/60 text-muted-foreground"><tr className="text-left"><th className="p-3">Amount</th><th className="p-3">Type</th><th className="p-3">Reason</th><th className="p-3">Balance after</th><th className="p-3">Date</th></tr></thead>
            <tbody>{d.transactions.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-muted-foreground text-xs">No transactions</td></tr> : d.transactions.map((t, n) => (
              <tr key={n} className="border-t border-border/40"><td className={"p-3 font-medium " + (t.amount >= 0 ? "text-green-600" : "text-red-600")}>{t.amount >= 0 ? "+" : ""}{Number(t.amount).toFixed(2)}</td><td className="p-3">{t.type}</td><td className="p-3 text-xs text-muted-foreground">{t.reason ?? "—"}</td><td className="p-3">${Number(t.balance_after).toFixed(2)}</td><td className="p-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td></tr>
            ))}</tbody></table>
        </div>
      )}
      {tab === "activity" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-card/60 text-muted-foreground"><tr className="text-left"><th className="p-3">Endpoint</th><th className="p-3">Detail</th><th className="p-3">Status</th><th className="p-3">Time</th></tr></thead>
            <tbody>{d.usage.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-muted-foreground text-xs">No API activity</td></tr> : d.usage.map((u, n) => (
              <tr key={n} className="border-t border-border/40"><td className="p-3 font-mono text-xs">{u.endpoint}</td><td className="p-3 text-xs text-muted-foreground">{u.detail}</td><td className="p-3"><span className={"text-xs " + (u.status === 200 ? "text-green-600" : "text-red-600")}>{u.status}</span></td><td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</td></tr>
            ))}</tbody></table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="bg-card border border-border rounded-xl p-6 w-[400px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">{modal}</h3><button onClick={() => setModal(null)}><X className="w-4 h-4" /></button></div>
            {(modal === "topup" || modal === "debit") && (<>
              <input type="number" placeholder="Amount ($)" value={input} onChange={(e) => setInput(e.target.value)} className="w-full mb-2 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
              <input placeholder="Reason (optional)" value={input2} onChange={(e) => setInput2(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
              <button onClick={() => act(modal, { amount: Number(input), reason: input2 })} className={"w-full py-2 rounded-md text-sm font-medium " + (modal === "topup" ? "bg-primary text-primary-foreground" : "bg-red-600 text-white")}>{modal === "topup" ? "Top up" : "Deduct"}</button>
            </>)}
            {modal === "notify" && (<>
              <input placeholder="Title" value={input} onChange={(e) => setInput(e.target.value)} className="w-full mb-2 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
              <textarea placeholder="Message" value={input2} onChange={(e) => setInput2(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" rows={3} />
              <button onClick={() => act("notify", { title: input, body: input2 })} className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">Send</button>
            </>)}
            {modal === "password" && (<>
              <input type="text" placeholder="New password" value={input} onChange={(e) => setInput(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
              <button onClick={() => act("reset_password", { password: input })} disabled={input.length < 6} className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">Set password</button>
            </>)}
          </div>
        </div>
      )}
    </div>
  )
}
