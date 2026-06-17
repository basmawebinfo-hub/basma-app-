import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

function isSupabaseConfigured() {
  return SUPABASE_URL.startsWith("http://") || SUPABASE_URL.startsWith("https://")
}

export async function updateSession(request: NextRequest) {
  // When Supabase is not configured yet, skip all auth checks so the preview
  // remains accessible without crashing.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  // Do NOT put anything between createServerClient and supabase.auth.getUser()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          // Strip persistence so auth cookies are session-only
          // (cleared when the browser is closed -> fresh login required)
          const sessionOpts = { ...options }
          delete (sessionOpts as { maxAge?: number }).maxAge
          delete (sessionOpts as { expires?: Date }).expires
          supabaseResponse.cookies.set(name, value, sessionOpts)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protect all /dashboard routes — redirect unauthenticated users to /login
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Protect all /admin routes — must be authenticated AND have role = 'admin'
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single()

    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      // Not an admin — bounce to the normal dashboard
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  // Dashboard guard: block suspended users + send admins to /admin (admins have no user dashboard)
  if (user && pathname.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, role")
      .eq("id", user.id)
      .single()
    if (profile?.status === "suspended") {
      const url = request.nextUrl.clone()
      url.pathname = "/suspended"
      return NextResponse.redirect(url)
    }
    if (profile?.role === "admin" || profile?.role === "super_admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/admin"
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from /login and /register
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
