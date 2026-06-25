import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { ilikeTerm } from "@/lib/adminSearch";

const PAGE_SIZE = 25;

// Canonical post types — mirrors the posts.post_type CHECK constraint
// (004_hub.sql). Returned to the client so the filter is stable and complete
// regardless of which types happen to appear on the current page.
const POST_TYPES = ["general", "recipe", "question", "review"] as const;

// GET /api/admin/hub/posts
//   ?page=0&type=all|<post_type>&published=all|published|unpublished&search=
// Posts moderation list + global stats + the set of post types (for the filter)
// + small "community oversight" stats (top posters, daily volume).
export async function GET(req: NextRequest) {
  const gate = await requireAdmin("hub", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);
  const type = searchParams.get("type") ?? "all";
  const published = searchParams.get("published") ?? "all";
  const search = searchParams.get("search")?.trim();

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = serviceClient
    .from("posts")
    .select(
      "id, content, post_type, media_urls, is_published, like_count, comment_count, view_count, created_at, " +
        "author:profiles!posts_user_id_fkey(id, full_name, username)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (type !== "all") query = query.eq("post_type", type);
  if (published === "published") query = query.eq("is_published", true);
  else if (published === "unpublished") query = query.eq("is_published", false);

  const term = ilikeTerm(search);
  if (term) {
    // Match post content OR the author's name/username.
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
    console.error("[api/admin/hub/posts] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }

  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const [totalRes, publishedRes, todayRes, followsRes] = await Promise.all([
    serviceClient.from("posts").select("id", { count: "exact", head: true }),
    serviceClient.from("posts").select("id", { count: "exact", head: true }).eq("is_published", true),
    serviceClient.from("posts").select("id", { count: "exact", head: true }).gte("created_at", dayAgo),
    serviceClient.from("follows").select("follower_id", { count: "exact", head: true }),
  ]);

  let canManage = gate.role === "super_admin";
  if (!canManage) {
    const { data: vp } = await serviceClient
      .from("admin_permissions").select("access")
      .eq("user_id", gate.userId).eq("module", "hub").single();
    canManage = vp?.access === "manage";
  }

  // Top posters (community oversight): tally post counts per author over the
  // most recent posts, then resolve the top 5 names.
  const { data: posterRows } = await serviceClient
    .from("posts")
    .select("user_id")
    .order("created_at", { ascending: false })
    .limit(2000);
  const byUser = new Map<string, number>();
  for (const r of posterRows ?? []) {
    if (r.user_id) byUser.set(r.user_id, (byUser.get(r.user_id) ?? 0) + 1);
  }
  const topEntries = [...byUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  let topPosters: { id: string; name: string; posts: number }[] = [];
  if (topEntries.length > 0) {
    const { data: profiles } = await serviceClient
      .from("profiles")
      .select("id, full_name, username")
      .in("id", topEntries.map(([id]) => id));
    const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name || (p.username ? `@${p.username}` : "Unknown")]));
    topPosters = topEntries.map(([id, posts]) => ({ id, name: nameById.get(id) ?? "Unknown", posts }));
  }

  return NextResponse.json({
    posts: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    canManage,
    topPosters,
    postTypes: POST_TYPES,
    stats: {
      total: totalRes.count ?? 0,
      published: publishedRes.count ?? 0,
      today: todayRes.count ?? 0,
      follows: followsRes.count ?? 0,
    },
  });
}
