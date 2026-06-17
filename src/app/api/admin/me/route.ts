import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { isStaffRole, isSuperAdmin } from "@/lib/adminRoles";

// Modules governed by admin_permissions (mirrors 036_admin_roles.sql).
// "Overview" has no module key — it's always visible to any staff role.
const MODULES = ["merchants", "users", "kitchen", "hub", "rewards", "analytics"] as const;
type Module = (typeof MODULES)[number];
type Access = "none" | "view" | "manage";

/**
 * GET /api/admin/me
 * Returns the caller's staff role + per-module access level, so the admin
 * sidebar can show/hide modules. super_admin gets implicit 'manage' on all.
 */
export async function GET() {
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!isStaffRole(profile?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const role = profile!.role as "admin" | "super_admin";

  // super_admin → implicit full access, no table lookup.
  if (isSuperAdmin(role)) {
    const permissions = Object.fromEntries(
      MODULES.map((m) => [m, "manage" as Access]),
    ) as Record<Module, Access>;
    return NextResponse.json({ role, permissions });
  }

  // admin → read explicit grants; any module without a row defaults to 'none'.
  const { data: rows } = await serviceClient
    .from("admin_permissions")
    .select("module, access")
    .eq("user_id", user.id);

  const permissions = Object.fromEntries(
    MODULES.map((m) => [m, "none" as Access]),
  ) as Record<Module, Access>;

  for (const row of rows ?? []) {
    if ((MODULES as readonly string[]).includes(row.module)) {
      permissions[row.module as Module] = row.access as Access;
    }
  }

  return NextResponse.json({ role, permissions });
}
