import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

// GET /api/admin/analytics?section=merchants|users|rewards|kitchen|hub&range=30d|90d|all
// Read-only aggregate reporting, gated by analytics:view. Aggregates are computed
// in JS over the (small) datasets — move to SQL views if volumes grow.

type Gran = "day" | "week" | "month";
type Point = { label: string; value: number };

const DAY = 86_400_000;

// The reporting window. `since` null means all-time (open lower bound); `until`
// is the upper bound (now for presets, the chosen end date for a custom range).
type Win = { since: Date | null; until: Date; gran: Gran };

function granFor(range: string): Gran {
  return range === "30d" ? "day" : range === "90d" ? "week" : "month";
}
function sinceFor(range: string): Date | null {
  const now = Date.now();
  if (range === "30d") return new Date(now - 30 * DAY);
  if (range === "90d") return new Date(now - 90 * DAY);
  return null; // all-time
}
// Granularity for a custom span: daily up to ~6 weeks, weekly up to ~6 months,
// monthly beyond — keeps the series readable at any zoom.
function granForSpan(since: Date, until: Date): Gran {
  const days = (until.getTime() - since.getTime()) / DAY;
  return days <= 45 ? "day" : days <= 180 ? "week" : "month";
}
function startOfWeek(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (x.getUTCDay() + 6) % 7; // Monday = 0
  x.setUTCDate(x.getUTCDate() - dow);
  return x;
}
function keyOf(d: Date, g: Gran): string {
  if (g === "month") return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  if (g === "week") return startOfWeek(d).toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}
