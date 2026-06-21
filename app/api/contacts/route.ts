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
import { fetchContacts, getProfilePicture, checkNumberExists } from "@/lib/evolution"

export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }) }

// GET ?instance_id=  -> list contacts
export async function GET(req: NextRequest) {
  const a = await authAndInstance(req, req.nextUrl.searchParams.get("instance_id") ?? undefined)
  if ("error" in a) return NextResponse.json({ error: a.error }, { status: a.status, headers: CORS })
  const number = req.nextUrl.searchParams.get("number")
  try {
    if (number) {
      const pic = await getProfilePicture(a.inst.instance_name, number).catch(() => null)
      const exists = await checkNumberExists(a.inst.instance_name, [number]).catch(() => null)
      return NextResponse.json({ ok: true, number, picture: pic, exists }, { headers: CORS })
    }
    const contacts = await fetchContacts(a.inst.instance_name)
    return NextResponse.json({ ok: true, contacts }, { headers: CORS })
  } catch (e: unknown) { return NextResponse.json({ error: (e as Error).message }, { status: 502, headers: CORS }) }
}
