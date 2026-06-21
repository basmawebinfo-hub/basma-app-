"use client"
import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface Notif { id: string; title: string; body: string|null; level: string; is_read: boolean; created_at: string }

export function NotificationsBell() {
  const { t } = useI18n()
  const [items, setItems] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)
  const unread = items.filter(n => !n.is_read).length

  const load = () => fetch("/api/notifications").then(r=>r.json()).then(d=>setItems(d.notifications??[])).catch(()=>{})
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [])

  async function markAll() { await fetch("/api/notifications", { method: "PATCH" }); load() }

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open && unread) markAll() }} className="relative p-2 rounded-lg hover:bg-muted/40">
        <Bell className="w-5 h-5" />
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] max-h-96 overflow-y-auto rounded-xl border border-border bg-card shadow-xl z-50" >
          <div className="p-3 border-b border-border text-sm font-semibold">{t("nb.title")}</div>
          {items.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">{t("nb.none")}</div>
          ) : items.map(n => (
            <div key={n.id} className={"p-3 border-b border-border/40 " + (n.is_read ? "" : "bg-primary/5")}>
              <div className="flex items-center gap-2">
                <span className={"w-2 h-2 rounded-full " + (n.level==="critical"?"bg-red-500":n.level==="warning"?"bg-amber-500":"bg-primary")}></span>
                <span className="text-sm font-medium">{n.title}</span>
              </div>
              {n.body && <p className="text-xs text-muted-foreground mt-1">{n.body}</p>}
              <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}