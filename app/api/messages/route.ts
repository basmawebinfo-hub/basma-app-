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
    // Return chat list from Evolution API
    try {
      const chats = await fetchChats(inst.instance_name)
      return NextResponse.json({ chats })
    } catch (e: unknown) {
      return NextResponse.json({ error: (e as Error).message }, { status: 502 })
    }
  }

  // Return messages for a specific JID
  try {
    const messages = await fetchMessages(inst.instance_name, jid)
    return NextResponse.json({ messages })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
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
