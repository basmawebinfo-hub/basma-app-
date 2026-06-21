import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import crypto from "crypto"

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" }

export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }) }

// GET /api/ping — validate an API key (used by n8n credential test & health checks)
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? ""
  const apiKey = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : (req.headers.get("x-api-key") ?? "").trim()
  if (!apiKey || !apiKey.startsWith("bsm_live_")) {
    return NextResponse.json({ ok: false, error: "Missing or invalid API key" }, { status: 401, headers: CORS })
  }
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")
  const db = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: keyRow } = await db.from("api_keys").select("user_id, is_active").eq("key_hash", keyHash).single()
  if (!keyRow || !keyRow.is_active) {
    return NextResponse.json({ ok: false, error: "Invalid or revoked API key" }, { status: 401, headers: CORS })
  }
  const { data: prof } = await db.from("profiles").select("full_name, email, status").eq("id", keyRow.user_id).maybeSingle()
  return NextResponse.json({ ok: true, account: { name: prof?.full_name ?? null, email: prof?.email ?? null, status: prof?.status ?? null } }, { headers: CORS })
}
