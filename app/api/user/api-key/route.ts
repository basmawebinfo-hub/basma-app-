import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import crypto from "crypto"

function generateApiKey() {
  const raw = "bsm_live_" + crypto.randomBytes(24).toString("hex")
  const prefix = raw.slice(0, 22) + "..."
  const hash = crypto.createHash("sha256").update(raw).digest("hex")
  return { key: raw, prefix, hash }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data } = await supabase
    .from("api_keys")
    .select("key_prefix, is_active, last_used_at, created_at")
    .eq("user_id", user.id)
    .single()

  return NextResponse.json(data ?? { key_prefix: null })
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { key, prefix, hash } = generateApiKey()

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await service.from("api_keys").upsert(
    { user_id: user.id, key_hash: hash, key_prefix: prefix, is_active: true, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ key, prefix, message: "Copy this key now — it will not be shown again." })
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await supabase
    .from("api_keys")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)

  return NextResponse.json({ ok: true })
}
