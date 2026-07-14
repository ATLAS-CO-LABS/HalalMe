import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";

// PATCH /api/admin/recipes/bulk
//   { action: "publish"|"unpublish"|"feature"|"unfeature"|"verify"
//             |"delete"|"restore"|"purge", ids: string[] }
// Applies a moderation action to many recipes in one request (replaces the old
// client-side fan-out of N per-row calls). Manage-only. Writes a single audit
// entry for the whole batch. "delete" soft-deletes (Trash); "restore" brings
// them back; "purge" permanently removes them.
const FLAG_UPDATES: Record<string, Record<string, boolean>> = {
  publish: { is_published: true },
  unpublish: { is_published: false },
  feature: { is_featured: true },
  unfeature: { is_featured: false },
  verify: { is_halal_verified: true },
};

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin("kitchen", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  let body: { action?: string; ids?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action ?? "";
  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  if (ids.length === 0) return NextResponse.json({ error: "No recipes selected" }, { status: 400 });
  const lifecycle = ["delete", "restore", "purge"];
  if (!lifecycle.includes(action) && !(action in FLAG_UPDATES)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (lifecycle.includes(action)) {
    let q;
    if (action === "delete") {
      q = serviceClient.from("recipes")
        .update({ deleted_at: new Date().toISOString(), deleted_by: gate.userId, is_published: false })
        .in("id", ids).select("id");
    } else if (action === "restore") {
      q = serviceClient.from("recipes").update({ deleted_at: null, deleted_by: null }).in("id", ids).select("id");
    } else {
      q = serviceClient.from("recipes").delete().in("id", ids).select("id");
    }
    const { data, error } = await q;
    if (error) {
      console.error(`[api/admin/recipes/bulk] ${action} error`, error);
      return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
    }
    const updated = data?.length ?? 0;
    const verb = action === "delete" ? "moved to Trash" : action === "restore" ? "restored" : "permanently deleted";
    logAdminAction(gate, {
      action: `recipe.bulk_${action}`, module: "kitchen", targetType: "recipe",
      summary: `Bulk ${verb} ${updated} recipe${updated !== 1 ? "s" : ""}`,
      metadata: { count: updated, ids },
    });
    return NextResponse.json({ updated });
  }

  const { data, error } = await serviceClient.from("recipes").update(FLAG_UPDATES[action]).in("id", ids).select("id");
  if (error) {
    console.error("[api/admin/recipes/bulk] update error", error);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
  const updated = data?.length ?? 0;
  logAdminAction(gate, {
    action: `recipe.bulk_${action}`, module: "kitchen", targetType: "recipe",
    summary: `Bulk ${action} on ${updated} recipe${updated !== 1 ? "s" : ""}`,
    metadata: { count: updated, ids },
  });
  return NextResponse.json({ updated });
}
