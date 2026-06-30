import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendTelegram } from "@/lib/telegram"

/**
 * Monthly billing cron — runs daily, charges users whose billing period ended.
 * For each active subscription past its current_period_end:
 *   cost = plan.price_monthly  (the wallet was credited that much on approval)
 *   - if balance >= cost: deduct, extend period 30 days
 *   - if balance <  cost: mark numbers needing renewal, disconnect, notify (in-app + Telegram)
 * Secured by CRON_SECRET.
 */
function service() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get("authorization") ?? ""
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = service()
  const now = new Date()
  const nowIso = now.toISOString()

  // subscriptions whose period has ended and are still active
  const { data: due } = await db
    .from("subscriptions")
    .select("user_id, plan_id, current_period_end, status")
    .eq("status", "active")
    .lt("current_period_end", nowIso)

  let charged = 0, suspended = 0
  for (const sub of (due ?? []) as { user_id: string; plan_id: string; current_period_end: string }[]) {
    const { data: plan } = await db.from("plans").select("name, price_monthly, tier_slug").eq("id", sub.plan_id).maybeSingle()
    const cost = Number(plan?.price_monthly ?? 0)
    const { data: prof } = await db.from("profiles").select("balance, telegram_chat_id").eq("id", sub.user_id).maybeSingle()
    const balance = Number(prof?.balance ?? 0)

    // Free tier: just extend, no charge. Tier-driven (post-2026-07-01 migration)
    // so admins can\'t accidentally classify a charged plan as free by setting
    // its price to 0. A zero-price custom/paid plan still falls through to the
    // `cost <= 0` no-op guard below.
    if (plan?.tier_slug === "free") {
      const next = new Date(now.getTime() + 30 * 86400000).toISOString()
      await db.from("subscriptions").update({ current_period_end: next }).eq("user_id", sub.user_id)
      continue
    }
    if (cost <= 0) {
      // Nothing to charge — extend the period anyway so the cron does not
      // re-process this subscription every day.
      const next = new Date(now.getTime() + 30 * 86400000).toISOString()
      await db.from("subscriptions").update({ current_period_end: next }).eq("user_id", sub.user_id)
      continue
    }

    if (balance >= cost) {
      // charge: deduct and extend 30 days
      const newBalance = Math.round((balance - cost) * 100) / 100
      const next = new Date(now.getTime() + 30 * 86400000).toISOString()
      await db.from("profiles").update({ balance: newBalance }).eq("id", sub.user_id)
      await db.from("subscriptions").update({ current_period_end: next }).eq("user_id", sub.user_id)
      charged++
    } else {
      // not enough balance -> suspend numbers + notify
      await db.from("instances").update({ status: "DISCONNECTED" }).eq("user_id", sub.user_id)
      await db.from("subscriptions").update({ status: "past_due" }).eq("user_id", sub.user_id)
      // note: we track "needs renewal" via subscriptions.status = past_due
      // (profiles.status has a CHECK constraint allowing only active/suspended/pending)
      suspended++

      // in-app notification
      try {
        await db.from("notifications").insert({
          user_id: sub.user_id,
          title: "انتهى رصيدك — يلزم التجديد",
          body: `رصيدك ($${balance.toFixed(2)}) لا يكفي لتجديد باقة "${plan?.name ?? ""}" ($${cost}). تم إيقاف أرقامك مؤقتاً. جدّد للاستمرار.`,
          type: "renewal",
        })
      } catch { /* best-effort */ }

      // telegram alert
      try {
        const token = process.env.TELEGRAM_BOT_TOKEN ?? ""
        if (prof?.telegram_chat_id && token) {
          await sendTelegram(prof.telegram_chat_id, `⚠️ انتهى رصيدك في بصمة.\nرصيدك الحالي $${balance.toFixed(2)} لا يكفي لتجديد باقتك ($${cost}/شهر).\nتم إيقاف أرقامك مؤقتاً — جدّد رصيدك لإعادة التشغيل.`)
        }
      } catch { /* best-effort */ }
    }
  }

  return NextResponse.json({ ok: true, charged, suspended, checked: (due ?? []).length })
}
