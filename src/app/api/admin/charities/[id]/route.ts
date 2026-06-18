import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

// Editable scalar fields (directory edit form).
const NUMERIC_FIELDS = ["goal_amount", "minimum_donation", "platform_fee_pct"] as const;
const TEXT_FIELDS = ["description", "long_description", "image_url"] as const;
const BOOL_FIELDS = ["is_featured", "is_zakat_eligible"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/charities/[id] — full charity detail (for the edit drawer).
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("rewards", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { data: charity, error } = await gate.serviceClient
    .from("charities")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !charity) {
    return NextResponse.json({ error: "Charity not found" }, { status: 404 });
  }

  return NextResponse.json({ charity });
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/charities/[id]
//   - edit fields: goal_amount, minimum_donation, platform_fee_pct,
//     description, long_description, image_url, is_featured, is_zakat_eligible
//   - { action: "suspend" } / { action: "reinstate" } — toggles status + writes
//     a charity_verification_log entry.
// Manage-only.
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("rewards", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  let body: Record<string, unknown> & { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { data: charity, error: loadErr } = await serviceClient
    .from("charities")
    .select("id, verification_status, is_active, verification_level, verification_score")
    .eq("id", id)
    .single();

  if (loadErr || !charity) {
    return NextResponse.json({ error: "Charity not found" }, { status: 404 });
  }

  // ── Suspend / reinstate ──────────────────────────────────────────────────────
  if (body.action === "suspend" || body.action === "reinstate") {
    const suspending = body.action === "suspend";
    const update = suspending
      ? { verification_status: "suspended", is_active: false }
      : { verification_status: "approved", is_active: true };

    const { error } = await serviceClient.from("charities").update(update).eq("id", id);
    if (error) {
      console.error("[charities PATCH] suspend/reinstate error", error);
      return NextResponse.json({ error: "Failed to update charity status" }, { status: 500 });
    }

    await serviceClient.from("charity_verification_log").insert({
      charity_id: id,
      changed_by: gate.userId,
      change_type: suspending ? "suspended" : "reinstated",
      previous_status: charity.verification_status,
      new_status: update.verification_status,
      previous_level: charity.verification_level,
      new_level: charity.verification_level,
      notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
    });

    return NextResponse.json({ ok: true, verification_status: update.verification_status });
  }

  // ── Field edits ──────────────────────────────────────────────────────────────
  const update: Record<string, unknown> = {};

  for (const f of NUMERIC_FIELDS) {
    if (f in body) {
      const n = Number(body[f]);
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ error: `Invalid value for ${f}` }, { status: 400 });
      }
      if (f === "goal_amount" && n <= 0) {
        return NextResponse.json({ error: "Goal amount must be greater than 0" }, { status: 400 });
      }
      update[f] = n;
    }
  }
  for (const f of TEXT_FIELDS) {
    if (f in body) {
      const raw = body[f];
      update[f] = typeof raw === "string" ? raw.trim() || null : null;
    }
  }
  for (const f of BOOL_FIELDS) {
    if (f in body && typeof body[f] === "boolean") update[f] = body[f];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await serviceClient.from("charities").update(update).eq("id", id);
  if (error) {
    console.error("[charities PATCH] update error", error);
    return NextResponse.json({ error: "Failed to update charity" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
