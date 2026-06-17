import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import crypto from "crypto"

/**
 * Fetch decrypted media (voice/image/video/document) for an inbound WhatsApp message.
 * Automations call this to get the actual file bytes (WhatsApp media is encrypted).
 *
 * Auth: Authorization: Bearer bsm_live_xxxxx
 * Body: { "message_id": "3A1E...", "instance_id": "uuid" (optional) }
 * Returns: { base64, mimetype, fileName, mediaType }
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

function service() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? ""
  const apiKey = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : (req.headers.get("x-api-key") ?? "").trim()
  if (!apiKey.startsWith("bsm_live_")) {
    return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401, headers: CORS })
  }

  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")
  const db = service()
  const { data: keyRow } = await db.from("api_keys").select("user_id, is_active").eq("key_hash", keyHash).single()
  if (!keyRow || !keyRow.is_active) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401, headers: CORS })
  }

  let body: { message_id?: string; instance_id?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS }) }
  const messageId = (body.message_id ?? "").trim()
  if (!messageId) return NextResponse.json({ error: "'message_id' is required" }, { status: 400, headers: CORS })

  // Resolve an instance owned by this user
  let q = db.from("instances").select("instance_name, status").eq("user_id", keyRow.user_id)
  if (body.instance_id) q = q.eq("id", body.instance_id)
  else q = q.eq("status", "CONNECTED")
  const { data: instances } = await q.order("created_at", { ascending: false }).limit(1)
  const inst = instances?.[0]
  if (!inst) return NextResponse.json({ error: "No matching instance" }, { status: 404, headers: CORS })

  // Ask Evolution to decrypt the media
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
      return NextResponse.json({ error: `Evolution error ${res.status}: ${t}` }, { status: 502, headers: CORS })
    }
    const data = await res.json() as { base64?: string; mimetype?: string; fileName?: string; mediaType?: string }
    return NextResponse.json({
      base64: data.base64 ?? null,
      mimetype: data.mimetype ?? null,
      fileName: data.fileName ?? null,
      mediaType: data.mediaType ?? null,
    }, { headers: CORS })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502, headers: CORS })
  }
}
