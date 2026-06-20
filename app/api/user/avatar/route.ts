import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

// POST /api/user/avatar  { image: dataURL }  -> uploads and saves avatar_url
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { image } = await req.json().catch(() => ({}))
  if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image" }, { status: 400 })
  }

  // parse data URL
  const match = image.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) return NextResponse.json({ error: "Invalid image format" }, { status: 400 })
  const mime = match[1]
  const ext = mime.split("/")[1]
  const buffer = Buffer.from(match[2], "base64")
  if (buffer.length > 2 * 1024 * 1024) return NextResponse.json({ error: "Image too large (max 2MB)" }, { status: 400 })

  const svc = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const path = `${user.id}/avatar.${ext}`
  const { error: upErr } = await svc.storage.from("avatars").upload(path, buffer, { contentType: mime, upsert: true })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 })

  const { data: pub } = svc.storage.from("avatars").getPublicUrl(path)
  const url = pub.publicUrl + "?t=" + Date.now()  // cache-bust
  await svc.from("profiles").update({ avatar_url: url }).eq("id", user.id)

  return NextResponse.json({ ok: true, avatar_url: url })
}
