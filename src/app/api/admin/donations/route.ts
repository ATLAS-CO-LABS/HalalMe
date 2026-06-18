import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const PAGE_SIZE = 25;

// GET /api/admin/donations
//   ?page=0&status=all|pending|completed|failed|refunded&charity=<id>&search=
// Read-only donations ledger. Status transitions are webhook/service-role only,
// so this is view-only. Returns the page + global stats (count / total raised /
// completed / refunded).
export async function GET(req: NextRequest) {
  const gate = await requireAdmin("rewards", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);
  const status = searchParams.get("status") ?? "all";
  const charity = searchParams.get("charity")?.trim();
  const search = searchParams.get("search")?.trim();

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Join charity name + donor name via the FK relationships.
  let query = serviceClient
    .from("donations")
    .select(
      "id, amount, currency, status, points_earned, risk_score, is_anonymous, payment_method_type, created_at, " +
        "user:profiles!donations_user_id_fkey(id, full_name, email), " +
        "charity:charities!donations_charity_id_fkey(id, name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status !== "all") query = query.eq("status", status);
  if (charity) query = query.eq("charity_id", charity);

  const { data, count, error } = await query;

  if (error) {
    console.error("[api/admin/donations] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 });
  }

  // Optional client-side-ish search on the donor name/email (joined field can't
  // be filtered with .or across relations cleanly) — filter the page in memory.
  let rows = data ?? [];
  if (search) {
    const t = search.toLowerCase();
    rows = rows.filter((d) => {
      const raw = (d as { user?: unknown }).user;
      const u = (Array.isArray(raw) ? raw[0] : raw) as { full_name?: string; email?: string } | null;
      return (
        u?.full_name?.toLowerCase().includes(t) ||
        u?.email?.toLowerCase().includes(t)
      );
    });
  }

  // Global stats.
  const [countRes, completedRes, refundedRes, completedSumRes] = await Promise.all([
    serviceClient.from("donations").select("id", { count: "exact", head: true }),
    serviceClient.from("donations").select("id", { count: "exact", head: true }).eq("status", "completed"),
    serviceClient.from("donations").select("id", { count: "exact", head: true }).eq("status", "refunded"),
    serviceClient.from("donations").select("amount").eq("status", "completed"),
  ]);
  const totalRaised = (completedSumRes.data ?? []).reduce((s, d) => s + Number(d.amount ?? 0), 0);

  // Charities list for the filter dropdown.
  const { data: charities } = await serviceClient
    .from("charities")
    .select("id, name")
    .order("name");

  return NextResponse.json({
    donations: rows,
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    charities: charities ?? [],
    stats: {
      total: countRes.count ?? 0,
      completed: completedRes.count ?? 0,
      refunded: refundedRes.count ?? 0,
      totalRaised,
    },
  });
}
