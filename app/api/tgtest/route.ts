import { NextRequest, NextResponse } from "next/server"
import { sendTelegram } from "@/lib/telegram"
import { createClient as createServiceClient } from "@supabase/supabase-js"

// TEMPORARY test endpoint — delete after verifying
function svc() { return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!) }

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  if (key !== "059199b964439c2e") return NextResponse.json({ error: "no" }, { status: 401 })
  const mode = req.nextUrl.searchParams.get("mode") ?? "ping"

  if (mode === "ping") {
    const chatId = req.nextUrl.searchParams.get("chat") ?? ""
    const ok = await sendTelegram(chatId, "🧪 <b>اختبار رسائل بصمة</b>\nرسالة اختبار. إذا وصلتك فكل شيء يعمل ✅")
    return NextResponse.json({ sent: ok, token_configured: !!process.env.TELEGRAM_BOT_TOKEN })
  }

  // mode=billing -> run the billing cron logic once
  const db = svc()
  const now = new Date()
  const { data: due } = await db.from("subscriptions").select("user_id, plan_id, current_period_end, status").eq("status", "active").lt("current_period_end", now.toISOString())
  const log: string[] = []
  for (const sub of (due ?? []) as { user_id: string; plan_id: string }[]) {
    const { data: plan } = await db.from("plans").select("name, price_monthly").eq("id", sub.plan_id).maybeSingle()
    const cost = Number(plan?.price_monthly ?? 0)
    const { data: prof } = await db.from("profiles").select("balance, telegram_chat_id").eq("id", sub.user_id).maybeSingle()
    const balance = Number(prof?.balance ?? 0)
    if (cost <= 0) { log.push(`${sub.user_id.slice(0,8)}: free, extended`); continue }
    if (balance >= cost) {
      const next = new Date(now.getTime() + 30*86400000).toISOString()
      await db.from("profiles").update({ balance: Math.round((balance-cost)*100)/100 }).eq("id", sub.user_id)
      await db.from("subscriptions").update({ current_period_end: next }).eq("user_id", sub.user_id)
      log.push(`${sub.user_id.slice(0,8)}: CHARGED $${cost}`)
    } else {
      await db.from("instances").update({ status: "DISCONNECTED" }).eq("user_id", sub.user_id)
      await db.from("subscriptions").update({ status: "past_due" }).eq("user_id", sub.user_id)
      await db.from("profiles").update({ status: "needs_renewal" }).eq("id", sub.user_id)
      let tg = false
      try {
        await db.from("notifications").insert({ user_id: sub.user_id, title: "انتهى رصيدك — يلزم التجديد", body: `رصيدك ($${balance.toFixed(2)}) لا يكفي لتجديد باقة "${plan?.name ?? ""}" ($${cost}). تم إيقاف أرقامك مؤقتاً.`, type: "renewal" })
      } catch {}
      if (prof?.telegram_chat_id) {
        tg = await sendTelegram(prof.telegram_chat_id, `⚠️ <b>انتهى رصيدك في بصمة</b>\nرصيدك ($${balance.toFixed(2)}) لا يكفي لتجديد باقتك ($${cost}/شهر).\nتم إيقاف أرقامك مؤقتاً — جدّد للاستمرار.`)
      }
      log.push(`${sub.user_id.slice(0,8)}: SUSPENDED, telegram_sent=${tg}`)
    }
  }
  return NextResponse.json({ ok: true, checked: (due ?? []).length, log })
}
