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
      const newStatus = statusMap[state] ?? "DISCONNECTED"

      // Fetch current state to detect a sudden CONNECTED -> DISCONNECTED drop (possible ban)
      const { data: instRow } = await supabase.from("instances")
        .select("id, user_id, status, created_at, instance_name").eq("instance_name", instanceName).maybeSingle()

      await supabase.from("instances")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("instance_name", instanceName)

      // ── Ban detection: was CONNECTED, now dropped to close ──
      if (instRow && instRow.status === "CONNECTED" && newStatus === "DISCONNECTED") {
        const reason = data?.statusReason ?? data?.lastDisconnect?.error?.output?.statusCode
        // 401/403/440 from WhatsApp usually means logged out / banned
        const likelyBan = [401, 403, 440].includes(Number(reason))

        // notify the user (telegram + in-app notification, best-effort)
        try {
          await supabase.from("notifications").insert({
            user_id: instRow.user_id,
            title: likelyBan ? "تحذير: رقم واتساب قد يكون محظوراً" : "تنبيه: انقطع اتصال رقم واتساب",
            body: likelyBan
              ? `الرقم "${instanceName}" انقطع فجأة بكود (${reason}) — قد يكون محظوراً أو تم تسجيل الخروج. راجع الرقم فوراً.`
              : `الرقم "${instanceName}" انقطع. أعد ربطه من صفحة الاتصالات.`,
            type: likelyBan ? "ban_warning" : "disconnect",
          })
        } catch { /* notifications table best-effort */ }

        // telegram alert if linked
        try {
          const { data: prof } = await supabase.from("profiles").select("telegram_chat_id").eq("id", instRow.user_id).maybeSingle()
          const token = process.env.TELEGRAM_BOT_TOKEN ?? ""
          if (prof?.telegram_chat_id && token) {
            const msg = likelyBan
              ? `🚨 تحذير حظر محتمل!\nالرقم "${instanceName}" انقطع فجأة (كود ${reason}). قد يكون محظوراً.\nخفّف الإرسال وتجنّب الرسائل الجماعية.`
              : `⚠️ انقطع اتصال الرقم "${instanceName}". أعد ربطه من المنصة.`
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: prof.telegram_chat_id, text: msg }),
            })
          }
        } catch { /* best-effort */ }
      }
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
        const { messageType, text, media } = parseMessageContent(msgContent)

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
            content: { text, media, raw: msgContent },
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
        .or(`instance_id.is.null,instance_id.eq.${instance.id}`)

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
interface ParsedMedia {
  thumbnail?: string | null   // base64 jpeg thumbnail (data URL ready)
  mimetype?: string | null
  fileName?: string | null
  mediaUrl?: string | null    // encrypted WhatsApp URL (needs Evolution to decrypt)
  seconds?: number | null     // audio/video duration
}
function jpegThumbToDataUrl(t: unknown): string | null {
  // Evolution sends jpegThumbnail as an object of byte values or a base64 string
  if (!t) return null
  if (typeof t === "string") return `data:image/jpeg;base64,${t}`
  try {
    const bytes = Object.values(t as Record<string, number>)
    const b64 = Buffer.from(bytes).toString("base64")
    return `data:image/jpeg;base64,${b64}`
  } catch { return null }
}
function parseMessageContent(m: Record<string, unknown>): { messageType: string; text: string | null; media: ParsedMedia | null } {
  const get = (k: string) => m[k] as Record<string, unknown> | undefined
  if (m.conversation) return { messageType: "TEXT", text: m.conversation as string, media: null }
  if (get("extendedTextMessage")) return { messageType: "TEXT", text: (get("extendedTextMessage")!.text as string) ?? null, media: null }
  if (get("imageMessage")) {
    const im = get("imageMessage")!
    return { messageType: "IMAGE", text: (im.caption as string) ?? "[image]",
      media: { thumbnail: jpegThumbToDataUrl(im.jpegThumbnail), mimetype: (im.mimetype as string) ?? "image/jpeg", mediaUrl: (im.url as string) ?? null } }
  }
  if (get("videoMessage")) {
    const vm = get("videoMessage")!
    return { messageType: "VIDEO", text: (vm.caption as string) ?? "[video]",
      media: { thumbnail: jpegThumbToDataUrl(vm.jpegThumbnail), mimetype: (vm.mimetype as string) ?? "video/mp4", mediaUrl: (vm.url as string) ?? null } }
  }
  if (get("audioMessage")) {
    const am = get("audioMessage")!
    return { messageType: "AUDIO", text: "[audio]",
      media: { mimetype: (am.mimetype as string) ?? "audio/ogg", mediaUrl: (am.url as string) ?? null, seconds: (am.seconds as number) ?? null } }
  }
  if (get("documentMessage")) {
    const dm = get("documentMessage")!
    return { messageType: "DOCUMENT", text: (dm.fileName as string) ?? "[document]",
      media: { mimetype: (dm.mimetype as string) ?? null, fileName: (dm.fileName as string) ?? null, mediaUrl: (dm.url as string) ?? null } }
  }
  if (get("documentWithCaptionMessage")) {
    const inner = (get("documentWithCaptionMessage")!.message as Record<string, unknown>)?.documentMessage as Record<string, unknown> | undefined
    return { messageType: "DOCUMENT", text: (inner?.fileName as string) ?? (inner?.caption as string) ?? "[document]",
      media: { mimetype: (inner?.mimetype as string) ?? null, fileName: (inner?.fileName as string) ?? null, mediaUrl: (inner?.url as string) ?? null } }
  }
  if (get("stickerMessage")) {
    const sm = get("stickerMessage")!
    return { messageType: "STICKER", text: "[sticker]", media: { mimetype: "image/webp", mediaUrl: (sm.url as string) ?? null } }
  }
  if (get("locationMessage")) return { messageType: "LOCATION", text: "[location]", media: null }
  if (get("contactMessage") || get("contactsArrayMessage")) return { messageType: "CONTACT", text: "[contact]", media: null }
  if (get("reactionMessage")) return { messageType: "REACTION", text: (get("reactionMessage")!.text as string) ?? "[reaction]", media: null }
  if (get("pollCreationMessage") || get("pollCreationMessageV3")) return { messageType: "POLL", text: "[poll]", media: null }
  if (get("ptvMessage")) return { messageType: "VIDEO", text: "[video note]", media: { thumbnail: jpegThumbToDataUrl(get("ptvMessage")!.jpegThumbnail) } }
  return { messageType: "UNKNOWN", text: null, media: null }
}

async function deliverToDestination(
  url: string,
  payload: unknown,
  secret?: string
): Promise<{ ok: boolean; status: number; attempts: number; error?: string }> {
  // More retries for n8n test URLs (webhook-test) so the user has time to click "Listen"
  const isTestUrl = url.includes("/webhook-test/")
  const maxAttempts = isTestUrl ? 8 : 3
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
    if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, isTestUrl ? 3000 : attempt * 2000))
  }
  return { ok: false, status: lastStatus, attempts: maxAttempts, error: lastError }
}
