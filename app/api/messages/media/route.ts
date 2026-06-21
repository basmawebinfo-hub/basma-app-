import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendMedia, sendAudio } from "@/lib/evolution"

// POST /api/messages/media — send media from the inbox (session auth)
// Body: { instance_id, to, type: "image"|"video"|"audio"|"document", media (base64 data URL), fileName? }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { instance_id, to, type, media, fileName } = await req.json().catch(() => ({}))
  if (!instance_id || !to || !type || !media) {
    return NextResponse.json({ error: "instance_id, to, type, media required" }, { status: 400 })
  }

  const { data: inst } = await supabase.from("instances")
    .select("id, instance_name").eq("id", instance_id).eq("user_id", user.id).single()
  if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // strip data URL prefix if present (Evolution wants raw base64 or URL)
  const mediaPayload = typeof media === "string" && media.includes(",") ? media.split(",")[1] : media

  try {
    let result: unknown
    if (type === "audio") {
      result = await sendAudio(inst.instance_name, to, mediaPayload)
    } else {
      result = await sendMedia(inst.instance_name, to, type as "image" | "video" | "document", mediaPayload, undefined, fileName)
    }

    // persist outgoing message
    const remoteJid = to.includes("@") ? to : `${to.replace(/[^0-9]/g, "")}@s.whatsapp.net`
    const { data: chat } = await supabase.from("chats")
      .upsert({ instance_id: inst.id, remote_jid: remoteJid, last_message_at: new Date().toISOString() }, { onConflict: "instance_id,remote_jid" })
      .select("id").single()
    if (chat) {
      const rr = result as { key?: { id?: string } }
      await supabase.from("messages").upsert({
        instance_id: inst.id, chat_id: chat.id,
        message_id: rr?.key?.id ?? `media_${Date.now()}`,
        from_me: true, remote_jid: remoteJid,
        message_type: type.toUpperCase(),
        content: { text: fileName ? `[${type}] ${fileName}` : `[${type}]`, media: { mediaUrl: media } },
        status: "SENT", timestamp: new Date().toISOString(),
      }, { onConflict: "instance_id,message_id" })
    }
    return NextResponse.json({ ok: true, result })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}
