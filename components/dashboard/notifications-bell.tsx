"use client"
import { useEffect, useState, useRef } from "react"
import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface Notif { id: string; title: string; body: string|null; level: string; is_read: boolean; created_at: string }

function timeAgo(iso: string, ar: boolean): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return ar ? "الآن" : "now"
  const m = Math.floor(diff / 60); if (m < 60) return ar ? `منذ ${m} د` : `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return ar ? `منذ ${h} س` : `${h}h ago`
  const d = Math.floor(h / 24); return ar ? `منذ ${d} يوم` : `${d}d ago`
}

export function NotificationsBell() {
  const { t, lang } = useI18n()
  const ar = lang === "ar"
  const [items, setItems] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const unread = items.filter(n => !n.is_read).length

  const load = () => fetch("/api/notifications").then(r=>r.json()).then(d=>setItems(d.notifications??[])).catch(()=>{})
  useEffect(() => { load(); const iv = setInterval(load, 30000); return () => clearInterval(iv) }, [])

  // close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", onClick); return () => document.removeEventListener("mousedown", onClick)
  }, [])

  async function markAll() { await fetch("/api/notifications", { method: "PATCH" }); load() }

  const levelIcon = (level: string) => {
    if (level === "critical") return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
    if (level === "warning") return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
    return <Info className="w-4 h-4 text-primary shrink-0" />
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open && unread) markAll() }}
        className="relative p-2 rounded-lg hover:bg-muted/60 transition-colors"
        aria-label="notifications"
      >
        <Bell className={"w-5 h-5 " + (unread > 0 ? "text-primary" : "text-muted-foreground")} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute end-0 mt-2 w-96 max-w-[92vw] rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <span className="text-sm font-bold">{t("nb.title")}</span>
            {unread > 0 && (
              <button onClick={markAll} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <CheckCheck className="w-3.5 h-3.5" /> {ar ? "تحديد الكل كمقروء" : "Mark all read"}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">{t("nb.none")}</p>
              </div>
            ) : items.map(n => (
              <div key={n.id} className={"flex items-start gap-3 px-4 py-3 border-b border-border/30 transition-colors hover:bg-muted/20 " + (n.is_read ? "" : "bg-primary/[0.04]")}>
                {levelIcon(n.level)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate">{n.title}</span>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  {n.body && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>}
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{timeAgo(n.created_at, ar)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
