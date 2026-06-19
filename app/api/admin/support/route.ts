import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, adminService } from "@/lib/admin"

// GET /api/admin/support            -> list conversations (grouped by chat_id)
// GET /api/admin/support?chat_id=X  -> messages of one conversation
export async function GET(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })
  const db = adminService()
  const chatId = req.nextUrl.searchParams.get("chat_id")

  if (chatId) {
    const { data: msgs } = await db.from("support_messages")
      .select("direction, body, created_at").eq("chat_id", chatId).order("created_at", { ascending: true })
    // mark incoming as read
    await db.from("support_messages").update({ read_by_admin: true }).eq("chat_id", chatId).eq("direction", "in")
    return NextResponse.json({ messages: msgs ?? [] })
  }

  // conversations: latest message per chat_id + customer name + unread count
  const { data: all } = await db.from("support_messages")
    .select("chat_id, user_id, direction, body, read_by_admin, created_at")
    .order("created_at", { ascending: false }).limit(500)

  const convos = new Map<string, { chat_id: string; user_id: string | null; last_body: string; last_at: string; unread: number }>()
  for (const m of (all ?? []) as { chat_id: string; user_id: string | null; direction: string; body: string; read_by_admin: boolean; created_at: string }[]) {
    if (!convos.has(m.chat_id)) convos.set(m.chat_id, { chat_id: m.chat_id, user_id: m.user_id, last_body: m.body, last_at: m.created_at, unread: 0 })
    if (m.direction === "in" && !m.read_by_admin) convos.get(m.chat_id)!.unread++
  }
  // attach customer names
  const list = Array.from(convos.values())
  const uids = list.map((c) => c.user_id).filter(Boolean) as string[]
  const names = new Map<string, string>()
  if (uids.length) {
    const { data: profs } = await db.from("profiles").select("id, full_name, email").in("id", uids)
    for (const p of (profs ?? []) as { id: string; full_name: string; email: string }[]) names.set(p.id, p.full_name || p.email)
  }
  return NextResponse.json({ conversations: list.map((c) => ({ ...c, name: c.user_id ? (names.get(c.user_id) ?? "Customer") : "Unknown" })) })
}

// POST /api/admin/support  { chat_id, body }  -> admin replies to customer via Telegram
export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })
  const db = adminService()
  const { chat_id, body } = await req.json().catch(() => ({}))
  if (!chat_id || !body) return NextResponse.json({ error: "chat_id and body required" }, { status: 400 })

  const token = process.env.TELEGRAM_BOT_TOKEN ?? ""
  let delivered = false
  if (token) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text: body }),
      })
      delivered = r.ok
    } catch { delivered = false }
  }
  await db.from("support_messages").insert({ chat_id, direction: "out", body, read_by_admin: true })
  return NextResponse.json({ ok: true, delivered })
}
