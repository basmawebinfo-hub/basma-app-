"use client"
import { useEffect, useState } from "react"
import { Loader2, Trash2 } from "lucide-react"

interface Inst { id: string; instance_name: string; display_name: string; phone: string | null; status: string; owner_email: string | null; created_at: string }

export default function AdminInstances() {
  const [rows, setRows] = useState<Inst[]>([])
  const [loading, setLoading] = useState(true)
  const load = () => { setLoading(true); fetch("/api/admin/instances").then(r=>r.json()).then(d=>setRows(d.instances??[])).finally(()=>setLoading(false)) }
  useEffect(load, [])
  async function del(id: string) {
    if (!confirm("Delete this connection permanently?")) return
    await fetch(`/api/admin/instances?id=${id}`, { method: "DELETE" }); load()
  }
  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Connections ({rows.length})</h1>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-muted-foreground"><tr className="text-right">
            <th className="p-3">Name</th><th className="p-3">Owner</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3">Action</th>
          </tr></thead>
          <tbody>
            {rows.map(i=>(
              <tr key={i.id} className="border-t border-border/40 hover:bg-card/30">
                <td className="p-3 font-medium">{i.display_name}</td>
                <td className="p-3">{i.owner_email ?? "—"}</td>
                <td className="p-3"><span className={"px-2 py-0.5 rounded-full text-xs "+(i.status==="CONNECTED"?"bg-green-500/15 text-green-600":"bg-muted text-muted-foreground")}>{i.status}</span></td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</td>
                <td className="p-3"><button onClick={()=>del(i.id)} className="p-1.5 rounded-md hover:bg-red-500/15 text-red-600"><Trash2 className="w-4 h-4"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
