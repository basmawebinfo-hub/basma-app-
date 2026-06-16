import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import crypto from "crypto"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data } = await supabase
    .from("user_webhook_tokens")
    .select("token, hmac_secret, is_active, created_at")
    .eq("user_id", user.id)
    .single()

  if (!data) return NextResponse.json({ token: null, webhook_url: null })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
  return NextResponse.json({
    token: data.token,
    webhook_url: `${baseUrl}/api/wh/${data.token}`,
    hmac_secret: data.hmac_secret,
    is_active: data.is_active,
  })
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const token = crypto.randomBytes(32).toString("hex")
  const hmac_secret = crypto.randomBytes(32).toString("hex")
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await service.from("user_webhook_tokens").upsert(
    { user_id: user.id, token, hmac_secret, is_active: true },
    { onConflict: "user_id" }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    token,
    webhook_url: `${baseUrl}/api/wh/${token}`,
    hmac_secret,
    message: "Set this URL in your Evolution API instance webhook settings.",
  })
}
