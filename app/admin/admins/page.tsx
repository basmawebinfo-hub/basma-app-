"use client"
import { useEffect, useState } from "react"
import { Loader2, ShieldCheck, ShieldOff, UserPlus, X, Crown } from "lucide-react"

interface P { id: string; email: string|null; full_name: string|null; role: string; status: string }

export default function AdminAdmins() {
  const [rows, setRows] = useState<P[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [busy, setBusy] = useState<string|null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [name, setName] = useState("")

  const load = () => {
    setLoading(true)
    fetch("/api/admin/admins").then(async r => {
      if (r.status === 403) { setForbidden(true); return { profiles: [] } }
      return r.json()
    }).then(d => setRows(d.profiles ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function act(action: string, payload: Record<string, unknown>) {
    setBusy(JSON.stringify(payload))
    try {
      const r = await fetch("/api/admin/admins", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action, ...payload }) })
      if (!r.ok) { const e = await r.json(); alert(e.error ?? "فشل") }
      setShowCreate(false); setEmail(""); setPass(""); setName(""); load()
    } finally { setBusy(null) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin"/></div>
  if (forbidden) return <div className="p-8"><div className="rounded-xl border border-border bg-card/50 p-6 text-center"><Crown className="w-8 h-8 mx-auto mb-2 text-muted-foreground"/><p className="text-muted-foreground">هذه الصفحة للمالك الأعلى (super admin) فقط.</p></div></div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة المشرفين</h1>
        <button onClick={()=>setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"><UserPlus className="w-4 h-4"/> إنشاء مشرف</button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-muted-foreground"><tr className="text-right"><th className="p-3">المستخدم</th><th className="p-3">الرتبة</th><th className="p-3">إجراء</th></tr></thead>
          <tbody>
            {rows.map(p=>(
              <tr key={p.id} className="border-t border-border/40">
                <td className="p-3"><div className="font-medium">{p.email}</div><div className="text-xs text-muted-foreground">{p.full_name}</div></td>
                <td className="p-3">
                  <span className={"px-2 py-0.5 rounded-full text-xs "+(p.role==="super_admin"?"bg-amber-500/15 text-amber-600":p.role==="admin"?"bg-primary/15 text-primary":"bg-muted text-muted-foreground")}>
                    {p.role==="super_admin"?"مالك أعلى":p.role==="admin"?"مشرف":"مستخدم"}
                  </span>
                </td>
                <td className="p-3">
                  {p.role==="super_admin" ? <span className="text-xs text-muted-foreground flex items-center gap-1"><Crown className="w-3.5 h-3.5"/> محمي</span>
                   : p.role==="admin" ? <button disabled={!!busy} onClick={()=>act("demote",{user_id:p.id})} className="flex items-center gap-1.5 text-xs text-red-600 hover:underline"><ShieldOff className="w-4 h-4"/> تنزيل لمستخدم</button>
                   : <button disabled={!!busy} onClick={()=>act("promote",{user_id:p.id})} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><ShieldCheck className="w-4 h-4"/> ترقية لمشرف</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={()=>setShowCreate(false)}>
          <div className="bg-card border border-border rounded-xl p-6 w-[400px]" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">إنشاء مشرف جديد</h3><button onClick={()=>setShowCreate(false)}><X className="w-4 h-4"/></button></div>
            <input placeholder="الاسم" value={name} onChange={e=>setName(e.target.value)} className="w-full mb-2 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm"/>
            <input placeholder="الإيميل" value={email} onChange={e=>setEmail(e.target.value)} className="w-full mb-2 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm"/>
            <input type="password" placeholder="كلمة السر" value={pass} onChange={e=>setPass(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md bg-muted/30 border border-border text-sm"/>
            <button onClick={()=>act("create",{email,password:pass,full_name:name})} className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">إنشاء</button>
          </div>
        </div>
      )}
    </div>
  )
}
