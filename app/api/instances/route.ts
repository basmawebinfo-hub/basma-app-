import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createInstance, deleteInstance, getInstanceState } from "@/lib/evolution"

// GET /api/instances — list all instances for the current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("instances")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/instances — create a new instance
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { display_name } = await req.json()
  if (!display_name?.trim()) {
    return NextResponse.json({ error: "display_name is required" }, { status: 400 })
  }

  // Build a unique instance name: userId prefix + slug
  const slug = display_name.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20)
  const instance_name = `${user.id.slice(0, 8)}_${slug}_${Date.now()}`

  // 1. Create in Evolution API
  await createInstance(instance_name)

  // 2. Save in Supabase
  const { data, error } = await supabase
    .from("instances")
    .insert({
      user_id: user.id,
      instance_name,
      display_name,
      status: "CONNECTING",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/instances?id=xxx
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  // Verify ownership
  const { data: inst } = await supabase
    .from("instances")
    .select("instance_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Delete from Evolution API (best-effort)
  try { await deleteInstance(inst.instance_name) } catch {}

  await supabase.from("instances").delete().eq("id", id)
  return NextResponse.json({ ok: true })
}
