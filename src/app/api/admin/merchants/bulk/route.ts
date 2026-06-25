import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";

export async function PATCH(req: NextRequest) {
  // ── Auth gate ──────────────────────────────────────────────────────────────
  const gate = await requireAdmin("merchants", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  // ── Validate body ──────────────────────────────────────────────────────────
  const body = await req.json() as { action?: string; ids?: unknown; rep?: unknown; repId?: unknown };
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
    await logAdminAction(gate, {
      action: "merchant.bulk_reject", module: "merchants", targetType: "merchant",
      summary: `Bulk rejected ${data?.length ?? 0} merchant${(data?.length ?? 0) !== 1 ? "s" : ""}`,
      metadata: { count: data?.length ?? 0, ids: data?.map((d) => d.id) ?? [] },
    });
    return NextResponse.json({ updated: data?.length ?? 0 });
  }

  // ── Assign rep (links to a real team member via assigned_rep_id) ───────────
  if (body.action === "assign") {
    const repId = typeof body.repId === "string" && body.repId.trim() ? body.repId.trim() : null;

    // Resolve the team member's name so the legacy text column stays a useful
    // display fallback and clears to "Unassigned" when repId is null.
    let repName: string | null = null;
    if (repId) {
      const { data: rep } = await serviceClient
        .from("profiles")
        .select("full_name")
        .eq("id", repId)
        .maybeSingle();
      repName = rep?.full_name ?? null;
    }

    const { data, error } = await serviceClient
      .from("merchants")
      .update({ assigned_rep_id: repId, assigned_rep: repName })
      .in("id", ids)
      .select("id");

    if (error) {
      console.error("[bulk] assign error", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    await logAdminAction(gate, {
      action: "merchant.bulk_assign", module: "merchants", targetType: "merchant",
      summary: `Bulk assigned ${data?.length ?? 0} merchant${(data?.length ?? 0) !== 1 ? "s" : ""} to ${repName ?? "Unassigned"}`,
      metadata: { count: data?.length ?? 0, repId, repName },
    });
    return NextResponse.json({ updated: data?.length ?? 0 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
