import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";
import { sendMerchantInviteSentEmail } from "@/services/emailService";
import * as Sentry from "@sentry/nextjs";

export async function PATCH(req: NextRequest) {
  // ── Auth gate ──────────────────────────────────────────────────────────────
  const gate = await requireAdmin("merchants", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  // ── Validate body ──────────────────────────────────────────────────────────
  const body = await req.json() as { ids?: unknown };
  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
  }
  const ids = (body.ids as unknown[]).filter((id): id is string => typeof id === "string");
  if (ids.length === 0) {
    return NextResponse.json({ error: "No valid IDs provided" }, { status: 400 });
  }

  // ── Update merchants (only those currently pending) ────────────────────────
  const { data: updated, error: updateError } = await serviceClient
    .from("merchants")
    .update({ status: "invited", invited_at: new Date().toISOString() })
    .in("id", ids)
    .eq("status", "pending")
    .select("id, name, owner_name, email");

  if (updateError) {
    console.error("[bulk-invite] update error", updateError);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // ── Fire Email #2 to each — fire-and-forget ────────────────────────────────
  for (const merchant of updated ?? []) {
    sendMerchantInviteSentEmail({
      to: merchant.email,
      restaurantName: merchant.name,
      ownerName: merchant.owner_name ?? undefined,
    }).catch((err) => {
      console.error(`[bulk-invite] email failed for ${merchant.email}`, err);
      Sentry.captureException(err);
    });
  }

  logAdminAction(gate, {
    action: "merchant.bulk_invite", module: "merchants", targetType: "merchant",
    summary: `Marked ${updated?.length ?? 0} merchant${(updated?.length ?? 0) !== 1 ? "s" : ""} as invited`,
    metadata: { count: updated?.length ?? 0, ids: (updated ?? []).map((m) => m.id) },
  });

  return NextResponse.json({ updated: updated?.length ?? 0 });
}
