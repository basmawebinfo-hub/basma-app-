import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/instagram/connect  -> redirect to Instagram business login
export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect("https://www.basmaweb.com/login")

  // Instagram-specific app id (NOT the general Meta app id)
  const igAppId = process.env.INSTAGRAM_APP_ID ?? ""
  const redirectUri = "https://www.basmaweb.com/api/instagram/callback"
  const scope = [
    "instagram_business_basic",
    "instagram_business_manage_messages",
    "instagram_business_manage_comments",
  ].join(",")

  const authUrl =
    "https://www.instagram.com/oauth/authorize" +
    "?force_reauth=true" +
    "&client_id=" + encodeURIComponent(igAppId) +
    "&redirect_uri=" + encodeURIComponent(redirectUri) +
    "&response_type=code" +
    "&scope=" + encodeURIComponent(scope) +
    "&state=" + encodeURIComponent(user.id)

  return NextResponse.redirect(authUrl)
}
