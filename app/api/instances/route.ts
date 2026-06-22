import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createInstance, deleteInstance, setInstanceWebhook } from "@/lib/evolution"
import { getUserPlan } from "@/lib/plan"

const WEBHOOK_EVENTS = [
  "MESSAGES_UPSERT",
  "MESSAGES_UPDATE",
  "SEND_MESSAGE",
  "CONNECTION_UPDATE",
  "QRCODE_UPDATED",
  "CONTACTS_UPSERT",
  "CHATS_UPSERT",
  "CHATS_UPDATE",
]

// GET /api/instances
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("instances")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/instances — create instance + auto-set webhook
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { display_name } = await req.json()
  if (!display_name?.trim()) {
    return NextResponse.json({ error: "display_name is required" }, { status: 400 })
  }

  // Enforce account status + per-plan instance limit (from subscriptions)
  const { data: profile } = await supabase
    .from("profiles")
    .select("status, balance")
    .eq("id", user.id)
    .single()

  if (profile?.status === "suspended") {
    return NextResponse.json({ error: "Your account is suspended" }, { status: 403 })
  }

  const plan = await getUserPlan(user.id)

  const { count: currentCount } = await supabase
    .from("instances")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)

  const maxInstances = plan.max_instances ?? 1
  if ((currentCount ?? 0) >= maxInstances) {
    return NextResponse.json(
      { error: `وصلت إلى حد باقتك (${maxInstances} رقم). جدّد أو رقِّ باقتك لإضافة المزيد.` },
      { status: 403 }
    )
  }

  // ── Balance gate: each number costs (plan price / number of numbers) per month ──
  // resolve plan price for cost-per-number
  let pricePerNumber = 0
  if (plan.plan_id) {
    const { data: planRow } = await supabase.from("plans").select("price_monthly, max_instances").eq("id", plan.plan_id).maybeSingle()
    if (planRow && planRow.max_instances > 0) {
      pricePerNumber = Number(planRow.price_monthly) / Number(planRow.max_instances)
    }
  }
  const balance = Number(profile?.balance ?? 0)
  // free/trial plans (price 0) skip the balance gate
  if (pricePerNumber > 0 && balance < pricePerNumber) {
    return NextResponse.json(
      { error: `رصيدك غير كافٍ لإضافة رقم جديد. تكلفة الرقم $${pricePerNumber.toFixed(2)}/شهر ورصيدك $${balance.toFixed(2)}. يرجى تجديد الرصيد.`, need_topup: true },
      { status: 402 }
    )
  }

  const slug = display_name.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20)
  const instance_name = `${user.id.slice(0, 8)}_${slug}_${Date.now()}`

  // 1. Create instance in Evolution API
  await createInstance(instance_name)

  // Deduct the per-number monthly cost from the user's balance
  if (pricePerNumber > 0) {
    await supabase.from("profiles").update({ balance: Math.round((balance - pricePerNumber) * 100) / 100 }).eq("id", user.id)
  }

  // 2. Auto-set webhook in Evolution API — user never needs to touch Evolution API
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.basmaweb.com"
  // Append the shared secret so the inbound webhook can reject forged requests
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET
  const webhookUrl = secret
    ? `${appUrl}/api/evolution/webhook?key=${encodeURIComponent(secret)}`
    : `${appUrl}/api/evolution/webhook`
  try {
    await setInstanceWebhook(
      instance_name,
      webhookUrl,
      WEBHOOK_EVENTS
    )
  } catch (e) {
    console.error("[basma] Failed to set webhook:", e)
    // Continue even if webhook setup fails — global webhook will handle it
  }

  // 3. Save in Supabase
  const { data, error } = await supabase
    .from("instances")
    .insert({
      user_id: user.id,
      instance_name,
      display_name,
      status: "CONNECTING",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/instances?id=xxx
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const { data: inst } = await supabase
    .from("instances")
    .select("instance_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try { await deleteInstance(inst.instance_name) } catch {}

  await supabase.from("instances").delete().eq("id", id)
  return NextResponse.json({ ok: true })
}
