import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getQRCode } from "@/lib/evolution"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: inst } = await supabase
    .from("instances")
    .select("instance_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const qr = await getQRCode(inst.instance_name)
    return NextResponse.json(qr)
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}
