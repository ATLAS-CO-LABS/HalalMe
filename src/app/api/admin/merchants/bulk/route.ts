import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";

export async function PATCH(req: NextRequest) {
  // ── Auth gate ──────────────────────────────────────────────────────────────
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Validate body ──────────────────────────────────────────────────────────
  const body = await req.json() as { action?: string; ids?: unknown; rep?: unknown };
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((x): x is string => typeof x === "string")
    : [];
  if (ids.length === 0) {
    return NextResponse.json({ error: "No merchants selected" }, { status: 400 });
  }

  // ── Reject (skips live/rejected — those must be handled individually) ──────
  if (body.action === "reject") {
    const { data, error } = await serviceClient
      .from("merchants")
      .update({ status: "rejected" })
      .in("id", ids)
      .not("status", "in", "(live,rejected)")
      .select("id");

    if (error) {
      console.error("[bulk] reject error", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    return NextResponse.json({ updated: data?.length ?? 0 });
  }

  // ── Assign rep ─────────────────────────────────────────────────────────────
  if (body.action === "assign") {
    const rep = typeof body.rep === "string" && body.rep.trim() ? body.rep.trim() : null;
    const { data, error } = await serviceClient
      .from("merchants")
      .update({ assigned_rep: rep })
      .in("id", ids)
      .select("id");

    if (error) {
      console.error("[bulk] assign error", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    return NextResponse.json({ updated: data?.length ?? 0 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
