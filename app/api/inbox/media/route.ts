import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/inbox/media?instance_id=xxx&message_id=xxx
// Decrypts an inbound WhatsApp media message on demand and returns a data URL.
// Session-authenticated (used by the inbox UI).
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const instanceId = req.nextUrl.searchParams.get("instance_id")
  const messageId = req.nextUrl.searchParams.get("message_id")
  if (!instanceId || !messageId) return NextResponse.json({ error: "instance_id and message_id required" }, { status: 400 })

  // verify ownership
  const { data: inst } = await supabase.from("instances")
    .select("instance_name").eq("id", instanceId).eq("user_id", user.id).single()
  if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const evoBase = (process.env.EVOLUTION_API_URL ?? "").replace(/\/$/, "")
  const evoKey = process.env.EVOLUTION_API_KEY ?? ""
  try {
    const res = await fetch(`${evoBase}/chat/getBase64FromMediaMessage/${inst.instance_name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: evoKey },
      body: JSON.stringify({ message: { key: { id: messageId } } }),
    })
    if (!res.ok) {
      const t = await res.text().catch(() => "")
      return NextResponse.json({ error: `Evolution error ${res.status}: ${t}` }, { status: 502 })
    }
    const data = await res.json() as { base64?: string; mimetype?: string; fileName?: string }
    if (!data.base64) return NextResponse.json({ error: "No media data" }, { status: 404 })
    const mimetype = data.mimetype ?? "application/octet-stream"
    return NextResponse.json({
      dataUrl: `data:${mimetype};base64,${data.base64}`,
      mimetype,
      fileName: data.fileName ?? null,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}