function labelOf(key: string, g: Gran): string {
  if (g === "month") {
    const [y, m] = key.split("-");
    return new Date(Date.UTC(+y, +m - 1, 1)).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
  }
  return new Date(key + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Bucket {date,value} items into an ordered, gap-filled series across the window.
function buildSeries(items: { date: string | null; value: number }[], win: Win): Point[] {
  const g = win.gran;
  const until = win.until;
  let since = win.since;
  const valid = items.filter((i) => i.date);
  if (!since) {
    const min = valid.reduce<number | null>((m, it) => {
      const t = new Date(it.date as string).getTime();
      return m === null || t < m ? t : m;
    }, null);
    since = min ? new Date(min) : new Date(until.getTime() - 365 * DAY);
  }

  const keys: string[] = [];
  if (g === "day") {
    for (const d = new Date(since); d <= until; d.setUTCDate(d.getUTCDate() + 1)) keys.push(keyOf(d, g));
  } else if (g === "week") {
    for (const d = startOfWeek(since); d <= until; d.setUTCDate(d.getUTCDate() + 7)) keys.push(keyOf(d, g));
  } else {
    for (const d = new Date(Date.UTC(since.getUTCFullYear(), since.getUTCMonth(), 1)); d <= until; d.setUTCMonth(d.getUTCMonth() + 1)) keys.push(keyOf(d, g));
  }

  const keySet = new Set(keys);
  const totals: Record<string, number> = {};
  for (const it of valid) {
    const k = keyOf(new Date(it.date as string), g);
    if (keySet.has(k)) totals[k] = (totals[k] ?? 0) + it.value;
  }
  return keys.map((k) => ({ label: labelOf(k, g), value: Math.round((totals[k] ?? 0) * 100) / 100 }));
}

function avgDays(rows: { a: string | null; b: string | null }[]): number | null {
  const deltas = rows
    .filter((r) => r.a && r.b)
    .map((r) => (new Date(r.b as string).getTime() - new Date(r.a as string).getTime()) / DAY)
    .filter((d) => d >= 0);
  if (deltas.length === 0) return null;
  return Math.round((deltas.reduce((s, x) => s + x, 0) / deltas.length) * 10) / 10;
}

export async function GET(req: NextRequest) {
  const gate = await requireAdmin("analytics", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient: db } = gate;

  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section") ?? "users";
  const range = searchParams.get("range") ?? "30d";
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  // Resolve the reporting window. Custom ranges carry explicit from/to dates;
  // presets (30d/90d/all) run up to "now".
  let since: Date | null;
  let until: Date;
  let gran: Gran;
  if (range === "custom" && fromParam && DATE_RE.test(fromParam)) {
    since = new Date(`${fromParam}T00:00:00.000Z`);
    until = toParam && DATE_RE.test(toParam) ? new Date(`${toParam}T23:59:59.999Z`) : new Date();
    gran = granForSpan(since, until);
  } else {
    since = sinceFor(range);
    until = new Date();
    gran = granFor(range);
  }
  const win: Win = { since, until, gran };
  const sinceISO = since?.toISOString();
  const untilISO = until.toISOString();

  // Equal-length window immediately before `since` (for vs-previous deltas).
  const prevSince = since ? new Date(since.getTime() - (until.getTime() - since.getTime())) : null;
  const inRange = (iso: string | null) =>
    !!iso && (!since || new Date(iso) >= since) && new Date(iso) <= until;
  const inPrev = (iso: string | null) =>
    !!iso && !!prevSince && !!since && new Date(iso) >= prevSince && new Date(iso) < since;

  try {
    switch (section) {
      // ── Merchant pipeline ───────────────────────────────────────────────
      case "merchants": {
        const { data } = await db
          .from("merchants")
          .select("status, created_at, invited_at, contacted_at, activated_at");
        const rows = data ?? [];
        const total = rows.length;
        const invited = rows.filter((r) => r.invited_at).length;
        const contacted = rows.filter((r) => r.contacted_at).length;
        const live = rows.filter((r) => r.activated_at).length;

        const STAGES = ["pending", "invited", "contacted", "negotiating", "agreed", "live", "rejected"];
        const byStatus = STAGES.map((s) => ({ label: s, value: rows.filter((r) => r.status === s).length }))
          .filter((s) => s.value > 0);

        return NextResponse.json({
          funnel: [
            { label: "All merchants", value: total },
            { label: "Invited", value: invited },
            { label: "Contacted", value: contacted },
            { label: "Live", value: live },
          ],
          byStatus,
          avgDays: {
            toInvited: avgDays(rows.map((r) => ({ a: r.created_at, b: r.invited_at }))),
            toContacted: avgDays(rows.map((r) => ({ a: r.invited_at, b: r.contacted_at }))),
            toLive: avgDays(rows.map((r) => ({ a: r.contacted_at, b: r.activated_at }))),
          },
          addedOverTime: buildSeries(rows.map((r) => ({ date: r.created_at, value: 1 })), win),
          stats: { total, live, liveRate: total ? Math.round((live / total) * 100) : 0 },
        });
      }

      // ── User growth ─────────────────────────────────────────────────────
      case "users": {
        const { data } = await db.from("profiles").select("created_at, role, is_verified");
        const rows = data ?? [];
        const total = rows.length;
        const verified = rows.filter((r) => r.is_verified).length;
        const newInRange = since ? rows.filter((r) => inRange(r.created_at)).length : total;
        const newInPrev = rows.filter((r) => inPrev(r.created_at)).length;

        const roles = ["user", "admin", "super_admin"];
        const roleBreakdown = roles
          .map((r) => ({ label: r, value: rows.filter((x) => x.role === r).length }))
          .filter((r) => r.value > 0);

        return NextResponse.json({
          signups: buildSeries(rows.map((r) => ({ date: r.created_at, value: 1 })), win),
          roleBreakdown,
          verification: [
            { label: "Verified", value: verified },
            { label: "Unverified", value: total - verified },
          ],
          stats: { total, newInRange, newInPrev, verifiedPct: total ? Math.round((verified / total) * 100) : 0 },
        });
      }

      // ── Rewards / donations ─────────────────────────────────────────────
      case "rewards": {
        let dq = db.from("donations").select("amount, charity_id, created_at, status").eq("status", "completed");
        // Fetch back to the previous window (when bounded) so we can compute deltas;
        // buildSeries below still only renders the current range's buckets.
        const fetchFromISO = prevSince?.toISOString() ?? sinceISO;
        if (fetchFromISO) dq = dq.gte("created_at", fetchFromISO);
        dq = dq.lte("created_at", untilISO);
        const [{ data: don }, { data: charities }, { data: rt }] = await Promise.all([
          dq,
          db.from("charities").select("name, raised_amount").order("raised_amount", { ascending: false }).limit(6),
          db.from("reward_transactions").select("points"),
        ]);
        const allDon = don ?? [];
        // Current window = on/after `since` (all rows when all-time).
        const donations = since ? allDon.filter((d) => inRange(d.created_at)) : allDon;
        const totalRaised = donations.reduce((s, d) => s + Number(d.amount ?? 0), 0);
        const prevDon = allDon.filter((d) => inPrev(d.created_at));
        const totalRaisedPrev = prevDon.reduce((s, d) => s + Number(d.amount ?? 0), 0);
        const avg = donations.length ? totalRaised / donations.length : 0;
        const earned = (rt ?? []).filter((r) => (r.points ?? 0) > 0).reduce((s, r) => s + (r.points ?? 0), 0);
        const redeemed = (rt ?? []).filter((r) => (r.points ?? 0) < 0).reduce((s, r) => s + Math.abs(r.points ?? 0), 0);

        return NextResponse.json({
          raisedOverTime: buildSeries(donations.map((d) => ({ date: d.created_at, value: Number(d.amount ?? 0) })), win),
          topCharities: (charities ?? []).map((c) => ({ label: c.name, value: Math.round(Number(c.raised_amount ?? 0)) })),
          points: [
            { label: "Earned", value: earned },
            { label: "Redeemed", value: redeemed },
          ],
          stats: {
            totalRaised: Math.round(totalRaised),
            totalRaisedPrev: Math.round(totalRaisedPrev),
            donationCount: donations.length,
            donationCountPrev: prevDon.length,
            avgDonation: Math.round(avg),
          },
        });
      }

      // ── Kitchen ─────────────────────────────────────────────────────────
      case "kitchen": {
        const { data: recipes } = await db
          .from("recipes")
          .select("title, created_at, is_ai_generated, is_published, avg_rating, review_count, view_count");
        const rows = recipes ?? [];
        const published = rows.filter((r) => r.is_published);
        const ai = rows.filter((r) => r.is_ai_generated).length;
        const rated = rows.filter((r) => (r.review_count ?? 0) > 0);
        const avgRating = rated.length
          ? Math.round((rated.reduce((s, r) => s + Number(r.avg_rating ?? 0), 0) / rated.length) * 10) / 10
          : 0;

        let sq = db.from("ai_chat_sessions").select("id, recipe_id", { count: "exact", head: false });
        if (sinceISO) sq = sq.gte("created_at", sinceISO);
        sq = sq.lte("created_at", untilISO);
        // Previous-window session count (head-only) for the delta.
        const prevSessionsPromise = prevSince
          ? db.from("ai_chat_sessions").select("id", { count: "exact", head: true })
              .gte("created_at", prevSince.toISOString()).lt("created_at", sinceISO!)
          : Promise.resolve({ count: 0 } as { count: number | null });
        const [{ data: sessions, count: sessionCount }, { count: prevSessionCount }] = await Promise.all([sq, prevSessionsPromise]);
        const converted = (sessions ?? []).filter((s) => s.recipe_id).length;

        return NextResponse.json({
          publishedOverTime: buildSeries(published.map((r) => ({ date: r.created_at, value: 1 })), win),
          source: [
            { label: "AI-generated", value: ai },
            { label: "User-submitted", value: rows.length - ai },
          ],
          mostViewed: [...rows]
            .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
            .slice(0, 6)
            .map((r) => ({ label: r.title, value: r.view_count ?? 0 })),
          stats: {
            total: rows.length,
            published: published.length,
            avgRating,
            aiSessions: sessionCount ?? 0,
            aiSessionsPrev: prevSessionCount ?? 0,
            sessionConversion: (sessionCount ?? 0) ? Math.round((converted / (sessionCount ?? 1)) * 100) : 0,
          },
        });
      }

      // ── Hub ─────────────────────────────────────────────────────────────
      case "hub": {
        const { data: posts } = await db.from("posts").select("created_at, like_count, comment_count");
        const rows = posts ?? [];
        const totalLikes = rows.reduce((s, p) => s + (p.like_count ?? 0), 0);
        const totalComments = rows.reduce((s, p) => s + (p.comment_count ?? 0), 0);

        const { data: follows } = await db.from("follows").select("following_id");
        const counts: Record<string, number> = {};
        for (const f of follows ?? []) counts[f.following_id] = (counts[f.following_id] ?? 0) + 1;
        const topIds = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
        let mostFollowed: { label: string; value: number }[] = [];
        if (topIds.length > 0) {
          const { data: profs } = await db
            .from("profiles")
            .select("id, full_name, username")
            .in("id", topIds.map(([id]) => id));
          const nameById = new Map((profs ?? []).map((p) => [p.id, p.full_name ?? (p.username ? `@${p.username}` : "User")]));
          mostFollowed = topIds.map(([id, value]) => ({ label: nameById.get(id) ?? "User", value }));
        }

        return NextResponse.json({
          postsOverTime: buildSeries(rows.map((p) => ({ date: p.created_at, value: 1 })), win),
          mostFollowed,
          stats: {
            total: rows.length,
            avgLikes: rows.length ? Math.round((totalLikes / rows.length) * 10) / 10 : 0,
            avgComments: rows.length ? Math.round((totalComments / rows.length) * 10) / 10 : 0,
          },
        });
      }

      default:
        return NextResponse.json({ error: "Unknown section" }, { status: 400 });
    }
  } catch (err) {
    console.error("[api/admin/analytics] error", err);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
