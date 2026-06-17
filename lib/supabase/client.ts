import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        // Session-only cookies: removed when the browser is fully closed,
        // forcing a fresh login on every new browser session.
        maxAge: undefined,
        // (no expires) -> browser treats it as a session cookie
      },
    }
  )
}
