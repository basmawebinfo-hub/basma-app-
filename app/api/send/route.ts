import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendText, sendMedia, sendAudio, sendLocation, sendContact, sendPoll, sendSticker } from "@/lib/evolution"
import { getUserPlan } from "@/lib/plan"
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

  // ── Account status + monthly message limit checks ──
  const { data: ownerProfile } = await db
    .from("profiles")
    .select("status, max_messages")
    .eq("id", keyRow.user_id)
    .single()

  if (ownerProfile?.status === "suspended") {
    return NextResponse.json({ error: "Account suspended" }, { status: 403, headers: CORS })
  }

  // Count outgoing messages this calendar month (limit from real plan; 0 = unlimited)
  const plan = await getUserPlan(keyRow.user_id)
  const maxMessages = plan.max_messages_mo ?? 0
  if (maxMessages > 0) {
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
    const { data: ownInst } = await db.from("instances").select("id").eq("user_id", keyRow.user_id)
    const instIds = (ownInst ?? []).map((i: { id: string }) => i.id)
    if (instIds.length) {
      const { count } = await db.from("messages")
        .select("id", { count: "exact", head: true })
        .in("instance_id", instIds)
        .eq("from_me", true)
        .gte("timestamp", monthStart.toISOString())
      if ((count ?? 0) >= maxMessages) {
        return NextResponse.json({ error: "Monthly message limit reached (" + maxMessages + ")" }, { status: 429, headers: CORS })
      }
    }
  }

  // 3. Parse body
  let body: {
    to?: string
    text?: string
    instance_id?: string
    type?: string        // "text" | "image" | "video" | "audio" | "document"
    media?: string       // URL or base64 (for image/video/audio/document)
    caption?: string
    fileName?: string
    // location
    latitude?: number
    longitude?: number
    name?: string
    address?: string
    // contact
    contact?: { fullName: string; phoneNumber: string; organization?: string }
    // poll
    question?: string
    options?: string[]
    selectableCount?: number
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS }) }

  const to = (body.to ?? "").trim()
  const type = (body.type ?? "text").toLowerCase()
  const text = (body.text ?? "").trim()
  const media = (body.media ?? "").trim()

  if (!to) {
    return NextResponse.json({ error: "'to' is required" }, { status: 400, headers: CORS })
  }
  if (type === "text" && !text) {
    return NextResponse.json({ error: "'text' is required for text messages" }, { status: 400, headers: CORS })
  }
  const mediaTypes = ["image", "video", "audio", "document", "sticker"]
  if (mediaTypes.includes(type) && !media) {
    return NextResponse.json({ error: "'media' (URL or base64) is required for " + type + " messages" }, { status: 400, headers: CORS })
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

  // 5. Send via Evolution (pick the right method based on type)
  try {
    let result: unknown
    let storedType = "TEXT"
    let storedText = text
    if (type === "text") {
      result = await sendText(inst.instance_name, to, text)
    } else if (type === "audio") {
      result = await sendAudio(inst.instance_name, to, media)
      storedType = "AUDIO"; storedText = "[audio]"
    } else if (type === "image" || type === "video" || type === "document") {
      result = await sendMedia(
        inst.instance_name, to,
        type as "image" | "video" | "document",
        media, body.caption, body.fileName
      )
      storedType = type.toUpperCase()
      storedText = body.caption || (type === "document" ? (body.fileName || "[document]") : `[${type}]`)
    } else if (type === "sticker") {
      result = await sendSticker(inst.instance_name, to, media)
      storedType = "STICKER"; storedText = "[sticker]"
    } else if (type === "location") {
      if (body.latitude == null || body.longitude == null) {
        return NextResponse.json({ error: "'latitude' and 'longitude' are required for location" }, { status: 400, headers: CORS })
      }
      result = await sendLocation(inst.instance_name, to, body.latitude, body.longitude, body.name, body.address)
      storedType = "LOCATION"; storedText = body.name || "[location]"
    } else if (type === "contact") {
      if (!body.contact?.fullName || !body.contact?.phoneNumber) {
        return NextResponse.json({ error: "'contact' with fullName and phoneNumber is required" }, { status: 400, headers: CORS })
      }
      result = await sendContact(inst.instance_name, to, body.contact)
      storedType = "CONTACT"; storedText = body.contact.fullName
    } else if (type === "poll") {
      if (!body.question || !Array.isArray(body.options) || body.options.length < 2) {
        return NextResponse.json({ error: "'question' and at least 2 'options' are required for poll" }, { status: 400, headers: CORS })
      }
      result = await sendPoll(inst.instance_name, to, body.question, body.options, body.selectableCount ?? 1)
      storedType = "POLL"; storedText = body.question
    } else {
      return NextResponse.json({ error: "Unsupported type: " + type }, { status: 400, headers: CORS })
    }

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
          message_type: storedType,
          content: { text: storedText, media: type !== "text" ? { mediaUrl: media } : null },
          status: "SENT",
          timestamp: new Date().toISOString(),
        },
        { onConflict: "instance_id,message_id", ignoreDuplicates: false }
      )
    }

    // Update last_used_at on the key (best-effort)
    db.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("key_hash", keyHash).then(() => {})
    // Log the API call (best-effort)
    db.from("api_usage_log").insert({
      user_id: keyRow.user_id, endpoint: "/api/send", method: "POST", status: 200,
      detail: `${type} -> ${remoteJid}`,
    }).then(() => {})

    return NextResponse.json({ ok: true, instance: inst.instance_name, to: remoteJid, result }, { headers: CORS })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502, headers: CORS })
  }
}
