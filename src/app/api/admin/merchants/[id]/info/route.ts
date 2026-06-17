import { NextRequest, NextResponse } from "next/server";
import { updateHyperzodMerchant, type HyperzodMerchantOverrides } from "@/services/hyperzodService";
import { requireAdmin } from "@/lib/adminAuth";

// Fields shared with Hyperzod (a change here must sync)
const SHARED_FIELDS = [
  "name", "email", "phone", "address", "city", "state",
  "post_code", "country", "country_code", "owner_name",
] as const;

// HalalMe-only fields (never sent to Hyperzod)
const LOCAL_ONLY_FIELDS = ["website", "source_attribution"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ── Auth gate ──────────────────────────────────────────────────────────────
  const gate = await requireAdmin("merchants", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const body = await req.json() as Record<string, unknown>;

  // ── Light validation of required core fields ───────────────────────────────
  for (const key of ["name", "email", "phone"] as const) {
    if (key in body && (typeof body[key] !== "string" || !(body[key] as string).trim())) {
      return NextResponse.json({ error: `${key} cannot be empty` }, { status: 400 });
    }
  }

  // ── Load current record (HZ id + current values for change detection) ──────
  const { data: current, error: loadError } = await serviceClient
    .from("merchants")
    .select("*")
    .eq("id", id)
    .single();
  if (loadError || !current) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  // ── Collect provided fields ────────────────────────────────────────────────
  const updates: Record<string, unknown> = {};
  for (const key of [...SHARED_FIELDS, ...LOCAL_ONLY_FIELDS]) {
    if (key in body) updates[key] = body[key] === "" ? null : body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  // ── Sync Hyperzod first if any shared field changed ────────────────────────
  let hyperzodWarning: string | null = null;
  const sharedChanged = SHARED_FIELDS.filter(
    (k) => k in updates && updates[k] !== current[k]
  );

  if (sharedChanged.length > 0 && current.hyperzod_merchant_id) {
    const overrides: HyperzodMerchantOverrides = {
      // Preserve the agreed commission so the sync doesn't reset it to 0
      commission_percent: current.commission_percentage ?? undefined,
    };
    for (const k of sharedChanged) {
      // Hyperzod needs a value, never null — fall back to empty string
      (overrides as Record<string, unknown>)[k] = updates[k] ?? "";
    }

    const result = await updateHyperzodMerchant(current.hyperzod_merchant_id, overrides);
    if (result.ok) {
      updates.hyperzod_sync_failed = false;
    } else {
      updates.hyperzod_sync_failed = true;
      hyperzodWarning =
        "Saved on HalalMe, but the changes could not be synced to Hyperzod. The merchant is flagged as out of sync.";
    }
  }

  // ── Persist to Supabase ────────────────────────────────────────────────────
  const { data: updated, error: updateError } = await serviceClient
    .from("merchants")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    console.error("[merchants/info] update error", updateError);
    return NextResponse.json({ error: "Failed to save changes" }, { status: 500 });
  }

  return NextResponse.json({ merchant: updated, warning: hyperzodWarning });
}
