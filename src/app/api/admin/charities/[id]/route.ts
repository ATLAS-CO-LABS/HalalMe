import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";

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

    logAdminAction(gate, {
      action: suspending ? "charity.suspend" : "charity.reinstate", module: "rewards", targetType: "charity", targetId: id,
      summary: suspending ? "Suspended charity" : "Reinstated charity",
      metadata: { from: charity.verification_status, to: update.verification_status },
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

  // Identity / contact fields (also feed Stripe Connect onboarding).
  for (const f of ["legal_name", "registration_number", "website_url"] as const) {
    if (f in body) {
      const raw = body[f];
      update[f] = typeof raw === "string" ? raw.trim() || null : null;
    }
  }
  if ("contact_email" in body) {
    const email = String(body.contact_email ?? "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid contact email" }, { status: 400 });
    }
    update.contact_email = email || null;
  }
  if ("country" in body) {
    const c = String(body.country ?? "").trim().toUpperCase();
    if (!c) return NextResponse.json({ error: "Country cannot be empty" }, { status: 400 });
    update.country = c;
  }
  if ("charity_type" in body) {
    const t = body.charity_type;
    const allowed = ["ngo", "foundation", "mosque", "humanitarian", "other"];
    if (t !== null && !(typeof t === "string" && allowed.includes(t))) {
      return NextResponse.json({ error: "Invalid charity type" }, { status: 400 });
    }
    update.charity_type = (typeof t === "string" && t) || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await serviceClient.from("charities").update(update).eq("id", id);
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A charity with this registration number already exists for this country" },
        { status: 409 },
      );
    }
    console.error("[charities PATCH] update error", error);
    return NextResponse.json({ error: "Failed to update charity" }, { status: 500 });
  }

  logAdminAction(gate, {
    action: "charity.update", module: "rewards", targetType: "charity", targetId: id,
    summary: `Updated charity fields: ${Object.keys(update).join(", ")}`,
    metadata: update,
  });

  return NextResponse.json({ ok: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/charities/[id] — manage-only. Blocked at the database level
// (donations.charity_id is ON DELETE RESTRICT) if the charity has any donation
// history — suspend it instead to preserve that record.
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("rewards", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { data: charity, error: loadErr } = await serviceClient
    .from("charities")
    .select("id, name")
    .eq("id", id)
    .single();

  if (loadErr || !charity) {
    return NextResponse.json({ error: "Charity not found" }, { status: 404 });
  }

  const { error } = await serviceClient.from("charities").delete().eq("id", id);
  if (error) {
    // 23503 = foreign_key_violation — donations (or applications) still reference this charity.
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "This charity has existing donations or applications and can't be deleted. Suspend it instead to keep that history." },
        { status: 409 },
      );
    }
    console.error("[charities DELETE] delete error", error);
    return NextResponse.json({ error: "Failed to delete charity" }, { status: 500 });
  }

  logAdminAction(gate, {
    action: "charity.delete", module: "rewards", targetType: "charity", targetId: id,
    summary: `Deleted charity ${charity.name}`,
  });

  return NextResponse.json({ ok: true });
}
