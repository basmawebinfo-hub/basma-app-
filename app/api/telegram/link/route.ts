import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import crypto from "crypto"

// GET /api/telegram/link — current telegram status
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data } = await supabase.from("profiles").select("telegram_chat_id, telegram_linked_at").eq("id", user.id).single()
  return NextResponse.json({ linked: !!data?.telegram_chat_id, linked_at: data?.telegram_linked_at ?? null })
}

// POST /api/telegram/link — generate a fresh link code
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const code = "BSM-" + crypto.randomBytes(3).toString("hex").toUpperCase()
  const svc = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  await svc.from("profiles").update({ telegram_link_code: code }).eq("id", user.id)

  const botUser = process.env.TELEGRAM_BOT_USERNAME ?? ""
  return NextResponse.json({
    code,
    bot_link: botUser ? `https://t.me/${botUser}?start=${code}` : null,
    instructions: "Open the Telegram bot and send this code to link your account.",
  })
}

// DELETE /api/telegram/link — unlink telegram (user will be forced to re-link)
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const svc = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  await svc.from("profiles").update({ telegram_chat_id: null, telegram_linked_at: null, telegram_link_code: null }).eq("id", user.id)
  return NextResponse.json({ ok: true })
}
