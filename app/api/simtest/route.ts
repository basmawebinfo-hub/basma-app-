import { NextRequest, NextResponse } from "next/server"
import { sendTelegram } from "@/lib/telegram"
import { createClient as createServiceClient } from "@supabase/supabase-js"

// TEMP simulation endpoint — delete after test
function svc() { return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!) }

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("key") !== "fb56ba2d1d3948e4") return NextResponse.json({ error: "no" }, { status: 401 })
  const db = svc()
  const now = new Date()
  const { data: due } = await db.from("subscriptions").select("user_id, plan_id, current_period_end").eq("status", "active").lt("current_period_end", now.toISOString())
  const log: string[] = []
  for (const sub of (due ?? []) as { user_id: string; plan_id: string }[]) {
    const { data: plan } = await db.from("plans").select("name, price_monthly").eq("id", sub.plan_id).maybeSingle()
    const cost = Number(plan?.price_monthly ?? 0)
    const { data: prof } = await db.from("profiles").select("balance, telegram_chat_id").eq("id", sub.user_id).maybeSingle()
    const balance = Number(prof?.balance ?? 0)
    if (cost <= 0) { continue }
    if (balance >= cost) {
      const next = new Date(now.getTime()+30*86400000).toISOString()
      await db.from("profiles").update({ balance: Math.round((balance-cost)*100)/100 }).eq("id", sub.user_id)
      await db.from("subscriptions").update({ current_period_end: next }).eq("user_id", sub.user_id)
      log.push("CHARGED")
    } else {
      await db.from("instances").update({ status: "DISCONNECTED" }).eq("user_id", sub.user_id)
      await db.from("subscriptions").update({ status: "past_due" }).eq("user_id", sub.user_id)
      let tg = false
      try { await db.from("notifications").insert({ user_id: sub.user_id, title: "انتهى رصيدك — يلزم التجديد", body: `رصيدك ($${balance.toFixed(2)}) لا يكفي لتجديد باقة "${plan?.name ?? ""}" ($${cost}). توقفت أرقامك. جدّد للمتابعة.`, type: "renewal" }) } catch {}
      if (prof?.telegram_chat_id) tg = await sendTelegram(prof.telegram_chat_id, `⚠️ <b>انتهى اشتراكك في بصمة</b>\nرصيدك ($${balance.toFixed(2)}) لا يكفي للتجديد ($${cost}/شهر).\nتوقفت كل أرقامك — يجب تجديد رصيدك للمتابعة.`)
      log.push(`SUSPENDED tg=${tg}`)
    }
  }
  return NextResponse.json({ ok: true, log })
}
