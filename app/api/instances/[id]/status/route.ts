import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getInstanceState } from "@/lib/evolution"

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
    .select("instance_name, id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const state = await getInstanceState(inst.instance_name)
    const evoState = state.instance?.state

    // Map Evolution state → our DB status
    const statusMap: Record<string, string> = {
      open: "CONNECTED",
      connecting: "CONNECTING",
      close: "DISCONNECTED",
    }
    const newStatus = statusMap[evoState] ?? "DISCONNECTED"

    // Sync status back to Supabase
    await supabase.from("instances").update({ status: newStatus }).eq("id", id)

    return NextResponse.json({ status: newStatus, raw: evoState })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}
