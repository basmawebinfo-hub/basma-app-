import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

/** Service-role client (bypasses RLS). Server-only. */
export function adminService() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Verify the current logged-in user is an admin.
 * Returns { ok: true, userId } or { ok: false, status, error }.
 */
export async function requireAdmin(): Promise<
  { ok: true; userId: string; role: string } | { ok: false; status: number; error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, status: 401, error: "Unauthorized" }

  const svc = adminService()
  const { data: profile } = await svc
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    return { ok: false, status: 403, error: "Forbidden — admin only" }
  }
  return { ok: true, userId: user.id, role: profile.role }
}

/** Verify the current user is a SUPER admin (owner-level). */
export async function requireSuperAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; status: number; error: string }
> {
  const gate = await requireAdmin()
  if (!gate.ok) return gate
  if (gate.role !== "super_admin") {
    return { ok: false, status: 403, error: "Forbidden — super admin only" }
  }
  return { ok: true, userId: gate.userId }
}

/** Write an entry to the admin audit log (best-effort). */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>
) {
  try {
    await adminService().from("admin_audit_log").insert({
      admin_id: adminId, action, target_type: targetType ?? null,
      target_id: targetId ?? null, details: details ?? null,
    })
  } catch { /* non-blocking */ }
}
