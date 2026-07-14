import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { isStaffRole, isSuperAdmin } from "@/lib/adminRoles";
import { ilikeTerm } from "@/lib/adminSearch";

// GET /api/admin/search?q=term
// Global cross-module lookup for the command palette. Staff-gated; each block is
// only searched when the viewer has access to that module (no leaking results
// for pages they can't open). Returns a small, grouped result set.
export type SearchHit = { type: "user" | "merchant" | "ticket" | "charity"; id: string; label: string; sub: string | null; href: string };

export async function GET(req: NextRequest) {
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServiceClient();
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (!isStaffRole(profile?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const role = profile!.role as string;

  let perms: Record<string, string> = {};
  if (!isSuperAdmin(role)) {
    const { data: rows } = await db.from("admin_permissions").select("module, access").eq("user_id", user.id);
    perms = Object.fromEntries((rows ?? []).map((r) => [r.module, r.access]));
  }
  const can = (mod: string) => isSuperAdmin(role) || (!!perms[mod] && perms[mod] !== "none");

  const term = ilikeTerm(req.nextUrl.searchParams.get("q"));
  if (!term) return NextResponse.json({ results: [] });

  const results: SearchHit[] = [];

  // Run only the queries the viewer is allowed to see, in parallel.
  const tasks: Promise<void>[] = [];

  if (can("users")) {
    tasks.push((async () => {
      const { data } = await db
        .from("profiles")
        .select("id, full_name, username, email")
        .or(`full_name.ilike.${term},email.ilike.${term},username.ilike.${term}`)
        .limit(6);
      for (const u of data ?? []) {
        results.push({
          type: "user", id: u.id,
          label: u.full_name || (u.username ? `@${u.username}` : "User"),
          sub: u.email ?? null, href: `/admin/users/${u.id}`,
        });
      }
    })());
  }

  if (can("merchants")) {
    tasks.push((async () => {
      const { data } = await db
        .from("merchants")
        .select("id, name, email, city")
        .or(`name.ilike.${term},email.ilike.${term},city.ilike.${term}`)
        .limit(6);
      for (const m of data ?? []) {
        results.push({
          type: "merchant", id: m.id, label: m.name,
          sub: [m.city, m.email].filter(Boolean).join(" · ") || null,
          href: `/admin/merchants/${m.id}`,
        });
      }
    })());
  }

  if (can("support")) {
    tasks.push((async () => {
      const { data } = await db
        .from("support_conversations")
        .select("id, subject, requester_name, requester_email")
        .or(`subject.ilike.${term},requester_name.ilike.${term},requester_email.ilike.${term}`)
        .order("last_message_at", { ascending: false })
        .limit(6);
      for (const t of data ?? []) {
        results.push({
          type: "ticket", id: t.id, label: t.subject || "(no subject)",
          sub: t.requester_name || t.requester_email || null,
          href: `/admin/chat/${t.id}`,
        });
      }
    })());
  }

  if (can("rewards")) {
    tasks.push((async () => {
      const { data } = await db
        .from("charities")
        .select("id, name, category")
        .or(`name.ilike.${term},category.ilike.${term}`)
        .limit(6);
      for (const c of data ?? []) {
        results.push({
          type: "charity", id: c.id, label: c.name, sub: c.category ?? null,
          // Charities live in the (default) Charity Directory tab on the rewards page.
          href: `/admin/rewards`,
        });
      }
    })());
  }

  await Promise.all(tasks);

  return NextResponse.json({ results });
}
