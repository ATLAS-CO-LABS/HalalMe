import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";

// PATCH /api/admin/hub/posts/bulk
//   { action: "publish"|"unpublish"|"delete"|"restore"|"purge", ids: string[] }
// Bulk moderation of posts in one request. Manage-only. "delete" soft-deletes
// (Trash); "restore" brings them back; "purge" permanently removes them
// (cascades to comments/likes/bookmarks via FK). One audit entry per batch.
export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin("hub", "manage");
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
  if (ids.length === 0) return NextResponse.json({ error: "No posts selected" }, { status: 400 });
  if (!["publish", "unpublish", "delete", "restore", "purge"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (["delete", "restore", "purge"].includes(action)) {
    let q;
    if (action === "delete") {
      q = serviceClient.from("posts")
        .update({ deleted_at: new Date().toISOString(), deleted_by: gate.userId, is_published: false })
        .in("id", ids).select("id");
    } else if (action === "restore") {
      q = serviceClient.from("posts").update({ deleted_at: null, deleted_by: null }).in("id", ids).select("id");
    } else {
      q = serviceClient.from("posts").delete().in("id", ids).select("id");
    }
    const { data, error } = await q;
    if (error) {
      console.error(`[api/admin/hub/posts/bulk] ${action} error`, error);
      return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
    }
    const updated = data?.length ?? 0;
    const verb = action === "delete" ? "moved to Trash" : action === "restore" ? "restored" : "permanently deleted";
    await logAdminAction(gate, {
      action: `post.bulk_${action}`, module: "hub", targetType: "post",
      summary: `Bulk ${verb} ${updated} post${updated !== 1 ? "s" : ""}`,
      metadata: { count: updated, ids },
    });
    return NextResponse.json({ updated });
  }

  const is_published = action === "publish";
  const { data, error } = await serviceClient.from("posts").update({ is_published }).in("id", ids).select("id");
  if (error) {
    console.error("[api/admin/hub/posts/bulk] update error", error);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
  const updated = data?.length ?? 0;
  await logAdminAction(gate, {
    action: is_published ? "post.bulk_publish" : "post.bulk_unpublish", module: "hub", targetType: "post",
    summary: `Bulk ${is_published ? "published" : "hid"} ${updated} post${updated !== 1 ? "s" : ""}`,
    metadata: { count: updated, ids },
  });
  return NextResponse.json({ updated });
}
