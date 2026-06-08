import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchMessages, sendText, fetchChats } from "@/lib/evolution"

// GET /api/messages?instance_id=xxx&jid=xxx
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const instance_id = req.nextUrl.searchParams.get("instance_id")
  const jid = req.nextUrl.searchParams.get("jid")

  if (!instance_id) {
    // Return all chats for user across all instances
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
    // 1. Try Supabase first (populated by webhook)
    const { data: dbChats } = await supabase
      .from("chats")
      .select(`
        id,
        remote_jid,
        last_message_at,
        unread_count,
        contacts ( push_name, profile_pic )
      `)
      .eq("instance_id", instance_id)
      .order("last_message_at", { ascending: false })
      .limit(50)

    if (dbChats && dbChats.length > 0) {
      // Normalise to the EvoChat shape the inbox expects
      const chats = dbChats.map((c: {
        id: string;
        remote_jid: string;
        last_message_at: string | null;
        unread_count: number | null;
        contacts: { push_name: string | null; profile_pic: string | null }[] | null;
      }) => ({
        id: c.id,
        remoteJid: c.remote_jid,
        pushName: Array.isArray(c.contacts) ? (c.contacts[0]?.push_name ?? null) : null,
        unreadCount: c.unread_count ?? 0,
        lastMsgTimestamp: c.last_message_at
          ? Math.floor(new Date(c.last_message_at).getTime() / 1000)
          : null,
      }))
      return NextResponse.json({ chats })
    }

    // 2. Fallback: fetch from Evolution and return (will be empty until first message)
    try {
      const chats = await fetchChats(inst.instance_name)
      return NextResponse.json({ chats })
    } catch (e: unknown) {
      return NextResponse.json({ chats: [], error: (e as Error).message })
    }
  }

  // Return messages for a specific JID
  // 1. Try Supabase first
  const { data: dbMsgs } = await supabase
    .from("messages")
    .select("id, message_id, from_me, remote_jid, content, status, timestamp")
    .eq("instance_id", instance_id)
    .eq("remote_jid", jid)
    .order("timestamp", { ascending: true })
    .limit(60)

  if (dbMsgs && dbMsgs.length > 0) {
    // Normalise to EvoMessage shape
    const messages = dbMsgs.map((m: {
      id: string;
      message_id: string;
      from_me: boolean;
      remote_jid: string;
      content: { text?: string; raw?: Record<string, unknown> };
      status: string;
      timestamp: string;
    }) => ({
      key: { id: m.message_id, remoteJid: m.remote_jid, fromMe: m.from_me },
      message: m.content?.raw ?? { conversation: m.content?.text ?? "" },
      messageTimestamp: Math.floor(new Date(m.timestamp).getTime() / 1000),
      status: m.status,
    }))
    return NextResponse.json({ messages })
  }

  // 2. Fallback: fetch from Evolution API
  try {
    const messages = await fetchMessages(inst.instance_name, jid)
    return NextResponse.json({ messages })
  } catch (e: unknown) {
    return NextResponse.json({ messages: [], error: (e as Error).message })
  }
}

// POST /api/messages — send a message
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
    .select("instance_name")
    .eq("id", instance_id)
    .eq("user_id", user.id)
    .single()

  if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const result = await sendText(inst.instance_name, to, text)
    return NextResponse.json(result)
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}
