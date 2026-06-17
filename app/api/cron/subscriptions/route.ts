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

  return NextResponse.json({ ok: true, downgraded, reminded, ran_at: now })
}
