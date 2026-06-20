import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

// DELETE /api/admin/hub/comments/[id] — delete a comment (cascades to replies
// via the parent_id self-FK ON DELETE CASCADE). Manage-only.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("hub", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { error } = await gate.serviceClient.from("comments").delete().eq("id", id);
  if (error) {
    console.error("[api/admin/hub/comments/[id]] delete error", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
