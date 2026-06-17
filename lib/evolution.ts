/**
 * Evolution API service layer
 * Wraps all HTTP calls to the self-hosted Evolution API server.
 */

const BASE_URL = process.env.EVOLUTION_API_URL?.replace(/\/$/, "") ?? ""
const API_KEY  = process.env.EVOLUTION_API_KEY ?? ""

async function evoFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Evolution API error ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EvoInstance {
  instance: {
    instanceName: string
    status: string
    owner?: string
    profileName?: string
    profilePictureUrl?: string
  }
}

export interface EvoQRCode {
  code: string
  base64: string
}

export interface EvoConnectionState {
  instance: {
    instanceName: string
    state: "open" | "connecting" | "close"
  }
}

export interface EvoMessage {
  key: {
    id: string
    remoteJid: string
    fromMe: boolean
  }
  message: {
    conversation?: string
    extendedTextMessage?: { text: string }
    imageMessage?: { caption?: string }
    audioMessage?: unknown
    videoMessage?: { caption?: string }
    documentMessage?: { caption?: string; fileName?: string }
  }
  messageTimestamp: number
  status?: string
  pushName?: string
}

// ─── Instance management ──────────────────────────────────────────────────────

export async function createInstance(instanceName: string): Promise<EvoInstance> {
  return evoFetch<EvoInstance>("/instance/create", {
    method: "POST",
    body: JSON.stringify({
      instanceName,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
    }),
  })
}

export async function deleteInstance(instanceName: string): Promise<void> {
  await evoFetch(`/instance/delete/${instanceName}`, { method: "DELETE" })
}

export async function getInstanceState(instanceName: string): Promise<EvoConnectionState> {
  return evoFetch<EvoConnectionState>(`/instance/connectionState/${instanceName}`)
}

export async function getQRCode(instanceName: string): Promise<EvoQRCode> {
  return evoFetch<EvoQRCode>(`/instance/connect/${instanceName}`)
}

export async function listInstances(): Promise<EvoInstance[]> {
  return evoFetch<EvoInstance[]>("/instance/fetchInstances")
}

// ─── Messaging ────────────────────────────────────────────────────────────────

export async function sendText(
  instanceName: string,
  to: string,
  text: string
): Promise<unknown> {
  return evoFetch(`/message/sendText/${instanceName}`, {
    method: "POST",
    body: JSON.stringify({ number: to, text }),
  })
}

// Send an image / video / document via URL or base64
export async function sendMedia(
  instanceName: string,
  to: string,
  mediatype: "image" | "video" | "document",
  media: string,            // URL or base64 string
  caption?: string,
  fileName?: string
): Promise<unknown> {
  return evoFetch(`/message/sendMedia/${instanceName}`, {
    method: "POST",
    body: JSON.stringify({
      number: to,
      mediatype,
      media,
      ...(caption ? { caption } : {}),
      ...(fileName ? { fileName } : {}),
    }),
  })
}

// Send a voice note (WhatsApp audio) via URL or base64
export async function sendAudio(
  instanceName: string,
  to: string,
  audio: string            // URL or base64 string
): Promise<unknown> {
  return evoFetch(`/message/sendWhatsAppAudio/${instanceName}`, {
    method: "POST",
    body: JSON.stringify({ number: to, audio }),
  })
}

export async function fetchMessages(
  instanceName: string,
  remoteJid: string,
  count = 40
): Promise<EvoMessage[]> {
  try {
    const res = await evoFetch<EvoMessage[] | { messages: EvoMessage[] }>(
      `/chat/findMessages/${instanceName}`,
      {
        method: "POST",
        body: JSON.stringify({
          where: { key: { remoteJid } },
          limit: count,
        }),
      }
    )
    return Array.isArray(res) ? res : (res as { messages: EvoMessage[] }).messages ?? []
  } catch {
    return []
  }
}

export async function fetchChats(instanceName: string): Promise<unknown[]> {
  try {
    const res = await evoFetch<unknown[] | { chats: unknown[] }>(
      `/chat/findChats/${instanceName}`,
      { method: "POST", body: JSON.stringify({}) }
    )
    return Array.isArray(res) ? res : (res as { chats: unknown[] }).chats ?? []
  } catch {
    return []
  }
}

// ─── Webhook — auto-configured when instance is created ──────────────────────

export async function setInstanceWebhook(
  instanceName: string,
  webhookUrl: string,
  events: string[]
): Promise<unknown> {
  // Evolution API v2 format
  return evoFetch(`/webhook/set/${instanceName}`, {
    method: "POST",
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: webhookUrl,
        webhookByEvents: false,
        webhookBase64: false,
        events,
      },
    }),
  })
}
