import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { enforceRateLimit, extractClientIp } from "@/lib/rate-limit"

// Currencies we let the user pick from at checkout
const SUPPORTED = ["USD", "EGP", "SAR", "AED", "KWD", "QAR", "JOD", "EUR", "GBP"]

// GET /api/pricing — public plans (USD) + live exchange rates for checkout estimate
export async function GET(req: NextRequest) {
  const rateHeaders: Record<string, string> = {}
  const blocked = enforceRateLimit("pricing", extractClientIp(req), req, rateHeaders)
  if (blocked) return blocked

  const supabase = await createClient()
  const { data: plans } = await supabase
    .from("plans")
    .select("id, name, price_monthly, currency, max_instances, max_messages_mo, is_active, tier_slug, is_trial")
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

  const botUser = process.env.TELEGRAM_BOT_USERNAME ?? ""
  const supportLink = botUser ? `https://t.me/${botUser}?start=custom_plan` : null

  return NextResponse.json({
    plans: plans ?? [],
    usd_to_egp: rates.EGP,   // kept for backward compatibility
    rates,
    currencies: SUPPORTED,
    support_telegram: supportLink,
  }, { headers: rateHeaders })
}
