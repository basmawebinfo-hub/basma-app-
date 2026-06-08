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
  code: string   // base64 PNG
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

export async function fetchMessages(
  instanceName: string,
  remoteJid: string,
  count = 40
): Promise<EvoMessage[]> {
  // Evolution v2: POST /chat/findMessages/{instance} with where + limit
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
    // Some versions return { messages: [...] }, others return array directly
    return Array.isArray(res) ? res : (res as { messages: EvoMessage[] }).messages ?? []
  } catch {
    return []
  }
}

export async function fetchChats(instanceName: string): Promise<unknown[]> {
  // Evolution v2: POST /chat/findChats/{instance}
  try {
    const res = await evoFetch<unknown[] | { chats: unknown[] }>(
      `/chat/findChats/${instanceName}`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    )
    return Array.isArray(res) ? res : (res as { chats: unknown[] }).chats ?? []
  } catch {
    return []
  }
}

// ─── Webhook registration ─────────────────────────────────────────────────────

export async function setInstanceWebhook(
  instanceName: string,
  webhookUrl: string,
  events: string[]
): Promise<unknown> {
  return evoFetch(`/webhook/set/${instanceName}`, {
    method: "POST",
    body: JSON.stringify({
      url: webhookUrl,
      webhook_by_events: false,
      webhook_base64: false,
      events,
    }),
  })
}
