"use client"
import { useEffect, useState } from "react"
import { Loader2, Check } from "lucide-react"

interface Plan { id: string; name: string; price_monthly: number; max_instances: number; max_messages_mo: number }

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [rate, setRate] = useState(50)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/pricing").then(r=>r.json()).then(d=>{setPlans(d.plans??[]);setRate(d.usd_to_egp??50)}).finally(()=>setLoading(false)) }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>

  async function choose(planId: string, name: string) {
    // For now: request the plan (admin activates after payment). Payment gateway later.
    alert(`To activate "${name}", complete payment then it will be enabled on your account. (Payment gateway coming soon)`)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Plans & Pricing</h1>
        <p className="text-muted-foreground mt-2">Unlimited messages on all paid plans. Pay by number of WhatsApp connections.</p>
        <p className="text-xs text-muted-foreground mt-1">Prices in USD. You pay the equivalent in EGP at today's rate (~{rate.toFixed(2)} EGP/USD).</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.filter(p=>p.name!=="مخصص").map((p) => {
          const egp = Math.round(p.price_monthly * rate)
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card/50 p-6 flex flex-col">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-3">
                <span className="text-3xl font-bold">${p.price_monthly}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              {p.price_monthly > 0 && <p className="text-xs text-muted-foreground mt-1">≈ {egp} EGP / month</p>}
              <ul className="mt-4 space-y-2 text-sm flex-1">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {p.max_instances} WhatsApp number{p.max_instances>1?"s":""}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {p.max_messages_mo === 0 ? "Unlimited messages" : `${p.max_messages_mo} messages/mo`}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Webhooks & automation API</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Inbox & analytics</li>
              </ul>
              <button onClick={()=>choose(p.id, p.name)} className="mt-5 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                {p.price_monthly === 0 ? "Current / Trial" : "Choose plan"}
              </button>
            </div>
          )
        })}
      </div>
      <div className="mt-8 text-center rounded-xl border border-border bg-card/30 p-6">
        <h3 className="font-semibold">Need a custom plan?</h3>
        <p className="text-sm text-muted-foreground mt-1">For more than 25 numbers, contact us for custom pricing.</p>
      </div>
    </div>
  )
}
