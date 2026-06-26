import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { ilikeTerm } from "@/lib/adminSearch";
import { parsePageSize } from "@/lib/adminPaging";

// GET /api/admin/recipes
//   ?page=0&published=all|published|unpublished&halal=all|verified|unverified
//   &source=all|ai|user&search=
// Recipe moderation list. Returns the page + global stat counts for the cards.
export async function GET(req: NextRequest) {
  const gate = await requireAdmin("kitchen", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);
  const PAGE_SIZE = parsePageSize(searchParams);
  const published = searchParams.get("published") ?? "all";
  const halal = searchParams.get("halal") ?? "all";
  const source = searchParams.get("source") ?? "all";
  const search = searchParams.get("search")?.trim();
  const deleted = searchParams.get("deleted") === "1"; // Trash view

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = serviceClient
    .from("recipes")
    .select(
      "id, title, cuisine, difficulty, image_url, is_published, is_halal_verified, is_ai_generated, is_featured, " +
        "avg_rating, review_count, view_count, created_at, deleted_at, " +
        "author:profiles!recipes_user_id_fkey(id, full_name, username)",
      { count: "exact" },
    )
    .order(deleted ? "deleted_at" : "created_at", { ascending: false })
    .range(from, to);

  // Default list hides the Trash; ?deleted=1 shows only soft-deleted recipes.
  query = deleted ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);

  if (published === "published") query = query.eq("is_published", true);
  else if (published === "unpublished") query = query.eq("is_published", false);

  if (halal === "verified") query = query.eq("is_halal_verified", true);
  else if (halal === "unverified") query = query.eq("is_halal_verified", false);

  if (source === "ai") query = query.eq("is_ai_generated", true);
  else if (source === "user") query = query.eq("is_ai_generated", false);

  const term = ilikeTerm(search);
  if (term) {
    // Match the recipe title OR the author's name/username. The author lives in
    // a joined table, so we first resolve matching author ids, then OR them in.
    const { data: authors } = await serviceClient
      .from("profiles")
      .select("id")
      .or(`full_name.ilike.${term},username.ilike.${term}`)
      .limit(100);
    const authorIds = (authors ?? []).map((a) => a.id);
    if (authorIds.length > 0) {
      query = query.or(`title.ilike.${term},user_id.in.(${authorIds.join(",")})`);
    } else {
      query = query.ilike("title", term);
    }
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("[api/admin/recipes] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }

  // Global stats (independent of filters) — exclude the Trash.
  const [totalRes, publishedRes, unverifiedRes, aiRes, deletedRes] = await Promise.all([
    serviceClient.from("recipes").select("id", { count: "exact", head: true }).is("deleted_at", null),
    serviceClient.from("recipes").select("id", { count: "exact", head: true }).eq("is_published", true).is("deleted_at", null),
    serviceClient.from("recipes").select("id", { count: "exact", head: true }).eq("is_halal_verified", false).is("deleted_at", null),
    serviceClient.from("recipes").select("id", { count: "exact", head: true }).eq("is_ai_generated", true).is("deleted_at", null),
    serviceClient.from("recipes").select("id", { count: "exact", head: true }).not("deleted_at", "is", null),
  ]);

  let canManage = gate.role === "super_admin";
  if (!canManage) {
    const { data: vp } = await serviceClient
      .from("admin_permissions").select("access")
      .eq("user_id", gate.userId).eq("module", "kitchen").single();
    canManage = vp?.access === "manage";
  }

  return NextResponse.json({
    recipes: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    canManage,
    stats: {
      total: totalRes.count ?? 0,
      published: publishedRes.count ?? 0,
      unverified: unverifiedRes.count ?? 0,
      aiGenerated: aiRes.count ?? 0,
      deleted: deletedRes.count ?? 0,
    },
  });
}
