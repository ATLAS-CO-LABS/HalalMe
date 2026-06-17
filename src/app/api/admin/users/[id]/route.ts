import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, type AdminModule } from "@/lib/adminAuth";
import { isSuperAdmin } from "@/lib/adminRoles";

const MODULES: AdminModule[] = ["merchants", "users", "kitchen", "hub", "rewards", "analytics"];
const ACCESS_LEVELS = ["none", "view", "manage"];
const STATUSES = ["active", "suspended", "banned"];

// Profile fields an admin may edit directly. Email is intentionally excluded —
// it mirrors auth.users and changing the login email is out of scope here.
const TEXT_FIELDS = ["full_name", "username", "phone", "location", "bio"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users/[id] — full profile + linked merchant + permission grid.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("users", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { data: user, error } = await serviceClient
    .from("profiles")
    .select(
      "id, full_name, username, email, phone, bio, location, avatar_url, role, status, suspended_reason, suspended_at, suspended_by, is_verified, reward_points, reward_tier, created_at, updated_at",
    )
    .eq("id", id)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Linked merchant (if this user owns one).
  const { data: merchant } = await serviceClient
    .from("merchants")
    .select("id, name, status")
    .eq("user_id", id)
    .maybeSingle();

  // Who suspended them (name for the status panel).
  let suspendedByName: string | null = null;
  if (user.suspended_by) {
    const { data: actor } = await serviceClient
      .from("profiles")
      .select("full_name")
      .eq("id", user.suspended_by)
      .maybeSingle();
    suspendedByName = actor?.full_name ?? null;
  }

  // Current permission grid (only meaningful for 'admin' targets).
  const permissions = Object.fromEntries(MODULES.map((m) => [m, "none"])) as Record<AdminModule, string>;
  if (user.role === "admin") {
    const { data: perms } = await serviceClient
      .from("admin_permissions")
      .select("module, access")
      .eq("user_id", id);
    for (const p of perms ?? []) {
      if ((MODULES as string[]).includes(p.module)) permissions[p.module as AdminModule] = p.access;
    }
  }

  // Does the viewer have manage-level on the users module? (Controls whether the
  // detail page shows edit / status / delete actions.) Super admins always do.
  let canManage = gate.role === "super_admin";
  if (!canManage) {
    const { data: vp } = await serviceClient
      .from("admin_permissions")
      .select("access")
      .eq("user_id", gate.userId)
      .eq("module", "users")
      .single();
    canManage = vp?.access === "manage";
  }

  return NextResponse.json({
    user,
    linkedMerchant: merchant ?? null,
    suspendedByName,
    permissions,
    viewer: { id: gate.userId, role: gate.role, canManage },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/users/[id] — update status (manage) or role/permissions (super_admin).
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("users", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  let body: {
    status?: string;
    reason?: string;
    role?: string;
    permissions?: Record<string, string>;
    full_name?: string;
    username?: string;
    phone?: string | null;
    location?: string | null;
    bio?: string | null;
    is_verified?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const wantsStatus = typeof body.status === "string";
  const wantsRole = typeof body.role === "string";
  const wantsPerms = body.permissions != null && typeof body.permissions === "object";
  const wantsVerify = typeof body.is_verified === "boolean";
  const wantsProfile = wantsVerify || TEXT_FIELDS.some((f) => f in body);

  if (!wantsStatus && !wantsRole && !wantsPerms && !wantsProfile) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Role / permission edits are super_admin-only and never allowed on your own row.
  if (wantsRole || wantsPerms) {
    if (!isSuperAdmin(gate.role)) {
      return NextResponse.json(
        { error: "Only super admins can change roles or permissions" },
        { status: 403 },
      );
    }
    if (id === gate.userId) {
      return NextResponse.json(
        { error: "You cannot change your own role or permissions" },
        { status: 403 },
      );
    }
  }

  // Load the target.
  const { data: target } = await serviceClient
    .from("profiles")
    .select("role, status")
    .eq("id", id)
    .single();

  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // super_admin accounts are immutable from the UI entirely.
  if (target.role === "super_admin") {
    return NextResponse.json(
      { error: "Super admin accounts cannot be modified" },
      { status: 403 },
    );
  }

  // ── Apply role change ──────────────────────────────────────────────────────
  if (wantsRole) {
    const newRole = body.role!;
    if (newRole !== "user" && newRole !== "admin") {
      return NextResponse.json({ error: "Role must be 'user' or 'admin'" }, { status: 400 });
    }
    const { error: roleErr } = await serviceClient
      .from("profiles")
      .update({ role: newRole })
      .eq("id", id);
    if (roleErr) {
      console.error("[api/admin/users/[id]] role update error", roleErr);
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
    // Demoting to user → strip any module permissions.
    if (newRole === "user") {
      await serviceClient.from("admin_permissions").delete().eq("user_id", id);
    }
  }

  // ── Apply permission grid ──────────────────────────────────────────────────
  if (wantsPerms) {
    const rows = Object.entries(body.permissions!)
      .filter(([m, a]) => (MODULES as string[]).includes(m) && ACCESS_LEVELS.includes(a))
      .map(([module, access]) => ({ user_id: id, module, access, updated_at: new Date().toISOString() }));
    if (rows.length > 0) {
      const { error: permErr } = await serviceClient
        .from("admin_permissions")
        .upsert(rows, { onConflict: "user_id,module" });
      if (permErr) {
        console.error("[api/admin/users/[id]] permission upsert error", permErr);
        return NextResponse.json({ error: "Failed to update permissions" }, { status: 500 });
      }
    }
  }

  // ── Apply profile edits (text fields + verification) ───────────────────────
  if (wantsProfile) {
    const update: Record<string, unknown> = {};
    for (const f of TEXT_FIELDS) {
      if (f in body) {
        const raw = (body as Record<string, unknown>)[f];
        const val = typeof raw === "string" ? raw.trim() : raw;
        update[f] = val === "" ? (f === "full_name" || f === "username" ? undefined : null) : val;
      }
    }
    if ("full_name" in update && update.full_name === undefined) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    if ("username" in update && update.username === undefined) {
      return NextResponse.json({ error: "Username cannot be empty" }, { status: 400 });
    }
    if (wantsVerify) update.is_verified = body.is_verified;

    const { error: profileErr } = await serviceClient.from("profiles").update(update).eq("id", id);
    if (profileErr) {
      if (profileErr.code === "23505") {
        return NextResponse.json({ error: "That username is already taken" }, { status: 409 });
      }
      console.error("[api/admin/users/[id]] profile update error", profileErr);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
  }

  // ── Apply status change ────────────────────────────────────────────────────
  if (wantsStatus) {
    const status = body.status!;
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const reason = body.reason?.trim();
    if ((status === "suspended" || status === "banned") && !reason) {
      return NextResponse.json({ error: "A reason is required to suspend or ban" }, { status: 400 });
    }
    const update =
      status === "active"
        ? { status, suspended_reason: null, suspended_at: null, suspended_by: null }
        : { status, suspended_reason: reason, suspended_at: new Date().toISOString(), suspended_by: gate.userId };

    const { error: statusErr } = await serviceClient.from("profiles").update(update).eq("id", id);
    if (statusErr) {
      console.error("[api/admin/users/[id]] status update error", statusErr);
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/users/[id] — permanently remove a user (auth.users cascade).
// Blocked for staff accounts and for the caller's own account.
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("users", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  if (id === gate.userId) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 403 });
  }

  const { data: target } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", id)
    .single();

  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (target.role === "admin" || target.role === "super_admin") {
    return NextResponse.json(
      { error: "Staff accounts cannot be deleted here. Demote to user first." },
      { status: 403 },
    );
  }

  // Removing the auth user cascades to profiles and all owned content (FKs).
  const { error } = await serviceClient.auth.admin.deleteUser(id);
  if (error) {
    console.error("[api/admin/users/[id]] delete error", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
