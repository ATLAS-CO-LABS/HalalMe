import { NextRequest, NextResponse } from "next/server";
import { updateHyperzodMerchant } from "@/services/hyperzodService";
import { sendMerchantLiveEmail } from "@/services/emailService";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";

const CHECKLIST_KEYS = [
  "invite_accepted",
  "commission_agreed",
  "notes_completed",
  "onboarding_verified",
] as const;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ── Auth gate ──────────────────────────────────────────────────────────────
  const gate = await requireAdmin("merchants", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  // ── Load merchant ──────────────────────────────────────────────────────────
  const { data: merchant, error: fetchError } = await serviceClient
    .from("merchants")
    .select("id, name, owner_name, email, status, readiness_checklist, hyperzod_merchant_id, commission_percentage")
    .eq("id", id)
    .single();

  if (fetchError || !merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  if (merchant.status === "live") {
    return NextResponse.json({ error: "Merchant is already live" }, { status: 409 });
  }

  // ── Re-validate readiness checklist server-side ────────────────────────────
  const checklist = (merchant.readiness_checklist ?? {}) as Record<string, boolean>;
  const missing = CHECKLIST_KEYS.filter((k) => !checklist[k]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "checklist_incomplete", missing },
      { status: 422 }
    );
  }

  // ── Must have a Hyperzod ID to activate ────────────────────────────────────
  if (!merchant.hyperzod_merchant_id) {
    return NextResponse.json(
      { error: "no_hyperzod_id", message: "Merchant was never synced to Hyperzod — cannot activate." },
      { status: 422 }
    );
  }

  // ── Flip merchant live on Hyperzod (status 0 → 1) ──────────────────────────
  const result = await updateHyperzodMerchant(merchant.hyperzod_merchant_id, {
    status: 1,
    commission_percent: merchant.commission_percentage ?? undefined,
  });

  if (!result.ok) {
    // Fail safe: do NOT mark live, do NOT email. Flag for admin visibility.
    await serviceClient
      .from("merchants")
      .update({ hyperzod_sync_failed: true })
      .eq("id", id);

    return NextResponse.json(
      {
        error: "hyperzod_failed",
        message: "Could not activate the merchant on Hyperzod. They have NOT been published. Please try again or check Hyperzod.",
      },
      { status: 502 }
    );
  }

  // ── Mark live in Supabase ──────────────────────────────────────────────────
  const { data: updated, error: updateError } = await serviceClient
    .from("merchants")
    .update({
      status: "live",
      activated_at: new Date().toISOString(),
      hyperzod_sync_failed: false,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    console.error("[publish] supabase update failed after hyperzod success", updateError);
    return NextResponse.json(
      {
        error: "db_error",
        message: "Merchant was activated on Hyperzod but we failed to update our records. Please refresh.",
      },
      { status: 500 }
    );
  }

  await logAdminAction(gate, {
    action: "merchant.publish", module: "merchants", targetType: "merchant", targetId: id,
    summary: `Published ${merchant.name} live on Hyperzod`,
    metadata: { commission_percentage: merchant.commission_percentage },
  });

  // ── Email #4 — fire-and-forget ─────────────────────────────────────────────
  sendMerchantLiveEmail({
    to: merchant.email,
    restaurantName: merchant.name,
    ownerName: merchant.owner_name ?? undefined,
  }).catch((err) => console.error("[publish] live email failed", err));

  return NextResponse.json({ merchant: updated });
}
