import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendTelegram, answerCallback } from "@/lib/telegram"

function db() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

const SUPPORT_BTN = [[{ text: "🎧 تواصل مع خدمة العملاء", callback_data: "support_on" }]]
const EXIT_BTN = [[{ text: "✅ إنهاء محادثة الدعم", callback_data: "support_off" }]]

export async function POST(req: NextRequest) {
  const update = await req.json().catch(() => null)
  if (!update) return NextResponse.json({ ok: true })
  const svc = db()

  // ===== Handle button taps (callback queries) =====
  if (update.callback_query) {
    const cq = update.callback_query
    const chatId = String(cq.message?.chat?.id ?? "")
    const data = cq.data as string
    await answerCallback(cq.id)
    if (!chatId) return NextResponse.json({ ok: true })

    if (data === "support_on") {
      await svc.from("telegram_chat_state").upsert({ chat_id: chatId, support_mode: true, updated_at: new Date().toISOString() })
      await sendTelegram(chatId, "🎧 <b>وضع خدمة العملاء</b>\nاكتب رسالتك الآن وسيصل فريق الدعم. سنرد عليك في أقرب وقت.", EXIT_BTN)
    } else if (data === "support_off") {
      await svc.from("telegram_chat_state").upsert({ chat_id: chatId, support_mode: false, updated_at: new Date().toISOString() })
      await sendTelegram(chatId, "تم إنهاء محادثة الدعم. لو احتجت أي مساعدة اضغط الزر بالأسفل.", SUPPORT_BTN)
    }
    return NextResponse.json({ ok: true })
  }

  // ===== Handle text messages =====
  const msg = update.message
  const chatId = msg?.chat?.id ? String(msg.chat.id) : null
  const text = (msg?.text ?? "").trim()
  if (!chatId || !text) return NextResponse.json({ ok: true })

  const match = text.match(/BSM-[A-F0-9]{6}/i)
  const code = match ? match[0].toUpperCase() : null

  if (!code) {
    // Check if this chat is in support mode
    const { data: state } = await svc.from("telegram_chat_state").select("support_mode").eq("chat_id", chatId).maybeSingle()

    if (state?.support_mode) {
      // In support mode -> store message for admin, NO repeated auto-reply
      const { data: linkedUser } = await svc.from("profiles").select("id").eq("telegram_chat_id", chatId).maybeSingle()
      await svc.from("support_messages").insert({
        user_id: linkedUser?.id ?? null, chat_id: chatId, direction: "in", body: text, read_by_admin: false,
      })
      // silent — admin will reply from dashboard
      return NextResponse.json({ ok: true })
    }

    // Not in support mode -> offer the support button (no repeated text spam)
    await sendTelegram(chatId, "أهلاً بك 👋 إذا كنت بحاجة للمساعدة، اضغط الزر بالأسفل للتواصل مع خدمة العملاء.", SUPPORT_BTN)
    return NextResponse.json({ ok: true })
  }

  // ===== Link code flow =====
  const { data: profile } = await svc.from("profiles").select("id, email, full_name, balance, telegram_link_expires_at").eq("telegram_link_code", code).single()
  if (!profile) {
    await sendTelegram(chatId, "كود غير صحيح أو منتهي. أنشئ كوداً جديداً من إعدادات حسابك في المنصة.")
    return NextResponse.json({ ok: true })
  }
  if (!profile.telegram_link_expires_at || new Date(profile.telegram_link_expires_at) < new Date()) {
    await svc.from("profiles").update({ telegram_link_code: null, telegram_link_expires_at: null }).eq("id", profile.id)
    await sendTelegram(chatId, "انتهت صلاحية الكود ⏱️ من فضلك أنشئ كوداً جديداً من المنصة (صالح لدقيقتين فقط).")
    return NextResponse.json({ ok: true })
  }
  const { data: existingLink } = await svc.from("profiles").select("id").eq("telegram_chat_id", chatId).maybeSingle()
  if (existingLink && existingLink.id !== profile.id) {
    await sendTelegram(chatId, "حساب تليجرام هذا مرتبط بالفعل بحساب آخر. لا يمكن ربطه بحسابين.")
    return NextResponse.json({ ok: true })
  }
  await svc.from("support_messages").delete().eq("chat_id", chatId)
  await svc.from("telegram_chat_state").upsert({ chat_id: chatId, support_mode: false, updated_at: new Date().toISOString() })
  await svc.from("profiles").update({
    telegram_chat_id: chatId, telegram_linked_at: new Date().toISOString(), telegram_link_code: null, telegram_link_expires_at: null,
  }).eq("id", profile.id)

  const { data: sub } = await svc.from("subscriptions").select("plan_id").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(1).single()
  let planName = "تجريبي"
  if (sub?.plan_id) {
    const { data: pl } = await svc.from("plans").select("name").eq("id", sub.plan_id).single()
    if (pl?.name) planName = pl.name
  }
  const name = profile.full_name || profile.email || "عميلنا العزيز"
  const balance = Number(profile.balance ?? 0).toFixed(2)
  const welcome = [
    `مرحباً ${name}! 👋`, ``,
    `تم ربط حسابك في <b>BASMA</b> بتليجرام بنجاح ✅`,
    `سيصلك هنا كل ما يخص اشتراكك وحسابك.`, ``,
    `💰 رصيدك الحالي: <b>$${balance}</b>`,
    `📦 باقتك: <b>${planName}</b>`, ``,
    `<b>ماذا يفعل هذا البوت؟</b>`,
    `• إشعار عند إيداع رصيد في حسابك`,
    `• الخصم اليومي ورصيدك المتبقي`,
    `• تنبيه قبل انتهاء اشتراكك`,
    `• تنبيه عند انخفاض رصيدك`,
    `• رسائل وتنبيهات الإدارة`, ``,
    `للتواصل مع الدعم في أي وقت، اضغط الزر بالأسفل.`, ``,
    `شكراً لاستخدامك BASMA 🌟`,
  ].join("\n")
  await sendTelegram(chatId, welcome, SUPPORT_BTN)
  return NextResponse.json({ ok: true })
}
