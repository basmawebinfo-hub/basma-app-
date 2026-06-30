import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendTelegram } from "@/lib/telegram"

/**
 * Daily cron: expire subscriptions whose plan_expires_at has passed.
 * Downgrades them to 'free' and notifies them in-app.
 * Also sends a reminder to users expiring within 3 days.
 *
 * Secured by CRON_SECRET (Vercel sets Authorization: Bearer <CRON_SECRET>).
 */
function service() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel cron sends it; manual calls must match too)
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get("authorization") ?? ""
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const db = service()
  const now = new Date().toISOString()
  const in3days = new Date(Date.now() + 3 * 86400000).toISOString()

  // 1) Expired paid plans -> downgrade to free
  const { data: expired } = await db
    .from("profiles")
    .select("id, plan, plan_expires_at, telegram_chat_id")
    .neq("plan", "free")
    .not("plan_expires_at", "is", null)
    .lt("plan_expires_at", now)

  let downgraded = 0
  for (const u of (expired ?? []) as { id: string; plan: string; telegram_chat_id: string | null }[]) {
    await db.from("profiles").update({ plan: "free", plan_expires_at: null }).eq("id", u.id)
    await db.from("notifications").insert({
      user_id: u.id, title: "Subscription expired",
      body: "Your plan has expired and you've been moved to the trial plan. Renew now to restore full features.",
      level: "critical",
    })
    if (u.telegram_chat_id) await sendTelegram(u.telegram_chat_id, "<b>Subscription expired</b>\nتم تحويلك للباقة التجريبية. جدّد الآن.")
    downgraded++
  }

  // 2) Expiring within 3 days -> reminder notification (once per day)
  const { data: soon } = await db
    .from("profiles")
    .select("id, plan, plan_expires_at, telegram_chat_id")
    .neq("plan", "free")
    .not("plan_expires_at", "is", null)
    .gte("plan_expires_at", now)
    .lte("plan_expires_at", in3days)

  let reminded = 0
  for (const u of (soon ?? []) as { id: string; plan_expires_at: string; telegram_chat_id: string | null }[]) {
    const days = Math.ceil((new Date(u.plan_expires_at).getTime() - Date.now()) / 86400000)
    await db.from("notifications").insert({
      user_id: u.id, title: "Subscription expiring soon",
      body: `${days} days left until your plan expires. Renew before it ends to avoid service interruption.`,
      level: "warning",
    })
    if (u.telegram_chat_id) await sendTelegram(u.telegram_chat_id, `<b>Subscription expiring soon</b>\nباقي ${days} يوم. جدّد قبل توقف الخدمة.`)
    reminded++
    // TODO: send email reminder here once an email provider is configured
  }

  // 3) Daily balance deduction (monthly price / 30) for users on a paid plan
  let charged = 0, depleted = 0
  const { data: paidProfiles } = await db
    .from("profiles")
    .select("id, balance, telegram_chat_id")
  const { data: allSubs } = await db.from("subscriptions").select("user_id, plan_id, status")
  const { data: allPlans } = await db.from("plans").select("id, price_monthly, name, tier_slug")
  const planMap = new Map((allPlans ?? []).map((p: { id: string; price_monthly: number; name: string; tier_slug: string }) => [p.id, p]))
  const subMap = new Map((allSubs ?? []).map((s: { user_id: string; plan_id: string; status: string }) => [s.user_id, s]))

  for (const u of (paidProfiles ?? []) as { id: string; balance: number; telegram_chat_id: string | null }[]) {
    const sub = subMap.get(u.id)
    if (!sub || sub.status !== "active") continue
    const plan = planMap.get(sub.plan_id)
    // Tier-driven skip: only the free tier is exempt from daily billing.
    // Custom-plan users CAN be billed if the admin set a price_monthly > 0.
    // (Pre-migration this used `price_monthly <= 0` which mis-skipped any
    // custom plan with price=0 even when the user owed money — see PR #19.)
    if (!plan || plan.tier_slug === "free") continue
    if (!plan.price_monthly || plan.price_monthly <= 0) continue  // nothing to charge

    const dailyCost = Number((plan.price_monthly / 30).toFixed(2))
    const bal = Number(u.balance ?? 0)

    if (bal >= dailyCost) {
      const newBal = Number((bal - dailyCost).toFixed(2))
      await db.from("profiles").update({ balance: newBal }).eq("id", u.id)
      await db.from("credit_transactions").insert({
        user_id: u.id, amount: -dailyCost, type: "debit",
        reason: `Daily charge (${plan.name})`, balance_after: newBal,
      })
      // Daily deduction message (Arabic) to Telegram
      if (u.telegram_chat_id) {
        await sendTelegram(u.telegram_chat_id, `<b>الخصم اليومي</b>\nتم خصم $${dailyCost.toFixed(2)} من رصيدك (باقة ${plan.name}).\nرصيدك الحالي: $${newBal.toFixed(2)}`)
      }
      charged++
      // Low balance warning (< 3 days left)
      if (newBal < dailyCost * 3) {
        await db.from("notifications").insert({
          user_id: u.id, title: "Low balance",
          body: `Your balance is $${newBal}. Top up to keep your plan active.`, level: "warning",
        })
        if (u.telegram_chat_id) await sendTelegram(u.telegram_chat_id, `<b>Low balance</b>\nYour balance is $${newBal}. Top up soon.`)
      }
    } else {
      // Not enough balance -> suspend the subscription
      await db.from("subscriptions").update({ status: "past_due" }).eq("user_id", u.id)
      await db.from("notifications").insert({
        user_id: u.id, title: "Plan paused — insufficient balance",
        body: "Your balance ran out. Top up to reactivate your plan.", level: "critical",
      })
      if (u.telegram_chat_id) await sendTelegram(u.telegram_chat_id, "<b>Plan paused</b>\nYour balance ran out. Top up to reactivate.")
      depleted++
    }
  }

  return NextResponse.json({ ok: true, downgraded, reminded, charged, depleted, ran_at: now })
}
