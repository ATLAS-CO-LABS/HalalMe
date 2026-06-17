import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { updateHyperzodMerchant } from "@/services/hyperzodService";
import { isStaffRole } from "@/lib/adminRoles";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
  if (!isStaffRole(profile?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Load merchant ──────────────────────────────────────────────────────────
  const { data: merchant, error: fetchError } = await serviceClient
    .from("merchants")
    .select("id, status, hyperzod_merchant_id, commission_percentage")
    .eq("id", id)
    .single();

  if (fetchError || !merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  if (merchant.status !== "live") {
    return NextResponse.json({ error: "Merchant is not live" }, { status: 409 });
  }

  if (!merchant.hyperzod_merchant_id) {
    return NextResponse.json(
      { error: "no_hyperzod_id", message: "Merchant has no Hyperzod link — cannot deactivate." },
      { status: 422 }
    );
  }

  // ── Flip merchant inactive on Hyperzod (status 1 → 0) ──────────────────────
  const result = await updateHyperzodMerchant(merchant.hyperzod_merchant_id, {
    status: 0,
    commission_percent: merchant.commission_percentage ?? undefined,
  });

  if (!result.ok) {
    await serviceClient
      .from("merchants")
      .update({ hyperzod_sync_failed: true })
      .eq("id", id);

    return NextResponse.json(
      {
        error: "hyperzod_failed",
        message: "Could not deactivate the merchant on Hyperzod. They are still live. Please try again.",
      },
      { status: 502 }
    );
  }

  // ── Revert to "agreed" in Supabase (re-publishable; keeps activated_at history) ──
  const { data: updated, error: updateError } = await serviceClient
    .from("merchants")
    .update({ status: "agreed", hyperzod_sync_failed: false })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    console.error("[deactivate] supabase update failed after hyperzod success", updateError);
    return NextResponse.json(
      {
        error: "db_error",
        message: "Deactivated on Hyperzod but we failed to update our records. Please refresh.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ merchant: updated });
}
