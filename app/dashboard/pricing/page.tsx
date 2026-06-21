"use client"
import { useEffect, useState } from "react"
import { Loader2, Check } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface Plan { id: string; name: string; price_monthly: number; max_instances: number; max_messages_mo: number }

export default function PricingPage() {
  const { t } = useI18n()
  const [plans, setPlans] = useState<Plan[]>([])
  const [rate, setRate] = useState(50)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState<string | null>(null)
  const [sub, setSub] = useState<{ days_left: number | null; is_trial: boolean; plan: string | null } | null>(null)

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((d) => { setPlans(d.plans ?? []); setRate(d.usd_to_egp ?? 50) })
      .finally(() => setLoading(false))
    fetch("/api/my-subscription").then((r) => r.json()).then(setSub).catch(() => {})
  }, [])

  async function choose(planId: string, name: string) {
    setRequesting(planId)
    try {
      const r = await fetch("/api/plan-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      })
      if (r.ok) {
        alert(t("dp.reqSent"))
      } else {
        alert(t("dp.reqError"))
      }
    } finally {
      setRequesting(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{t("dp.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("dp.subtitle")}</p>
        <p className="text-xs text-muted-foreground mt-1">{t("dp.rateNote")} (~{rate.toFixed(2)} EGP/USD).</p>
      </div>
      {sub?.is_trial && sub?.days_left !== null && (
        <div className={"max-w-md mx-auto mb-8 rounded-xl border px-5 py-4 text-center " + (sub.days_left > 0 ? "border-primary/30 bg-primary/10" : "border-red-500/30 bg-red-500/10")}>
          {sub.days_left > 0 ? (
            <p className="text-sm font-medium text-foreground">
              {t("trial.banner")} — {t("trial.daysLeft")} <span className="text-primary font-bold text-base">{sub.days_left}</span> {sub.days_left === 1 ? t("trial.day") : t("trial.days")}
            </p>
          ) : (
            <p className="text-sm font-medium text-red-500">{t("trial.expired")}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.filter((p) => p.name !== "مخصص" && p.name !== "Custom").map((p) => {
          const egp = Math.round(p.price_monthly * rate)
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card/50 p-6 flex flex-col">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-3">
                <span className="text-3xl font-bold">${p.price_monthly}</span>
                <span className="text-muted-foreground text-sm">{t("dp.month")}</span>
              </div>
              {p.price_monthly > 0 && <p className="text-xs text-muted-foreground mt-1">~ {egp} {t("dp.egpMonth")}</p>}
              <ul className="mt-4 space-y-2 text-sm flex-1">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {p.max_instances} {p.max_instances > 1 ? t("dp.numbers") : t("dp.number")}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {p.max_messages_mo === 0 ? t("dp.unlimited") : p.max_messages_mo + " " + t("dp.msgsMo")}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t("dp.feat3")}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t("dp.feat4")}</li>
              </ul>
              <button
                onClick={() => choose(p.id, p.name)}
                disabled={requesting === p.id}
                className="mt-5 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                {p.price_monthly === 0 ? t("dp.current") : requesting === p.id ? t("dp.sending") : t("dp.choose")}
              </button>
            </div>
          )
        })}
      </div>
      <div className="mt-8 text-center rounded-xl border border-border bg-card/30 p-6">
        <h3 className="font-semibold">{t("dp.customTitle")}</h3>
        <p className="text-sm text-muted-foreground mt-1">{t("dp.customDesc")}</p>
      </div>
    </div>
  )
}
