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
    await db.from("support_messages").update({ read_by_admin: true }).eq("chat_id", chatId).eq("direction", "in")

    // resolve customer name + avatar for the header (by user_id OR telegram_chat_id)
    let customer: { name: string; email: string | null; avatar_url: string | null } | null = null
    const { data: anyMsg } = await db.from("support_messages").select("user_id").eq("chat_id", chatId).not("user_id", "is", null).limit(1).maybeSingle()
    let prof = null
    if (anyMsg?.user_id) {
      const { data } = await db.from("profiles").select("full_name, email, avatar_url").eq("id", anyMsg.user_id).maybeSingle()
      prof = data
    }
    if (!prof) {
      const { data } = await db.from("profiles").select("full_name, email, avatar_url").eq("telegram_chat_id", chatId).maybeSingle()
      prof = data
    }
    if (prof) customer = { name: prof.full_name || prof.email || "Customer", email: prof.email, avatar_url: prof.avatar_url }

    return NextResponse.json({ messages: msgs ?? [], customer })
  }

  // conversations: latest message per chat_id + customer name + unread count
  const { data: all } = await db.from("support_messages")
    .select("chat_id, user_id, direction, body, read_by_admin, created_at")
    .order("created_at", { ascending: false }).limit(500)

  const convos = new Map<string, { chat_id: string; user_id: string | null; last_body: string; last_at: string; unread: number }>()
  for (const m of (all ?? []) as { chat_id: string; user_id: string | null; direction: string; body: string; read_by_admin: boolean; created_at: string }[]) {
    if (!convos.has(m.chat_id)) convos.set(m.chat_id, { chat_id: m.chat_id, user_id: m.user_id, last_body: m.body, last_at: m.created_at, unread: 0 })
    // keep the first non-null user_id we see for this chat
    if (m.user_id && !convos.get(m.chat_id)!.user_id) convos.get(m.chat_id)!.user_id = m.user_id
    if (m.direction === "in" && !m.read_by_admin) convos.get(m.chat_id)!.unread++
  }

  const list = Array.from(convos.values())
  // resolve names + avatars: by user_id first, then by telegram_chat_id fallback
  const uids = list.map((c) => c.user_id).filter(Boolean) as string[]
  const chatIds = list.map((c) => c.chat_id)
  const byId = new Map<string, { name: string; avatar: string | null }>()
  const byTg = new Map<string, { name: string; avatar: string | null }>()
  if (uids.length) {
    const { data: profs } = await db.from("profiles").select("id, full_name, email, avatar_url").in("id", uids)
    for (const p of (profs ?? []) as { id: string; full_name: string; email: string; avatar_url: string | null }[]) byId.set(p.id, { name: p.full_name || p.email, avatar: p.avatar_url })
  }
  if (chatIds.length) {
    const { data: profs2 } = await db.from("profiles").select("telegram_chat_id, full_name, email, avatar_url").in("telegram_chat_id", chatIds)
    for (const p of (profs2 ?? []) as { telegram_chat_id: string; full_name: string; email: string; avatar_url: string | null }[]) byTg.set(String(p.telegram_chat_id), { name: p.full_name || p.email, avatar: p.avatar_url })
  }

  return NextResponse.json({
    conversations: list.map((c) => {
      const resolved = (c.user_id && byId.get(c.user_id)) || byTg.get(String(c.chat_id)) || null
      return { ...c, name: resolved?.name ?? "Customer", avatar_url: resolved?.avatar ?? null }
    }),
  })
}

// POST /api/admin/support  { chat_id, body }
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
