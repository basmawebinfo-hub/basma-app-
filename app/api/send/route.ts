import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendText } from "@/lib/evolution"
import crypto from "crypto"

/**
 * Public send endpoint for automation platforms (n8n, Make, Zapier, etc.)
 *
 * Auth: Authorization: Bearer bsm_live_xxxxx   (the user's API key)
 *
 * Body:
 *   {
 *     "to": "201234567890",            // phone or full JID
 *     "text": "Hello from automation", // message text
 *     "instance_id": "uuid"            // optional; defaults to the user's first CONNECTED instance
 *   }
 *
 * CORS enabled so it can be called from browser-based tools too.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

function service() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  // 1. Extract API key
  const auth = req.headers.get("authorization") ?? ""
  const apiKey = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : (req.headers.get("x-api-key") ?? "").trim()

  if (!apiKey || !apiKey.startsWith("bsm_live_")) {
    return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401, headers: CORS })
  }

  // 2. Hash and look it up
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")
  const db = service()
  const { data: keyRow } = await db
    .from("api_keys")
    .select("user_id, is_active")
    .eq("key_hash", keyHash)
    .single()

  if (!keyRow || !keyRow.is_active) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401, headers: CORS })
  }

  // 3. Parse body
  let body: { to?: string; text?: string; instance_id?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS }) }

  const to = (body.to ?? "").trim()
  const text = (body.text ?? "").trim()
  if (!to || !text) {
    return NextResponse.json({ error: "'to' and 'text' are required" }, { status: 400, headers: CORS })
  }

  // 4. Resolve the instance (must belong to this user)
  let instanceQuery = db
    .from("instances")
    .select("id, instance_name, status")
    .eq("user_id", keyRow.user_id)

  if (body.instance_id) {
    instanceQuery = instanceQuery.eq("id", body.instance_id)
  } else {
    instanceQuery = instanceQuery.eq("status", "CONNECTED")
  }

  const { data: instances } = await instanceQuery.order("created_at", { ascending: false }).limit(1)
  const inst = instances?.[0]

  if (!inst) {
    return NextResponse.json({ error: "No matching instance for this user" }, { status: 404, headers: CORS })
  }
  if (inst.status !== "CONNECTED") {
    return NextResponse.json({ error: "Instance is not connected" }, { status: 400, headers: CORS })
  }

  // 5. Send via Evolution
  try {
    const result = await sendText(inst.instance_name, to, text)

    // Persist the outgoing message so it shows in the inbox
    const remoteJid = to.includes("@") ? to : `${to.replace(/[^0-9]/g, "")}@s.whatsapp.net`
    const { data: chat } = await db
      .from("chats")
      .upsert(
        { instance_id: inst.id, remote_jid: remoteJid, last_message_at: new Date().toISOString() },
        { onConflict: "instance_id,remote_jid", ignoreDuplicates: false }
      )
      .select("id")
      .single()

    if (chat) {
      const r = result as { key?: { id?: string } }
      await db.from("messages").upsert(
        {
          instance_id: inst.id,
          chat_id: chat.id,
          message_id: r?.key?.id ?? `api_${Date.now()}`,
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

    // Update last_used_at on the key (best-effort)
    db.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("key_hash", keyHash).then(() => {})

    return NextResponse.json({ ok: true, instance: inst.instance_name, to: remoteJid, result }, { headers: CORS })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502, headers: CORS })
  }
}
