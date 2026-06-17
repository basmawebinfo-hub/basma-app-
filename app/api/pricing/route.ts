import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/pricing — public plans (USD) + live EGP rate for checkout estimate
export async function GET() {
  const supabase = await createClient()
  const { data: plans } = await supabase
    .from("plans")
    .select("id, name, price_monthly, currency, max_instances, max_messages_mo, is_active")
    .eq("is_active", true)
    .order("price_monthly")

  // Live USD->EGP rate (free, no key). Falls back to a static rate if the API is down.
  let egpRate = 50
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } })
    if (r.ok) {
      const j = await r.json()
      egpRate = j?.rates?.EGP ?? egpRate
    }
  } catch { /* keep fallback */ }

  return NextResponse.json({ plans: plans ?? [], usd_to_egp: egpRate })
}
