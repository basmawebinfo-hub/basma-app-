"use client"
import { useEffect, useState } from "react"
import { Loader2, Ban, CheckCircle, Wallet, Bell, Trash2, Settings2, X, Search, Download, CreditCard, KeyRound } from "lucide-react"

interface AdminUser {
  id: string; email: string | null; full_name: string | null
  role: string; status: string; balance: number; plan: string
  plan_name?: string; plan_id?: string; sub_status?: string
  max_instances: number; max_messages: number
  instances_total: number; instances_connected: number
  messages_sent: number; messages_received: number
  created_at: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [modal, setModal] = useState<{ type: string; user: AdminUser } | null>(null)
  const [input, setInput] = useState("")
  const [input2, setInput2] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  const [plans, setPlans] = useState<{id:string;name:string;max_instances:number;price_monthly:number}[]>([])
  const [selPlan, setSelPlan] = useState("")

  const load = () => {
    setLoading(true)
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(d.users ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])
  useEffect(() => { fetch("/api/admin/plans").then(r=>r.json()).then(d=>setPlans(d.plans??[])).catch(()=>{}) }, [])

  async function act(userId: string, action: string, payload: Record<string, unknown> = {}) {
    setBusy(userId)
    try {
      const r = await fetch(`/api/admin/users/${userId}/action`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      })
      if (!r.ok) { const e = await r.json(); alert(e.error ?? "فشل") }
      setModal(null); setInput(""); setInput2("")
      load()
    } finally { setBusy(null) }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = !q || (u.email ?? "").toLowerCase().includes(q) || (u.full_name ?? "").toLowerCase().includes(q)
    const matchStatus = statusFilter === "all" || u.status === statusFilter
    const matchPlan = planFilter === "all" || u.plan === planFilter
    return matchSearch && matchStatus && matchPlan
  })

  function exportCSV() {
    const headers = ["email","full_name","role","status","plan","balance","instances_total","messages_sent","messages_received"]
    const rows = filtered.map((u) => headers.map((h) => JSON.stringify((u as Record<string, unknown>)[h] ?? "")).join(","))
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "basma-users.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <span className="text-sm text-muted-foreground">{filtered.length} / {users.length} مستخدم</span>
      </div>

      {/* Search + filters + export */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input placeholder="بحث بالإيميل أو الاسم..." value={search} onChange={(e)=>setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
        </div>
        <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm">
          <option value="all">كل الحالات</option><option value="active">نشط</option><option value="suspended">موقوف</option>
        </select>
        <select value={planFilter} onChange={(e)=>setPlanFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm">
          <option value="all">كل الباقات</option><option value="free">مجاني</option><option value="starter">المبتدئ</option><option value="pro">الاحترافي</option><option value="enterprise">الشركات</option>
        </select>
        <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted/40"><Download className="w-4 h-4"/> تصدير CSV</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-muted-foreground">
            <tr className="text-right">
              <th className="p-3 font-medium">المستخدم</th>
              <th className="p-3 font-medium">الحالة</th>
              <th className="p-3 font-medium">الباقة</th>
              <th className="p-3 font-medium">الرصيد</th>
              <th className="p-3 font-medium">اتصالات</th>
              <th className="p-3 font-medium">رسائل (صادر/وارد)</th>
              <th className="p-3 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-border/40 hover:bg-card/30">
                <td className="p-3">
                  <div className="font-medium">{u.email ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.full_name} {u.role === "admin" && "• أدمن"}</div>
                </td>
                <td className="p-3">
                  <span className={"px-2 py-0.5 rounded-full text-xs " + (u.status === "active" ? "bg-green-500/15 text-green-600" : "bg-red-500/15 text-red-600")}>
                    {u.status === "active" ? "نشط" : "موقوف"}
                  </span>
                </td>
                <td className="p-3">{u.plan_name ?? "—"}</td>
                <td className="p-3 font-medium">{Number(u.balance).toFixed(2)}</td>
                <td className="p-3">{u.instances_connected}/{u.instances_total}</td>
                <td className="p-3">{u.messages_sent} / {u.messages_received}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    {u.status === "active" ? (
                      <button title="إيقاف" disabled={busy === u.id} onClick={() => act(u.id, "suspend")}
                        className="p-1.5 rounded-md hover:bg-red-500/15 text-red-600"><Ban className="w-4 h-4" /></button>
                    ) : (
                      <button title="تفعيل" disabled={busy === u.id} onClick={() => act(u.id, "activate")}
                        className="p-1.5 rounded-md hover:bg-green-500/15 text-green-600"><CheckCircle className="w-4 h-4" /></button>
                    )}
                    <button title="شحن رصيد" onClick={() => setModal({ type: "topup", user: u })}
                      className="p-1.5 rounded-md hover:bg-primary/15 text-primary"><Wallet className="w-4 h-4" /></button>
                    <button title="إرسال إشعار" onClick={() => setModal({ type: "notify", user: u })}
                      className="p-1.5 rounded-md hover:bg-blue-500/15 text-blue-600"><Bell className="w-4 h-4" /></button>
                    <button title="الحدود" onClick={() => setModal({ type: "limits", user: u })}
                      className="p-1.5 rounded-md hover:bg-muted text-foreground"><Settings2 className="w-4 h-4" /></button>
                    <button title="تغيير الباقة" onClick={() => { setSelPlan(u.plan_id ?? ""); setModal({ type: "plan", user: u }) }}
                      className="p-1.5 rounded-md hover:bg-amber-500/15 text-amber-600"><CreditCard className="w-4 h-4" /></button>
                    <button title="تغيير كلمة المرور" onClick={() => setModal({ type: "password", user: u })}
                      className="p-1.5 rounded-md hover:bg-orange-500/15 text-orange-600"><KeyRound className="w-4 h-4" /></button>
                    <button title="حذف" onClick={() => { if (confirm("متأكد من حذف المستخدم نهائياً؟")) act(u.id, "delete") }}
                      className="p-1.5 rounded-md hover:bg-red-500/15 text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="bg-card border border-border rounded-xl p-6 w-[400px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {modal.type === "topup" && "شحن رصيد"}
                {modal.type === "notify" && "إرسال إشعار"}
                {modal.type === "password" && "تغيير كلمة المرور"}
                {modal.type === "plan" && "تغيير الباقة"}
                {modal.type === "limits" && "تعديل الحدود"}
              </h3>
              <button onClick={() => setModal(null)}><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{modal.user.email}</p>

            {modal.type === "topup" && (
              <>
                <input type="number" placeholder="المبلغ" value={input} onChange={(e) => setInput(e.target.value)}
                  className="w-full mb-2 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <input placeholder="السبب (اختياري)" value={input2} onChange={(e) => setInput2(e.target.value)}
                  className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <button onClick={() => act(modal.user.id, "topup", { amount: Number(input), reason: input2 })}
                  className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">شحن</button>
              </>
            )}
            {modal.type === "notify" && (
              <>
                <input placeholder="العنوان" value={input} onChange={(e) => setInput(e.target.value)}
                  className="w-full mb-2 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <textarea placeholder="نص الرسالة" value={input2} onChange={(e) => setInput2(e.target.value)}
                  className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" rows={3} />
                <button onClick={() => act(modal.user.id, "notify", { title: input, body: input2 })}
                  className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">إرسال</button>
              </>
            )}
            {modal.type === "password" && (
              <>
                <p className="text-xs text-muted-foreground mb-2">عيّن كلمة مرور جديدة للمستخدم (بعد التأكد من هويته).</p>
                <input type="text" placeholder="كلمة المرور الجديدة" value={input} onChange={e=>setInput(e.target.value)}
                  className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <button onClick={() => act(modal.user.id, "reset_password", { password: input })} disabled={input.length<6}
                  className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">تعيين كلمة المرور</button>
              </>
            )}
            {modal.type === "plan" && (
              <>
                <label className="text-xs text-muted-foreground">اختر الباقة</label>
                <select value={selPlan} onChange={(e)=>setSelPlan(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm">
                  <option value="">— اختر —</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({p.max_instances} رقم - {p.price_monthly}ج)</option>)}
                </select>
                <button onClick={() => act(modal.user.id, "set_plan", { plan_id: selPlan })} disabled={!selPlan}
                  className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">تفعيل الباقة</button>
              </>
            )}
            {modal.type === "limits" && (
              <>
                <label className="text-xs text-muted-foreground">أقصى اتصالات</label>
                <input type="number" defaultValue={modal.user.max_instances} value={input} onChange={(e) => setInput(e.target.value)}
                  className="w-full mb-2 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <label className="text-xs text-muted-foreground">أقصى رسائل شهرياً</label>
                <input type="number" defaultValue={modal.user.max_messages} value={input2} onChange={(e) => setInput2(e.target.value)}
                  className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm" />
                <button onClick={() => act(modal.user.id, "set_limits", { max_instances: Number(input || modal.user.max_instances), max_messages: Number(input2 || modal.user.max_messages) })}
                  className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">حفظ</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
