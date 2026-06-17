import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendText } from "@/lib/evolution"

// GET /api/messages?instance_id=xxx&jid=xxx
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const instance_id = req.nextUrl.searchParams.get("instance_id")
  const jid = req.nextUrl.searchParams.get("jid")

  if (!instance_id) {
    const { data: instances } = await supabase
      .from("instances")
      .select("id, instance_name, display_name, status")
      .eq("user_id", user.id)
      .eq("status", "CONNECTED")
    return NextResponse.json({ instances: instances ?? [] })
  }

  // Verify ownership
  const { data: inst } = await supabase
    .from("instances")
    .select("instance_name")
    .eq("id", instance_id)
    .eq("user_id", user.id)
    .single()

  if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (!jid) {
    // Chat list: from Supabase only (no Evolution fallback -> no ghost numbers)
    // NOTE: chats and contacts have no direct FK, so we fetch them separately
    // and merge in code (a PostgREST embedded join here returns PGRST200).
    const { data: dbChats } = await supabase
      .from("chats")
      .select("id, remote_jid, last_message_at, unread_count")
      .eq("instance_id", instance_id)
      .order("last_message_at", { ascending: false })
      .limit(100)

    // Fetch contact names for this instance and build a lookup by remote_jid
    const { data: dbContacts } = await supabase
      .from("contacts")
      .select("remote_jid, push_name, profile_pic")
      .eq("instance_id", instance_id)

    const contactMap = new Map<string, { push_name: string | null; profile_pic: string | null }>()
    for (const ct of (dbContacts ?? []) as { remote_jid: string; push_name: string | null; profile_pic: string | null }[]) {
      contactMap.set(ct.remote_jid, { push_name: ct.push_name, profile_pic: ct.profile_pic })
    }

    const chats = (dbChats ?? []).map((c: {
      id: string
      remote_jid: string
      last_message_at: string | null
      unread_count: number | null
    }) => ({
      id: c.id,
      remoteJid: c.remote_jid,
      pushName: contactMap.get(c.remote_jid)?.push_name ?? null,
      profilePic: contactMap.get(c.remote_jid)?.profile_pic ?? null,
      unreadCount: c.unread_count ?? 0,
      lastMsgTimestamp: c.last_message_at
        ? Math.floor(new Date(c.last_message_at).getTime() / 1000)
        : null,
    }))
    return NextResponse.json({ chats })
  }

  // Messages for a specific JID: from Supabase only
  const { data: dbMsgs } = await supabase
    .from("messages")
    .select("id, message_id, from_me, remote_jid, content, status, timestamp")
    .eq("instance_id", instance_id)
    .eq("remote_jid", jid)
    .order("timestamp", { ascending: true })
    .limit(200)

  const messages = (dbMsgs ?? []).map((m: {
    id: string
    message_id: string
    from_me: boolean
    remote_jid: string
    content: { text?: string; raw?: Record<string, unknown> }
    status: string
    timestamp: string
  }) => ({
    key: { id: m.message_id, remoteJid: m.remote_jid, fromMe: m.from_me },
    message: m.content?.raw ?? { conversation: m.content?.text ?? "" },
    messageTimestamp: Math.floor(new Date(m.timestamp).getTime() / 1000),
    status: m.status,
  }))
  return NextResponse.json({ messages })
}

// POST /api/messages - send a message
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { instance_id, to, text } = await req.json()
  if (!instance_id || !to || !text) {
    return NextResponse.json({ error: "instance_id, to, text required" }, { status: 400 })
  }

  const { data: inst } = await supabase
    .from("instances")
    .select("id, instance_name")
    .eq("id", instance_id)
    .eq("user_id", user.id)
    .single()

  if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const result = await sendText(inst.instance_name, to, text)

    // Persist the outgoing message immediately (do not wait for the webhook)
    const remoteJid = to.includes("@") ? to : `${to.replace(/[^0-9]/g, "")}@s.whatsapp.net`
    const { data: chat } = await supabase
      .from("chats")
      .upsert(
        { instance_id: inst.id, remote_jid: remoteJid, last_message_at: new Date().toISOString() },
        { onConflict: "instance_id,remote_jid", ignoreDuplicates: false }
      )
      .select("id")
      .single()

    if (chat) {
      const r = result as { key?: { id?: string } }
      await supabase.from("messages").upsert(
        {
          instance_id: inst.id,
          chat_id: chat.id,
          message_id: r?.key?.id ?? `local_${Date.now()}`,
          from_me: true,
          remote_jid: remoteJid,
          message_type: "TEXT",
          content: { text },
          status: "SENT",
          timestamp: new Date().toISOString(),
        },
        { onConflict: "instance_id,message_id", ignoreDuplicates: false }
      )
    }

    return NextResponse.json(result)
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}
