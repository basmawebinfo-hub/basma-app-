import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import crypto from "crypto"

function getService() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function verifyHmac(body: string, secret: string, signature: string): boolean {
  try {
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex")
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch { return false }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params
  const rawBody = await request.text()
  const service = getService()

  const { data: wt } = await service
    .from("user_webhook_tokens")
    .select("user_id, hmac_secret, is_active")
    .eq("token", token)
    .single()

  if (!wt || !wt.is_active) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const sig = request.headers.get("x-evolution-signature") ?? ""
  if (sig && !verifyHmac(rawBody, wt.hmac_secret, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = JSON.parse(rawBody) } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }

  const event = (body.event as string) ?? ""
  const instanceName = (body.instance as string) ?? ""
  const evData = body.data as Record<string, unknown> | undefined

  // CONNECTION_UPDATE
  if (event === "connection.update" || event === "CONNECTION_UPDATE") {
    const state = (evData?.state ?? evData?.connection) as string
    const statusMap: Record<string, string> = { open: "CONNECTED", close: "DISCONNECTED", connecting: "CONNECTING" }
    await service.from("instances")
      .update({ status: statusMap[state] ?? "DISCONNECTED", updated_at: new Date().toISOString() })
      .eq("instance_name", instanceName)
  }

  // QRCODE_UPDATED
  if (event === "qrcode.updated" || event === "QRCODE_UPDATED") {
    await service.from("instances")
      .update({ status: "QR_READY", updated_at: new Date().toISOString() })
      .eq("instance_name", instanceName)
  }

  // MESSAGES_UPSERT
  if (event === "messages.upsert" || event === "MESSAGES_UPSERT") {
    const messages = Array.isArray(evData) ? evData : ((evData?.messages ?? [evData]) as unknown[])
    const { data: instance } = await service.from("instances").select("id, user_id").eq("instance_name", instanceName).single()
    if (instance) {
      for (const msg of messages as Record<string, unknown>[]) {
        const remoteJid = (msg.key as Record<string, unknown>)?.remoteJid as string ?? ""
        if (!remoteJid || remoteJid.endsWith("@g.us")) continue
        const messageId = (msg.key as Record<string, unknown>)?.id as string ?? ""
        const fromMe = (msg.key as Record<string, unknown>)?.fromMe as boolean ?? false
        const timestamp = msg.messageTimestamp ? new Date(Number(msg.messageTimestamp) * 1000).toISOString() : new Date().toISOString()
        const msgContent = msg.message as Record<string, unknown> ?? {}
        const text = (msgContent.conversation as string) ?? ((msgContent.extendedTextMessage as Record<string, unknown>)?.text as string) ?? null
        const pushName = msg.pushName as string ?? null

        const { data: contact } = await service.from("contacts")
          .upsert({ instance_id: instance.id, remote_jid: remoteJid, push_name: pushName }, { onConflict: "instance_id,remote_jid" })
          .select("id").single()

        const { data: chat } = await service.from("chats")
          .upsert({ instance_id: instance.id, remote_jid: remoteJid, last_message_at: timestamp, unread_count: fromMe ? 0 : 1 }, { onConflict: "instance_id,remote_jid" })
          .select("id").single()

        if (!chat || !messageId) continue

        await service.from("messages").upsert({
          instance_id: instance.id, chat_id: chat.id, contact_id: contact?.id ?? null,
          message_id: messageId, from_me: fromMe, remote_jid: remoteJid,
          message_type: "TEXT", content: { text, raw: msgContent },
          status: fromMe ? "SENT" : "DELIVERED", timestamp,
        }, { onConflict: "instance_id,message_id" })
      }

      // Auto Reply
      await processAutoReply(service, wt.user_id, instanceName, instance.id, messages as Record<string, unknown>[])
    }
  }

  // MESSAGES_UPDATE
  if (event === "messages.update" || event === "MESSAGES_UPDATE") {
    const updates = Array.isArray(evData) ? evData : [evData]
    const { data: instance } = await service.from("instances").select("id").eq("instance_name", instanceName).single()
    if (instance) {
      for (const upd of updates as Record<string, unknown>[]) {
        const msgId = (upd?.key as Record<string, unknown>)?.id as string
        const statusRaw = (upd?.update as Record<string, unknown>)?.status as string
        if (!msgId || !statusRaw) continue
        const statusMap: Record<string, string> = { ERROR: "FAILED", PENDING: "PENDING", SERVER_ACK: "SENT", DELIVERY_ACK: "DELIVERED", READ: "READ", PLAYED: "READ" }
        await service.from("messages").update({ status: statusMap[statusRaw] ?? "SENT" }).eq("instance_id", instance.id).eq("message_id", msgId)
      }
    }
  }

  // Deliver to user webhook configs
  const { data: configs } = await service.from("webhook_configs").select("*").eq("user_id", wt.user_id).eq("is_active", true)
  if (configs?.length) {
    const eventUpper = event.toUpperCase().replace(".", "_")
    for (const cfg of configs) {
      if (cfg.events.includes(eventUpper) && cfg.destination_url) {
        deliverWebhook(cfg, body).catch(() => {})
      }
    }
  }

  return NextResponse.json({ ok: true })
}

async function processAutoReply(
  service: ReturnType<typeof createServiceClient>,
  userId: string,
  instanceName: string,
  instanceId: string,
  messages: Record<string, unknown>[]
) {
  const { data: rules } = await service.from("auto_reply_rules").select("*")
    .eq("user_id", userId).eq("is_active", true)
    .or(`instance_id.eq.${instanceId},instance_id.is.null`)

  if (!rules?.length) return

  for (const msg of messages) {
    const fromMe = (msg.key as Record<string, unknown>)?.fromMe as boolean
    if (fromMe) continue
    const remoteJid = (msg.key as Record<string, unknown>)?.remoteJid as string ?? ""
    if (!remoteJid || remoteJid.endsWith("@g.us")) continue
    const msgContent = msg.message as Record<string, unknown> ?? {}
    const text = ((msgContent.conversation as string) ?? ((msgContent.extendedTextMessage as Record<string, unknown>)?.text as string) ?? "").toLowerCase()

    for (const rule of rules) {
      let shouldReply = false
      if (rule.trigger_type === "any") shouldReply = true
      else if (rule.trigger_type === "welcome") shouldReply = true
      else if (rule.trigger_type === "keyword" && rule.keywords?.length) {
        shouldReply = rule.keywords.some((kw: string) => text.includes(kw.toLowerCase()))
      } else if (rule.trigger_type === "away" && rule.away_start && rule.away_end) {
        const hour = new Date().getHours()
        const [startH] = rule.away_start.split(":").map(Number)
        const [endH] = rule.away_end.split(":").map(Number)
        shouldReply = hour < startH || hour >= endH
      }
      if (shouldReply) {
        const phone = "+" + remoteJid.replace(/@.*/, "").replace(/[^0-9]/g, "")
        await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: process.env.EVOLUTION_API_KEY ?? "" },
          body: JSON.stringify({ number: phone, text: rule.reply_text }),
        }).catch(() => {})
        break
      }
    }
  }
}

async function deliverWebhook(cfg: Record<string, unknown>, payload: unknown) {
  const maxAttempts = (cfg.retry_count as number) ?? 3
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(cfg.destination_url as string, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Basma-Secret": (cfg.secret as string) ?? "", "X-Basma-Attempt": String(attempt) },
        body: JSON.stringify(payload),
      })
      if (res.ok) return
    } catch {}
    if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, attempt * 2000))
  }
}
