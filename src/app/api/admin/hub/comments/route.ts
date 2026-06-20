import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const PAGE_SIZE = 25;

// GET /api/admin/hub/comments
//   ?page=0&search=
// Comments moderation list — content, author, parent post link, like count.
export async function GET(req: NextRequest) {
  const gate = await requireAdmin("hub", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);
  const search = searchParams.get("search")?.trim();

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = serviceClient
    .from("comments")
    .select(
      "id, content, post_id, parent_id, like_count, created_at, " +
        "author:profiles!comments_user_id_fkey(id, full_name, username)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    // Match comment content OR the author's name/username.
    const term = `%${search}%`;
    const { data: authors } = await serviceClient
      .from("profiles")
      .select("id")
      .or(`full_name.ilike.${term},username.ilike.${term}`)
      .limit(100);
    const authorIds = (authors ?? []).map((a) => a.id);
    if (authorIds.length > 0) {
      query = query.or(`content.ilike.${term},user_id.in.(${authorIds.join(",")})`);
    } else {
      query = query.ilike("content", term);
    }
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("[api/admin/hub/comments] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }

  const { count: totalComments } = await serviceClient
    .from("comments")
    .select("id", { count: "exact", head: true });

  let canManage = gate.role === "super_admin";
  if (!canManage) {
    const { data: vp } = await serviceClient
      .from("admin_permissions").select("access")
      .eq("user_id", gate.userId).eq("module", "hub").single();
    canManage = vp?.access === "manage";
  }

  return NextResponse.json({
    comments: data ?? [],
    total: count ?? 0,
    totalComments: totalComments ?? 0,
    page,
    pageSize: PAGE_SIZE,
    canManage,
  });
}
