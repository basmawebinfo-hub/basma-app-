"use client"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface Tx { id: string; email: string; amount: number; type: string; reason: string|null; balance_after: number; created_at: string }
interface Bal { id: string; email: string; balance: number; plan: string }

export default function AdminBilling() {
  const [tx, setTx] = useState<Tx[]>([]); const [bal, setBal] = useState<Bal[]>([]); const [loading, setLoading] = useState(true)
  useEffect(()=>{ fetch("/api/admin/billing").then(r=>r.json()).then(d=>{setTx(d.transactions??[]);setBal(d.balances??[])}).finally(()=>setLoading(false)) },[])
  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin"/></div>
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">أرصدة المستخدمين</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {bal.map(b=>(
            <div key={b.id} className="rounded-xl border border-border bg-card/50 p-4">
              <div className="text-sm text-muted-foreground truncate">{b.email}</div>
              <div className="text-xl font-bold mt-1">{Number(b.balance).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">باقة: {b.plan}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3">آخر الحركات المالية</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-muted-foreground"><tr className="text-right"><th className="p-3">المستخدم</th><th className="p-3">المبلغ</th><th className="p-3">النوع</th><th className="p-3">السبب</th><th className="p-3">التاريخ</th></tr></thead>
            <tbody>
              {tx.map(t=>(
                <tr key={t.id} className="border-t border-border/40">
                  <td className="p-3">{t.email}</td>
                  <td className={"p-3 font-medium "+(t.amount>=0?"text-green-600":"text-red-600")}>{t.amount>=0?"+":""}{Number(t.amount).toFixed(2)}</td>
                  <td className="p-3">{t.type}</td>
                  <td className="p-3 text-xs text-muted-foreground">{t.reason ?? "—"}</td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
