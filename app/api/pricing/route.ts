import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Currencies we let the user pick from at checkout
const SUPPORTED = ["USD", "EGP", "SAR", "AED", "KWD", "QAR", "JOD", "EUR", "GBP"]

// GET /api/pricing — public plans (USD) + live exchange rates for checkout estimate
export async function GET() {
  const supabase = await createClient()
  const { data: plans } = await supabase
    .from("plans")
    .select("id, name, price_monthly, currency, max_instances, max_messages_mo, is_active")
    .eq("is_active", true)
    .order("price_monthly")

  // Live USD-based rates (free, no key). Falls back to static EGP if the API is down.
  const rates: Record<string, number> = { USD: 1, EGP: 50 }
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } })
    if (r.ok) {
      const j = await r.json()
      const all = j?.rates ?? {}
      for (const cur of SUPPORTED) {
        if (typeof all[cur] === "number") rates[cur] = all[cur]
      }
    }
  } catch { /* keep fallback */ }

  return NextResponse.json({
    plans: plans ?? [],
    usd_to_egp: rates.EGP,   // kept for backward compatibility
    rates,
    currencies: SUPPORTED,
  })
}
