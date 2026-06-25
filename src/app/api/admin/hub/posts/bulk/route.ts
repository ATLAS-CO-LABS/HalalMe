import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";

// PATCH /api/admin/hub/posts/bulk
//   { action: "publish"|"unpublish"|"delete", ids: string[] }
// Bulk moderation of posts in one request. Manage-only. Delete cascades to
// comments/likes/bookmarks via FK. Writes a single audit entry per batch.
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
  if (!["publish", "unpublish", "delete"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (action === "delete") {
    const { data, error } = await serviceClient.from("posts").delete().in("id", ids).select("id");
    if (error) {
      console.error("[api/admin/hub/posts/bulk] delete error", error);
      return NextResponse.json({ error: "Bulk delete failed" }, { status: 500 });
    }
    const updated = data?.length ?? 0;
    await logAdminAction(gate, {
      action: "post.bulk_delete", module: "hub", targetType: "post",
      summary: `Bulk deleted ${updated} post${updated !== 1 ? "s" : ""}`,
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
