import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendTelegram } from "@/lib/telegram"

// POST /api/telegram/webhook  — set this as the Telegram bot webhook URL
// When a user sends /start BSM-XXXX or just the code, we link their chat.
export async function POST(req: NextRequest) {
  const update = await req.json().catch(() => null)
  if (!update) return NextResponse.json({ ok: true })

  const msg = update.message
  const chatId = msg?.chat?.id ? String(msg.chat.id) : null
  const text = (msg?.text ?? "").trim()
  if (!chatId || !text) return NextResponse.json({ ok: true })

  // Extract code from "/start BSM-XXXX" or a raw "BSM-XXXX"
  const match = text.match(/BSM-[A-F0-9]{6}/i)
  const code = match ? match[0].toUpperCase() : null

  const db = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  if (!code) {
    // Not a link code -> treat as a support message from the customer
    // Find the linked user (if any) by chat_id
    const { data: linkedUser } = await db.from("profiles").select("id, full_name").eq("telegram_chat_id", chatId).single()
    await db.from("support_messages").insert({
      user_id: linkedUser?.id ?? null, chat_id: chatId, direction: "in", body: text, read_by_admin: false,
    })
    await sendTelegram(chatId, "تم استلام رسالتك ✅ سيتواصل معك فريق الدعم في أقرب وقت.")
    return NextResponse.json({ ok: true })
  }

  // Find the user with this link code (need name + balance for the welcome message)
  const { data: profile } = await db.from("profiles").select("id, email, full_name, balance").eq("telegram_link_code", code).single()
  if (!profile) {
    await sendTelegram(chatId, "كود غير صحيح أو منتهي. أنشئ كوداً جديداً من إعدادات حسابك في المنصة.")
    return NextResponse.json({ ok: true })
  }

  await db.from("profiles").update({
    telegram_chat_id: chatId, telegram_linked_at: new Date().toISOString(), telegram_link_code: null,
  }).eq("id", profile.id)

  // Resolve current plan for the welcome message
  const { data: sub } = await db.from("subscriptions").select("plan_id, current_period_end").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(1).single()
  let planName = "تجريبي"
  if (sub?.plan_id) {
    const { data: pl } = await db.from("plans").select("name").eq("id", sub.plan_id).single()
    if (pl?.name) planName = pl.name
  }

  const name = profile.full_name || profile.email || "عميلنا العزيز"
  const balance = Number(profile.balance ?? 0).toFixed(2)

  const welcome = [
    `مرحباً ${name}! 👋`,
    ``,
    `تم ربط حسابك في <b>BASMA</b> بتليجرام بنجاح ✅`,
    `سيصلك هنا كل ما يخص اشتراكك وحسابك.`,
    ``,
    `💰 رصيدك الحالي: <b>$${balance}</b>`,
    `📦 باقتك: <b>${planName}</b>`,
    ``,
    `<b>ماذا يفعل هذا البوت؟</b>`,
    `• يرسل لك إشعار عند إيداع رصيد في حسابك`,
    `• يرسل لك الخصم اليومي ورصيدك المتبقي`,
    `• ينبّهك قبل انتهاء اشتراكك بوقت كافٍ`,
    `• ينبّهك عند انخفاض رصيدك`,
    `• يوصّل لك رسائل وتنبيهات الإدارة`,
    ``,
    `شكراً لاستخدامك BASMA 🌟`,
  ].join("\n")

  await sendTelegram(chatId, welcome)
  return NextResponse.json({ ok: true })
}
