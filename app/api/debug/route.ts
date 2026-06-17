import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_evolution_url: !!process.env.EVOLUTION_API_URL,
    has_evolution_key: !!process.env.EVOLUTION_API_KEY,
    has_app_url: !!process.env.NEXT_PUBLIC_APP_URL,
    supabase_url_prefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) ?? "MISSING",
    service_role_prefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) ?? "MISSING",
  })
}
