import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import crypto from "crypto"

// ====== GET: Meta webhook verification ======
// Meta sends ?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
// We must echo back hub.challenge if the verify token matches.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const mode = params.get("hub.mode")
  const token = params.get("hub.verify_token")
  const challenge = params.get("hub.challenge")

  const expected = process.env.META_VERIFY_TOKEN ?? ""
  if (mode === "subscribe" && token && token === expected) {
    // respond with the raw challenge (plain text)
    return new NextResponse(challenge ?? "", { status: 200, headers: { "Content-Type": "text/plain" } })
  }
  return new NextResponse("Forbidden", { status: 403 })
}

// ====== POST: receive Instagram events ======
export async function POST(req: NextRequest) {
  const raw = await req.text()

  // Verify the X-Hub-Signature-256 (HMAC of body with App Secret)
  const appSecret = process.env.META_APP_SECRET ?? ""
  const sigHeader = req.headers.get("x-hub-signature-256") ?? ""
  if (appSecret && sigHeader) {
    const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(raw).digest("hex")
    if (!crypto.timingSafeEqual(Buffer.from(sigHeader), Buffer.from(expected))) {
      return new NextResponse("Invalid signature", { status: 401 })
    }
  }

  let body: Record<string, unknown>
  try { body = JSON.parse(raw) } catch { return NextResponse.json({ ok: true }) }

  const db = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Store the raw event for now (processing engine comes in the next step)
  await db.from("instagram_events").insert({ payload: body, processed: false })

  // Always 200 quickly so Meta does not retry
  return NextResponse.json({ ok: true })
}
