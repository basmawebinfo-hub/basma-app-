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
    await sendTelegram(chatId, "Welcome to BASMA bot. To link your account, send the link code shown in your account settings (starts with BSM-).")
    return NextResponse.json({ ok: true })
  }

  // Find the user with this link code
  const { data: profile } = await db.from("profiles").select("id, email").eq("telegram_link_code", code).single()
  if (!profile) {
    await sendTelegram(chatId, "Invalid or expired code. Generate a new one from your account settings.")
    return NextResponse.json({ ok: true })
  }

  await db.from("profiles").update({
    telegram_chat_id: chatId, telegram_linked_at: new Date().toISOString(), telegram_link_code: null,
  }).eq("id", profile.id)

  await sendTelegram(chatId, `Your account is linked successfully.\nYou'll now receive BASMA alerts here.`)
  return NextResponse.json({ ok: true })
}
