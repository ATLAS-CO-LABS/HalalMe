import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { isStaffRole, isSuperAdmin } from "@/lib/adminRoles";
import { getFollowUp } from "@/lib/followUps";

// GET /api/admin/overview
// Landing dashboard payload: cross-module KPIs + a unified "needs attention"
// feed + recent activity. Visible to any staff role, but each block is computed
// only when the viewer has at least `view` on the owning module (no leaking
// counts for pages they can't open).
const DAY = 86_400_000;

export async function GET() {
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServiceClient();
  const { data: profile } = await db.from("profiles").select("role, full_name").eq("id", user.id).single();
  if (!isStaffRole(profile?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const role = profile!.role as string;

  // Build a per-module access checker.
  let perms: Record<string, string> = {};
  if (!isSuperAdmin(role)) {
    const { data: rows } = await db.from("admin_permissions").select("module, access").eq("user_id", user.id);
    perms = Object.fromEntries((rows ?? []).map((r) => [r.module, r.access]));
  }
  const can = (mod: string) => isSuperAdmin(role) || (perms[mod] && perms[mod] !== "none");

  const weekAgo = new Date(Date.now() - 7 * DAY).toISOString();

  const stats: Record<string, unknown> = {};
  const needsAttention: { id: string; label: string; detail: string; href: string; severity: "warn" | "urgent" }[] = [];
  const recent: { type: string; label: string; detail: string; at: string }[] = [];

  // ── Users ──────────────────────────────────────────────────────────────
  if (can("users")) {
    const [{ count: total }, { count: newThisWeek }, { data: signups }] = await Promise.all([
      db.from("profiles").select("id", { count: "exact", head: true }),
      db.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
      db.from("profiles").select("full_name, username, created_at").order("created_at", { ascending: false }).limit(5),
    ]);
    stats.users = { total: total ?? 0, newThisWeek: newThisWeek ?? 0 };
    for (const u of signups ?? []) {
      recent.push({ type: "user", label: u.full_name ?? (u.username ? `@${u.username}` : "New user"), detail: "signed up", at: u.created_at });
    }
  }

  // ── Merchants ──────────────────────────────────────────────────────────
  if (can("merchants")) {
    const { data: merchants } = await db
      .from("merchants")
      .select("id, name, status, created_at, invited_at, contacted_at, next_followup_on, updated_at");
    const rows = merchants ?? [];
    let attn = 0;
    for (const m of rows) {
      const fu = getFollowUp({
        status: m.status,
        created_at: m.created_at,
        invited_at: m.invited_at,
        contacted_at: m.contacted_at,
        next_followup_on: m.next_followup_on,
      });
      if (fu) {
        attn++;
        if (needsAttention.filter((n) => n.id.startsWith("merchant-")).length < 6) {
          needsAttention.push({
            id: `merchant-${m.id}`,
            label: m.name,
            detail: `${fu.label} · ${fu.days}d`,
            href: "/admin/merchants",
            severity: fu.severity,
          });
        }
      }
    }
    stats.merchants = { total: rows.length, needsAttention: attn };
    for (const m of [...rows].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5)) {
      recent.push({ type: "merchant", label: m.name, detail: `status: ${m.status}`, at: m.updated_at });
    }
  }

  // ── Kitchen ────────────────────────────────────────────────────────────
  if (can("kitchen")) {
    const [{ count: total }, { count: pendingHalal }, { data: newRecipes }] = await Promise.all([
      db.from("recipes").select("id", { count: "exact", head: true }).is("deleted_at", null),
      db.from("recipes").select("id", { count: "exact", head: true }).eq("is_halal_verified", false).is("deleted_at", null),
      db.from("recipes").select("title, created_at").is("deleted_at", null).order("created_at", { ascending: false }).limit(5),
    ]);
    stats.kitchen = { total: total ?? 0, pendingHalal: pendingHalal ?? 0 };
    for (const r of newRecipes ?? []) {
      recent.push({ type: "recipe", label: r.title, detail: "new recipe", at: r.created_at });
    }
  }

  // ── Hub (recent posts for the activity feed) ─────────────────────────────
  if (can("hub")) {
    const { data: newPosts } = await db
      .from("posts")
      .select("content, post_type, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5);
    for (const p of newPosts ?? []) {
      const text = (p.content ?? "").trim();
      recent.push({
        type: "post",
        label: text ? (text.length > 40 ? `${text.slice(0, 40)}…` : text) : `New ${p.post_type ?? "post"}`,
        detail: "posted to Hub",
        at: p.created_at,
      });
    }
  }

  // ── Rewards / charity / fraud (all under the rewards module) ────────────
  if (can("rewards")) {
    const [{ data: charities }, { count: pendingApps }, { count: underReview }, { count: fraud }, { data: donations }] = await Promise.all([
      db.from("charities").select("raised_amount"),
      db.from("charity_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      db.from("charity_applications").select("id", { count: "exact", head: true }).eq("status", "under_review"),
      db.from("donation_flags").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
      db.from("donations").select("amount, created_at, status").eq("status", "completed").order("created_at", { ascending: false }).limit(5),
    ]);
    const totalRaised = (charities ?? []).reduce((s, c) => s + Number(c.raised_amount ?? 0), 0);
    const apps = (pendingApps ?? 0) + (underReview ?? 0);
    stats.rewards = { totalRaised: Math.round(totalRaised), pendingApplications: apps };
    stats.fraud = { pending: fraud ?? 0 };

    if (apps > 0) needsAttention.push({ id: "charity-apps", label: `${apps} charity application${apps !== 1 ? "s" : ""}`, detail: "awaiting review", href: "/admin/rewards", severity: "warn" });
    if ((fraud ?? 0) > 0) needsAttention.push({ id: "fraud", label: `${fraud} fraud flag${fraud !== 1 ? "s" : ""}`, detail: "pending review", href: "/admin/rewards", severity: "urgent" });
    for (const d of donations ?? []) {
      recent.push({ type: "donation", label: `£${Math.round(Number(d.amount ?? 0))} donation`, detail: "completed", at: d.created_at });
    }
  }

  // ── Support ────────────────────────────────────────────────────────────
  if (can("support")) {
    const [{ count: open }, { count: unassigned }] = await Promise.all([
      db.from("support_conversations").select("id", { count: "exact", head: true }).in("status", ["open", "pending"]),
      db.from("support_conversations").select("id", { count: "exact", head: true }).is("assigned_to", null).in("status", ["open", "pending"]),
    ]);
    stats.support = { open: open ?? 0 };
    if ((unassigned ?? 0) > 0) needsAttention.push({ id: "support-unassigned", label: `${unassigned} unassigned ticket${unassigned !== 1 ? "s" : ""}`, detail: "no owner yet", href: "/admin/chat", severity: "warn" });
  }

  // Sort the merged activity feed newest-first.
  recent.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  // Order needs-attention: urgent first.
  needsAttention.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "urgent" ? -1 : 1));

  return NextResponse.json({
    name: profile?.full_name ?? null,
    stats,
    needsAttention,
    recent: recent.slice(0, 10),
  });
}
