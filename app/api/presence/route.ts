import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import crypto from "crypto"

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" }
function service() { return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!) }

async function authAndInstance(req: NextRequest, instanceId?: string) {
  const auth = req.headers.get("authorization") ?? ""
  const apiKey = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : (req.headers.get("x-api-key") ?? "").trim()
  if (!apiKey || !apiKey.startsWith("bsm_live_")) return { error: "Missing or invalid API key", status: 401 }
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")
  const db = service()
  const { data: keyRow } = await db.from("api_keys").select("user_id, is_active").eq("key_hash", keyHash).single()
  if (!keyRow || !keyRow.is_active) return { error: "Invalid or revoked API key", status: 401 }
  const { data: prof } = await db.from("profiles").select("status").eq("id", keyRow.user_id).single()
  if (prof?.status === "suspended") return { error: "Account suspended", status: 403 }
  let q = db.from("instances").select("id, instance_name, status").eq("user_id", keyRow.user_id)
  q = instanceId ? q.eq("id", instanceId) : q.eq("status", "CONNECTED")
  const { data: insts } = await q.order("created_at", { ascending: false }).limit(1)
  const inst = insts?.[0]
  if (!inst) return { error: "No matching instance", status: 404 }
  if (inst.status !== "CONNECTED") return { error: "Instance is not connected", status: 400 }
  return { inst, userId: keyRow.user_id, db }
}
import { sendPresence } from "@/lib/evolution"

export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }) }

// POST { to, presence: "composing"|"recording"|"paused"|"available", delay?, instance_id? }
export async function POST(req: NextRequest) {
  const a = await authAndInstance(req, undefined)
  if ("error" in a) return NextResponse.json({ error: a.error }, { status: a.status, headers: CORS })
  const b = await req.json().catch(() => ({}))
  if (!b.to) return NextResponse.json({ error: "'to' is required" }, { status: 400, headers: CORS })
  try {
    const r = await sendPresence(a.inst.instance_name, b.to, b.presence ?? "composing", b.delay ?? 1200)
    return NextResponse.json({ ok: true, result: r }, { headers: CORS })
  } catch (e: unknown) { return NextResponse.json({ error: (e as Error).message }, { status: 502, headers: CORS }) }
}
