import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

// GET /api/admin/kitchen/ai-usage
// Read-only AI usage stats from ai_chat_sessions (recipe-chat volume +
// session→recipe conversion) and ai_request_counts (request volume for
// spotting abuse / tuning rate limits). No actions in Phase 1.
export async function GET() {
  const gate = await requireAdmin("kitchen", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [totalSessions, convertedSessions, sessionsThisWeek, requestRows] = await Promise.all([
    serviceClient.from("ai_chat_sessions").select("id", { count: "exact", head: true }),
    // Sessions that produced a recipe (recipe_id set) = "converted".
    serviceClient.from("ai_chat_sessions").select("id", { count: "exact", head: true }).not("recipe_id", "is", null),
    serviceClient.from("ai_chat_sessions").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    serviceClient.from("ai_request_counts").select("user_id, request_count, window_start"),
  ]);

  const rows = requestRows.data ?? [];
  const totalRequests = rows.reduce((s, r) => s + (r.request_count ?? 0), 0);
  const uniqueUsers = new Set(rows.map((r) => r.user_id)).size;
  const requestsThisWeek = rows
    .filter((r) => r.window_start && r.window_start >= weekAgo)
    .reduce((s, r) => s + (r.request_count ?? 0), 0);

  const total = totalSessions.count ?? 0;
  const converted = convertedSessions.count ?? 0;
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

  // Heaviest users this week (top 5) — useful for spotting abuse.
  const byUser = new Map<string, number>();
  for (const r of rows) {
    if (!r.window_start || r.window_start < weekAgo) continue;
    byUser.set(r.user_id, (byUser.get(r.user_id) ?? 0) + (r.request_count ?? 0));
  }
  const topUserEntries = [...byUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  let topUsers: { id: string; name: string; requests: number }[] = [];
  if (topUserEntries.length > 0) {
    const { data: profiles } = await serviceClient
      .from("profiles")
      .select("id, full_name, username")
      .in("id", topUserEntries.map(([uid]) => uid));
    const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name || p.username || "Unknown"]));
    topUsers = topUserEntries.map(([id, requests]) => ({ id, name: nameById.get(id) ?? "Unknown", requests }));
  }

  return NextResponse.json({
    sessions: { total, converted, conversionRate, thisWeek: sessionsThisWeek.count ?? 0 },
    requests: { total: totalRequests, thisWeek: requestsThisWeek, uniqueUsers },
    topUsers,
  });
}
