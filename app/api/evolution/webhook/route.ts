import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    // ── Security guard: if EVOLUTION_WEBHOOK_SECRET is set, require it ──
    // Evolution must call the webhook with ?key=<secret> (or x-webhook-key header).
    // This blocks anyone who doesn't know the secret from injecting fake events.
    const requiredSecret = process.env.EVOLUTION_WEBHOOK_SECRET
    if (requiredSecret) {
      const provided =
        request.nextUrl.searchParams.get("key") ??
        request.headers.get("x-webhook-key") ??
        ""
      if (provided !== requiredSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const body = await request.json()
    const supabase = getServiceClient()

    const event = (body.event as string) ?? ""
    const instanceName = (body.instance as string) ?? ""
    const data = body.data

    if (!event || !instanceName) return NextResponse.json({ ok: true })

    // CONNECTION_UPDATE
    if (event === "connection.update" || event === "CONNECTION_UPDATE") {
      const state = data?.state ?? data?.connection
      const statusMap: Record<string, string> = {
        open: "CONNECTED", close: "DISCONNECTED", connecting: "CONNECTING",
      }
      await supabase.from("instances")
        .update({ status: statusMap[state] ?? "DISCONNECTED", updated_at: new Date().toISOString() })
        .eq("instance_name", instanceName)
    }

    // QRCODE_UPDATED
    if (event === "qrcode.updated" || event === "QRCODE_UPDATED") {
      await supabase.from("instances")
        .update({ status: "QR_READY", updated_at: new Date().toISOString() })
        .eq("instance_name", instanceName)
    }

    // MESSAGES_UPSERT
    if (event === "messages.upsert" || event === "MESSAGES_UPSERT") {
      const { data: instance } = await supabase
        .from("instances").select("id, user_id")
        .eq("instance_name", instanceName).single()

      if (!instance) return NextResponse.json({ ok: true })

      // Parse messages — Evolution API sends different formats
      let messages: Record<string, unknown>[] = []
      if (Array.isArray(data)) {
        messages = data
      } else if (data?.messages && Array.isArray(data.messages)) {
        messages = data.messages
      } else if (data && typeof data === "object") {
        messages = [data]
      }

      for (const msg of messages) {
        const key = (msg.key as Record<string, unknown>) ?? {}
        const remoteJid = (key.remoteJid as string) ?? ""
        if (!remoteJid || remoteJid.endsWith("@g.us")) continue

        const messageId = (key.id as string) ?? ""
        const fromMe = (key.fromMe as boolean) ?? false
        const ts = msg.messageTimestamp
          ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
          : new Date().toISOString()

        const msgContent = (msg.message as Record<string, unknown>) ?? {}
        const { messageType, text } = parseMessageContent(msgContent)

        const pushName = (msg.pushName as string) ?? null

        // Upsert contact
        const { data: contact } = await supabase.from("contacts")
          .upsert(
            { instance_id: instance.id, remote_jid: remoteJid, push_name: pushName },
            { onConflict: "instance_id,remote_jid", ignoreDuplicates: false }
          ).select("id").single()

        // Upsert chat
        const { data: chat } = await supabase.from("chats")
          .upsert(
            { instance_id: instance.id, remote_jid: remoteJid, last_message_at: ts, unread_count: fromMe ? 0 : 1 },
            { onConflict: "instance_id,remote_jid", ignoreDuplicates: false }
          ).select("id").single()

        if (!chat || !messageId) continue

        // Insert message
        await supabase.from("messages").upsert(
          {
            instance_id: instance.id,
            chat_id: chat.id,
            contact_id: contact?.id ?? null,
            message_id: messageId,
            from_me: fromMe,
            remote_jid: remoteJid,
            message_type: messageType,
            content: { text, raw: msgContent },
            status: fromMe ? "SENT" : "DELIVERED",
            timestamp: ts,
          },
          { onConflict: "instance_id,message_id", ignoreDuplicates: false }
        )
      }

      // Forward to user webhook configs (n8n, Zapier, Make, etc.)
      const { data: configs } = await supabase
        .from("webhook_configs")
        .select("*")
        .eq("user_id", instance.user_id)
        .eq("is_active", true)

      if (configs?.length) {
        // Accept any naming the UI may use for the "incoming message" event
        const incomingAliases = ["MESSAGES_UPSERT", "MESSAGE_RECEIVED", "messages.upsert"]
        const wantsIncoming = (evts: string[] | null) =>
          !evts || evts.length === 0 || evts.some((e) => incomingAliases.includes(e))

        // Log the inbound event once so deliveries can reference it
        const { data: evtRow } = await supabase
          .from("webhook_events")
          .insert({ instance_id: instance.id, event_type: "MESSAGES_UPSERT", payload: body })
          .select("id")
          .single()

        for (const cfg of configs) {
          if (cfg.destination_url && wantsIncoming(cfg.events)) {
            // Create a delivery row (PENDING) then attempt delivery + update status
            const { data: del } = await supabase
              .from("webhook_deliveries")
              .insert({
                event_id: evtRow?.id ?? null,
                webhook_config_id: cfg.id,
                status: "PENDING",
                attempts: 0,
              })
              .select("id")
              .single()

            deliverToDestination(cfg.destination_url, body, cfg.secret)
              .then(async (res) => {
                await supabase.from("webhook_deliveries").update({
                  status: res.ok ? "SUCCESS" : "FAILED",
                  attempts: res.attempts,
                  response_status: res.status,
                  last_attempt_at: new Date().toISOString(),
                  error: res.ok ? null : res.error ?? null,
                }).eq("id", del?.id ?? "")
              })
              .catch(() => {})
          }
        }
      }
    }

    // MESSAGES_UPDATE
    if (event === "messages.update" || event === "MESSAGES_UPDATE") {
      const updates = Array.isArray(data) ? data : [data]
      const { data: instance } = await supabase.from("instances")
        .select("id").eq("instance_name", instanceName).single()
      if (!instance) return NextResponse.json({ ok: true })

      for (const upd of updates as Record<string, unknown>[]) {
        const msgId = (upd?.key as Record<string, unknown>)?.id as string
        const statusRaw = (upd?.update as Record<string, unknown>)?.status as string
        if (!msgId || !statusRaw) continue
        const statusMap: Record<string, string> = {
          ERROR: "FAILED", PENDING: "PENDING", SERVER_ACK: "SENT",
          DELIVERY_ACK: "DELIVERED", READ: "READ", PLAYED: "READ",
        }
        await supabase.from("messages")
          .update({ status: statusMap[statusRaw] ?? "SENT" })
          .eq("instance_id", instance.id).eq("message_id", msgId)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[basma] webhook error:", err)
    return NextResponse.json({ ok: true })
  }
}

// ─── Detect WhatsApp message type + extract a text/preview ──────────────────
function parseMessageContent(m: Record<string, unknown>): { messageType: string; text: string | null } {
  const get = (k: string) => m[k] as Record<string, unknown> | undefined
  if (m.conversation) return { messageType: "TEXT", text: m.conversation as string }
  if (get("extendedTextMessage")) return { messageType: "TEXT", text: (get("extendedTextMessage")!.text as string) ?? null }
  if (get("imageMessage")) return { messageType: "IMAGE", text: (get("imageMessage")!.caption as string) ?? "[image]" }
  if (get("videoMessage")) return { messageType: "VIDEO", text: (get("videoMessage")!.caption as string) ?? "[video]" }
  if (get("audioMessage")) return { messageType: "AUDIO", text: "[audio]" }
  if (get("documentMessage")) return { messageType: "DOCUMENT", text: (get("documentMessage")!.fileName as string) ?? "[document]" }
  if (get("documentWithCaptionMessage")) {
    const inner = (get("documentWithCaptionMessage")!.message as Record<string, unknown>)?.documentMessage as Record<string, unknown> | undefined
    return { messageType: "DOCUMENT", text: (inner?.fileName as string) ?? (inner?.caption as string) ?? "[document]" }
  }
  if (get("stickerMessage")) return { messageType: "STICKER", text: "[sticker]" }
  if (get("locationMessage")) return { messageType: "LOCATION", text: "[location]" }
  if (get("contactMessage") || get("contactsArrayMessage")) return { messageType: "CONTACT", text: "[contact]" }
  if (get("reactionMessage")) return { messageType: "REACTION", text: (get("reactionMessage")!.text as string) ?? "[reaction]" }
  if (get("pollCreationMessage") || get("pollCreationMessageV3")) return { messageType: "POLL", text: "[poll]" }
  if (get("ptvMessage")) return { messageType: "VIDEO", text: "[video note]" }
  return { messageType: "UNKNOWN", text: null }
}

async function deliverToDestination(
  url: string,
  payload: unknown,
  secret?: string
): Promise<{ ok: boolean; status: number; attempts: number; error?: string }> {
  const maxAttempts = 3
  let lastStatus = 0
  let lastError: string | undefined
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "X-Basma-Secret": secret } : {}),
        },
        body: JSON.stringify(payload),
      })
      lastStatus = res.status
      if (res.ok) return { ok: true, status: res.status, attempts: attempt }
      lastError = `HTTP ${res.status}`
    } catch (e) {
      lastError = (e as Error).message
    }
    if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, attempt * 2000))
  }
  return { ok: false, status: lastStatus, attempts: maxAttempts, error: lastError }
}
