"use client"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface Log { id: string; admin_email: string; action: string; target_type: string|null; target_id: string|null; created_at: string }

export default function AdminLogs() {
  const { t } = useI18n()
  const [logs, setLogs] = useState<Log[]>([]); const [loading, setLoading] = useState(true)
  useEffect(()=>{ fetch("/api/admin/logs").then(r=>r.json()).then(d=>setLogs(d.logs??[])).finally(()=>setLoading(false)) },[])
  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin"/></div>
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">{t("al.title")}</h1>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-muted-foreground"><tr className="text-right"><th className="p-3">{t("al.admin")}</th><th className="p-3">الAction</th><th className="p-3">{t("al.target")}</th><th className="p-3">{t("al.time")}</th></tr></thead>
          <tbody>
            {logs.map(l=>(
              <tr key={l.id} className="border-t border-border/40">
                <td className="p-3">{l.admin_email}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">{l.action}</span></td>
                <td className="p-3 text-xs text-muted-foreground">{l.target_type ?? "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {logs.length===0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground text-sm">{t("al.none")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}