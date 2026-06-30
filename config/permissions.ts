/**
 * Role × Permission matrix — single source of truth for what each role can do.
 *
 * Roles live in two places in the DB:
 *   - `profiles.role` ∈ { user, admin, super_admin }       (account-level)
 *   - `team_members.role` ∈ { admin, supervisor, agent }   (workspace-level)
 *
 * We unify them here as a single `Role` enum so `hasPermission(user, perm)`
 * has one truth table to consult. The DB-side role columns remain untouched.
 *
 * Adding a new permission:
 *   1. Add it to the `Permission` union.
 *   2. Add it to every role that should grant it.
 *   3. Add it to ROLE_PERMISSIONS below.
 *   4. Use it via `hasPermission(role, "your.permission")` — NEVER hard-check
 *      the role itself in business logic.
 *
 * Source spec: DASHBOARD_INFORMATION_ARCHITECTURE.md §9
 */

export type Role =
  | "owner" // account holder (profiles.role implicitly — they own their workspace)
  | "admin" // elevated account-level admin (profiles.role = 'admin' | 'super_admin')
  | "supervisor" // workspace member with management rights
  | "agent" // workspace member with reply-only rights
  | "viewer" // read-only

export type Permission =
  // Billing
  | "billing.view"
  | "billing.manage"
  | "invoices.view"
  // Workspace
  | "workspace.delete"
  | "workspace.transfer"
  | "workspace.changePlan"
  // Team
  | "team.invite"
  | "team.remove"
  | "team.changeRoles"
  | "team.view"
  // API & integrations
  | "api.manageKeys"
  | "api.viewLogs"
  | "webhooks.manage"
  // WhatsApp numbers
  | "numbers.connect"
  | "numbers.disconnect"
  | "numbers.viewAll"
  | "numbers.viewAssigned"
  // Campaigns
  | "campaigns.create"
  | "campaigns.send"
  | "campaigns.delete"
  | "campaigns.view"
  // Automation
  | "automation.create"
  | "automation.edit"
  | "automation.view"
  // Chats / inbox
  | "chats.viewAll"
  | "chats.viewAssigned"
  | "chats.reply"
  | "chats.assign"
  | "chats.notes"
  // Academy
  | "academy.watch"
  | "academy.trackProgress"
  // Lab
  | "lab.view"
  | "lab.download"
  // Analytics
  | "analytics.view"
  | "analytics.export"
  // Admin (platform-level)
  | "admin.users.manage"
  | "admin.plans.manage"
  | "admin.content.manage"

/**
 * The matrix. Wildcard `*` means "all current and future permissions" — owners
 * always get everything. Use sparingly; explicit lists are auditable.
 */
export const ROLE_PERMISSIONS: Record<Role, ReadonlyArray<Permission | "*">> = {
  owner: ["*"],

  admin: [
    "billing.view",
    "team.invite",
    "team.remove",
    "team.changeRoles",
    "team.view",
    "api.manageKeys",
    "api.viewLogs",
    "webhooks.manage",
    "numbers.connect",
    "numbers.disconnect",
    "numbers.viewAll",
    "campaigns.create",
    "campaigns.send",
    "campaigns.delete",
    "campaigns.view",
    "automation.create",
    "automation.edit",
    "automation.view",
    "chats.viewAll",
    "chats.viewAssigned",
    "chats.reply",
    "chats.assign",
    "chats.notes",
    "academy.watch",
    "academy.trackProgress",
    "lab.view",
    "lab.download",
    "analytics.view",
    "analytics.export",
    "admin.users.manage",
    "admin.plans.manage",
    "admin.content.manage",
  ],

  supervisor: [
    "team.view",
    "api.viewLogs",
    "webhooks.manage",
    "numbers.connect",
    "numbers.disconnect",
    "numbers.viewAll",
    "campaigns.create",
    "campaigns.send",
    "campaigns.view",
    "automation.create",
    "automation.edit",
    "automation.view",
    "chats.viewAll",
    "chats.viewAssigned",
    "chats.reply",
    "chats.assign",
    "chats.notes",
    "academy.watch",
    "academy.trackProgress",
    "lab.view",
    "lab.download",
    "analytics.view",
  ],

  agent: [
    "numbers.viewAssigned",
    "automation.view",
    "chats.viewAssigned",
    "chats.reply",
    "chats.notes",
    "academy.watch",
    "academy.trackProgress",
    "lab.view",
  ],

  viewer: [
    "team.view",
    "api.viewLogs",
    "numbers.viewAll",
    "campaigns.view",
    "automation.view",
    "chats.viewAll",
    "academy.watch",
    "academy.trackProgress",
    "lab.view",
    "analytics.view",
  ],
}

/**
 * Pure check — does this role grant this permission?
 *
 * Use this anywhere that needs an authorization decision: server actions,
 * route handlers, UI guards. For UI gating, prefer the `usePermission` hook
 * which wraps this with the current user's role.
 *
 * @example
 *   if (!hasPermission(user.role, "campaigns.create")) {
 *     throw new PermissionError("campaigns.create")
 *   }
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const grants = ROLE_PERMISSIONS[role]
  if (!grants) return false
  if (grants.includes("*")) return true
  return grants.includes(permission)
}

/**
 * Map raw DB role strings to our canonical Role.
 *
 * - `profiles.role = 'super_admin' | 'admin'` → "admin"
 * - `profiles.role = 'user'`                  → "owner" (they own their workspace)
 * - `team_members.role`                       → passed through as-is when present
 *
 * The caller decides which input to pass — typically:
 *   - For account-level checks: pass `profile.role`
 *   - For workspace-level checks: pass `teamMember.role` if the user is a
 *     member of someone else's workspace, otherwise "owner".
 */
export function normalizeRole(raw: string | null | undefined): Role {
  switch (raw) {
    case "super_admin":
    case "admin":
      return "admin"
    case "supervisor":
      return "supervisor"
    case "agent":
      return "agent"
    case "viewer":
      return "viewer"
    case "user":
    default:
      return "owner"
  }
}
