import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { ilikeTerm } from "@/lib/adminSearch";
import { logAdminAction } from "@/lib/adminAudit";
import { parsePageSize } from "@/lib/adminPaging";

// GET /api/admin/charities
//   ?page=0&status=all|approved|suspended|pending&category=&search=
// Charity directory. Returns the page + global stat counts (total / active /
// total raised / featured) for the cards.
export async function GET(req: NextRequest) {
  const gate = await requireAdmin("rewards", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);
  const PAGE_SIZE = parsePageSize(searchParams);
  const status = searchParams.get("status") ?? "all";
  const category = searchParams.get("category")?.trim();
  const search = searchParams.get("search")?.trim();

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = serviceClient
    .from("charities")
    .select(
      "id, name, slug, category, verification_status, verification_level, verification_score, goal_amount, raised_amount, donor_count, minimum_donation, platform_fee_pct, is_featured, is_zakat_eligible, is_active, image_url, currency, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status !== "all") {
    query = query.eq("verification_status", status);
  }
  if (category) {
    query = query.eq("category", category);
  }
  const term = ilikeTerm(search);
  if (term) {
    query = query.or(`name.ilike.${term},legal_name.ilike.${term},registration_number.ilike.${term}`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("[api/admin/charities] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch charities" }, { status: 500 });
  }

  // Global stats (independent of filters).
  const [totalRes, activeRes, featuredRes, raisedRes] = await Promise.all([
    serviceClient.from("charities").select("id", { count: "exact", head: true }),
    serviceClient.from("charities").select("id", { count: "exact", head: true }).eq("is_active", true),
    serviceClient.from("charities").select("id", { count: "exact", head: true }).eq("is_featured", true),
    serviceClient.from("charities").select("raised_amount"),
  ]);
  const totalRaised = (raisedRes.data ?? []).reduce((sum, c) => sum + Number(c.raised_amount ?? 0), 0);

  let canManage = gate.role === "super_admin";
  if (!canManage) {
    const { data: vp } = await serviceClient
      .from("admin_permissions").select("access")
      .eq("user_id", gate.userId).eq("module", "rewards").single();
    canManage = vp?.access === "manage";
  }

  return NextResponse.json({
    charities: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    canManage,
    stats: {
      total: totalRes.count ?? 0,
      active: activeRes.count ?? 0,
      featured: featuredRes.count ?? 0,
      totalRaised,
    },
  });
}

// POST /api/admin/charities — create a charity directly (seed the directory,
// skipping the application flow). Manage-only.
export async function POST(req: NextRequest) {
  const gate = await requireAdmin("rewards", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const category = String(body.category ?? "").trim();
  const goalAmount = Number(body.goal_amount);

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 });
  if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });
  if (!Number.isFinite(goalAmount) || goalAmount <= 0) {
    return NextResponse.json({ error: "Goal amount must be greater than 0" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const slug = slugify(name) + "-" + Math.random().toString(36).slice(2, 8);

  const { data: charity, error } = await serviceClient
    .from("charities")
    .insert({
      name,
      slug,
      description,
      long_description: typeof body.long_description === "string" ? body.long_description.trim() || null : null,
      category,
      image_url: typeof body.image_url === "string" ? body.image_url.trim() || null : null,
      legal_name: typeof body.legal_name === "string" ? body.legal_name.trim() || null : null,
      registration_number: typeof body.registration_number === "string" ? body.registration_number.trim() || null : null,
      country: typeof body.country === "string" && body.country.trim() ? body.country.trim() : "GB",
      charity_type: typeof body.charity_type === "string" ? body.charity_type : null,
      contact_email: typeof body.contact_email === "string" ? body.contact_email.trim() || null : null,
      website_url: typeof body.website_url === "string" ? body.website_url.trim() || null : null,
      goal_amount: goalAmount,
      minimum_donation: Number.isFinite(Number(body.minimum_donation)) ? Number(body.minimum_donation) : 1,
      platform_fee_pct: Number.isFinite(Number(body.platform_fee_pct)) ? Number(body.platform_fee_pct) : 5,
      is_zakat_eligible: body.is_zakat_eligible === true,
      is_featured: body.is_featured === true,
      verification_status: "approved",
      verification_level: 2,
      verification_source: "admin_manual",
      verified_at: now,
      verified_by: gate.userId,
      last_verified_at: now,
      submitted_by: gate.userId,
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !charity) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "A charity with this registration number already exists for this country" },
        { status: 409 },
      );
    }
    console.error("[api/admin/charities] create error", error);
    return NextResponse.json({ error: "Failed to create charity" }, { status: 500 });
  }

  await serviceClient.from("charity_verification_log").insert({
    charity_id: charity.id,
    changed_by: gate.userId,
    change_type: "level_upgraded",
    previous_level: 0,
    new_level: 2,
    new_status: "approved",
    source: "admin_manual",
    notes: "Created directly by admin (seed)",
  });

  await logAdminAction(gate, {
    action: "charity.create", module: "rewards", targetType: "charity", targetId: charity.id,
    summary: `Created charity ${name}`,
    metadata: { name, category, goal_amount: goalAmount },
  });

  return NextResponse.json({ ok: true, id: charity.id });
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
