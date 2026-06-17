/**
 * Admin role helpers.
 *
 * Both `admin` and `super_admin` are "staff" — they can reach the admin panel.
 * `super_admin` additionally has implicit full access to every module and is the
 * only role that can manage roles/permissions (enforced per-route, not here).
 *
 * Use `isStaffRole()` for every admin gate instead of comparing to `"admin"`
 * directly, so super admins are never locked out.
 */

export const STAFF_ROLES = ["admin", "super_admin"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === "super_admin";
}
