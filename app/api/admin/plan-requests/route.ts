import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, adminService } from "@/lib/admin"

// GET /api/admin/plan-requests — list subscription requests
export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })
  const db = adminService()

  const { data: reqs } = await db.from("plan_requests")
    .select("id, user_id, plan_id, status, created_at")
    .order("created_at", { ascending: false }).limit(200)

  const list = reqs ?? []
  const userIds = [...new Set(list.map((r) => r.user_id))]
  const planIds = [...new Set(list.map((r) => r.plan_id))]

  const profById = new Map<string, { email: string; full_name: string | null }>()
  const planById = new Map<string, { name: string; price_monthly: number }>()
  if (userIds.length) {
    const { data: profs } = await db.from("profiles").select("id, email, full_name").in("id", userIds)
    for (const p of (profs ?? []) as { id: string; email: string; full_name: string | null }[]) profById.set(p.id, { email: p.email, full_name: p.full_name })
  }
  if (planIds.length) {
    const { data: plans } = await db.from("plans").select("id, name, price_monthly").in("id", planIds)
    for (const p of (plans ?? []) as { id: string; name: string; price_monthly: number }[]) planById.set(p.id, { name: p.name, price_monthly: p.price_monthly })
  }

  // users whose balance ran out and need to renew
  const { data: renewals } = await db.from("profiles")
    .select("id, email, full_name, balance, status")
    .eq("status", "needs_renewal")

  return NextResponse.json({
    renewals: (renewals ?? []).map((u) => ({ id: u.id, email: u.email, name: u.full_name, balance: u.balance })),
    requests: list.map((r) => ({
      id: r.id,
      status: r.status,
      created_at: r.created_at,
      user_id: r.user_id,
      plan_id: r.plan_id,
      email: profById.get(r.user_id)?.email ?? null,
      name: profById.get(r.user_id)?.full_name ?? null,
      plan_name: planById.get(r.plan_id)?.name ?? null,
      plan_price: planById.get(r.plan_id)?.price_monthly ?? null,
    })),
  })
}

// POST /api/admin/plan-requests  { request_id, action: "approve"|"reject" }
export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })
  const db = adminService()
  const { request_id, action } = await req.json().catch(() => ({}))
  if (!request_id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "request_id and valid action required" }, { status: 400 })
  }

  const { data: reqRow } = await db.from("plan_requests").select("user_id, plan_id").eq("id", request_id).maybeSingle()
  if (!reqRow) return NextResponse.json({ error: "Request not found" }, { status: 404 })

  if (action === "approve") {
    // activate subscription for the user with the requested plan
    const { data: plan } = await db.from("plans").select("name, price_monthly, max_instances, max_messages_mo").eq("id", reqRow.plan_id).maybeSingle()
    // upsert subscription
    const now = new Date()
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    // upsert: each user has one subscription row (user_id is unique) — update it to the new plan
    const { error: subErr } = await db.from("subscriptions").upsert({
      user_id: reqRow.user_id, plan_id: reqRow.plan_id,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      status: "active", messages_used: 0, updated_at: now.toISOString(),
    }, { onConflict: "user_id" })
    if (subErr) return NextResponse.json({ error: "Failed to activate subscription: " + subErr.message }, { status: 400 })
    // grant balance = plan price, set limits, activate
    if (plan) {
      await db.from("profiles").update({
        balance: plan.price_monthly ?? 0,   // wallet credit equals the plan price
        max_messages: plan.max_messages_mo ?? 0,
        status: "active",
      }).eq("id", reqRow.user_id)
    }
    await db.from("plan_requests").update({ status: "approved" }).eq("id", request_id)
    // notify the user
    try {
      await db.from("notifications").insert({
        user_id: reqRow.user_id,
        title: "تم تفعيل اشتراكك",
        body: `تمت الموافقة على اشتراكك في باقة "${plan?.name ?? ""}". رصيدك الآن $${plan?.price_monthly ?? 0} ويمكنك ربط حتى ${plan?.max_instances ?? 1} رقم. شكراً لك!`,
        type: "subscription",
      })
    } catch { /* best-effort */ }
  } else {
    await db.from("plan_requests").update({ status: "rejected" }).eq("id", request_id)
  }

  return NextResponse.json({ ok: true })
}
