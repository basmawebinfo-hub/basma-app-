"use client"
import { useEffect, useState } from "react"
import { Loader2, Check, X } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface Req {
  id: string; status: string; created_at: string
  email: string | null; name: string | null
  plan_name: string | null; plan_price: number | null
}

export default function PlanRequestsPage() {
  const { t } = useI18n()
  const [reqs, setReqs] = useState<Req[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  const load = () => fetch("/api/admin/plan-requests").then((r) => r.json()).then((d) => setReqs(d.requests ?? [])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  async function act(id: string, action: "approve" | "reject") {
    setActing(id)
    try {
      await fetch("/api/admin/plan-requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: id, action }),
      })
      load()
    } finally { setActing(null) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>

  const badge = (s: string) => {
    const map: Record<string, string> = { pending: "bg-amber-500/15 text-amber-500", approved: "bg-green-500/15 text-green-500", rejected: "bg-red-500/15 text-red-500" }
    const label: Record<string, string> = { pending: t("apr.pending"), approved: t("apr.approved"), rejected: t("apr.rejected") }
    return <span className={"px-2 py-0.5 rounded-full text-xs " + (map[s] ?? "")}>{label[s] ?? s}</span>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">{t("apr.title")}</h1>
      {reqs.length === 0 ? (
        <div className="rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">{t("apr.none")}</div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-card/40 text-muted-foreground">
              <tr>
                <th className="text-start p-3">{t("apr.user")}</th>
                <th className="text-start p-3">{t("apr.plan")}</th>
                <th className="text-start p-3">{t("apr.date")}</th>
                <th className="text-start p-3">{t("apr.status")}</th>
                <th className="text-start p-3">{t("apr.action")}</th>
              </tr>
            </thead>
            <tbody>
              {reqs.map((r) => (
                <tr key={r.id} className="border-t border-border/40">
                  <td className="p-3">
                    <div className="font-medium">{r.name || r.email || "—"}</div>
                    {r.name && r.email && <div className="text-xs text-muted-foreground">{r.email}</div>}
                  </td>
                  <td className="p-3">{r.plan_name ?? "—"} {r.plan_price != null && <span className="text-muted-foreground">(${r.plan_price})</span>}</td>
                  <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-3">{badge(r.status)}</td>
                  <td className="p-3">
                    {r.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => act(r.id, "approve")} disabled={acting === r.id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/15 text-green-500 text-xs disabled:opacity-50"><Check className="w-3.5 h-3.5" /> {t("apr.approve")}</button>
                        <button onClick={() => act(r.id, "reject")} disabled={acting === r.id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/15 text-red-500 text-xs disabled:opacity-50"><X className="w-3.5 h-3.5" /> {t("apr.reject")}</button>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
