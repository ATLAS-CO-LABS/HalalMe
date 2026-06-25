import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/donation-flags/[id]
//   { action: "safe",    notes?: string }  → release withheld rewards
//   { action: "blocked", notes?: string }  → initiate Stripe refund, no rewards
// Manage-only. Both write reviewed_by / reviewed_at / reviewer_notes.
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("rewards", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  let body: { action?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action;
  if (action !== "safe" && action !== "blocked") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { data: flag, error: flagErr } = await serviceClient
    .from("donation_flags")
    .select("id, donation_id, status")
    .eq("id", id)
    .single();

  if (flagErr || !flag) {
    return NextResponse.json({ error: "Flag not found" }, { status: 404 });
  }
  if (flag.status !== "pending_review") {
    return NextResponse.json({ error: "This flag has already been reviewed" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const notes = body.notes?.trim() || null;

  // ── Reviewed safe → release the withheld rewards ─────────────────────────────
  if (action === "safe") {
    // The DB function awards the points the fraud gate skipped (idempotent).
    const { data: result, error: rpcErr } = await serviceClient.rpc("release_flagged_rewards", {
      p_donation_id: flag.donation_id,
    });
    if (rpcErr) {
      console.error("[donation-flags PATCH] release_flagged_rewards error", rpcErr);
      return NextResponse.json({ error: "Failed to release rewards" }, { status: 500 });
    }

    const { error: updErr } = await serviceClient
      .from("donation_flags")
      .update({
        status: "reviewed_safe",
        reviewed_by: gate.userId,
        reviewed_at: now,
        reviewer_notes: notes,
        rewards_delayed: false,
        rewards_released_at: now,
      })
      .eq("id", id);
    if (updErr) {
      console.error("[donation-flags PATCH] update (safe) error", updErr);
      return NextResponse.json({ error: "Rewards released but failed to update flag" }, { status: 500 });
    }

    await logAdminAction(gate, {
      action: "donation_flag.cleared", module: "rewards", targetType: "donation_flag", targetId: id,
      summary: "Cleared donation flag as safe — rewards released",
      metadata: { donation_id: flag.donation_id, notes },
    });

    return NextResponse.json({ ok: true, status: "reviewed_safe", reward: result });
  }

  // ── Reviewed blocked → Stripe refund, no rewards ─────────────────────────────
  const { data: donation } = await serviceClient
    .from("donations")
    .select("id, status, payment_intent_id, payment_provider")
    .eq("id", flag.donation_id)
    .single();

  let refundRef: string | null = null;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (
    donation?.payment_provider === "stripe" &&
    donation.payment_intent_id &&
    donation.status === "completed" &&
    stripeSecretKey
  ) {
    try {
      const Stripe = (await import("stripe")).default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-03-25.dahlia" as any });
      const refund = await stripe.refunds.create({
        payment_intent: donation.payment_intent_id,
        reason: "fraudulent",
      });
      refundRef = refund.id;
    } catch (e) {
      console.error("[donation-flags PATCH] Stripe refund error", e);
      return NextResponse.json({ error: "Stripe refund failed — flag not updated" }, { status: 502 });
    }
  }

  // Mark the donation refunded (webhook will also reconcile, idempotently).
  if (donation && donation.status !== "refunded") {
    await serviceClient
      .from("donations")
      .update({ status: "refunded", refunded_at: now, refund_ref: refundRef })
      .eq("id", donation.id);
  }

  const { error: updErr } = await serviceClient
    .from("donation_flags")
    .update({
      status: "reviewed_blocked",
      reviewed_by: gate.userId,
      reviewed_at: now,
      reviewer_notes: notes,
      rewards_delayed: true,
    })
    .eq("id", id);
  if (updErr) {
    console.error("[donation-flags PATCH] update (blocked) error", updErr);
    return NextResponse.json({ error: "Refund issued but failed to update flag" }, { status: 500 });
  }

  await logAdminAction(gate, {
    action: "donation_flag.blocked", module: "rewards", targetType: "donation_flag", targetId: id,
    summary: `Blocked donation flag${refundRef ? " — Stripe refund issued" : ""}`,
    metadata: { donation_id: flag.donation_id, refund_ref: refundRef, notes },
  });

  return NextResponse.json({ ok: true, status: "reviewed_blocked", refund_ref: refundRef });
}
