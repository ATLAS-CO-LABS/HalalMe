import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";

// Fields an admin may edit inline on a reward rule.
const NUMERIC_FIELDS = ["points_per_unit", "max_per_day", "max_lifetime"] as const;

// GET /api/admin/reward-rules — full list of reward rules (no pagination; small set).
export async function GET() {
  const gate = await requireAdmin("rewards", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { data, error } = await gate.serviceClient
    .from("reward_rules")
    .select("id, action, label, points_per_unit, unit, max_per_day, max_lifetime, is_active, valid_from, valid_until, updated_at")
    .order("action");

  if (error) {
    console.error("[api/admin/reward-rules] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch reward rules" }, { status: 500 });
  }

  let canManage = gate.role === "super_admin";
  if (!canManage) {
    const { data: vp } = await gate.serviceClient
      .from("admin_permissions").select("access")
      .eq("user_id", gate.userId).eq("module", "rewards").single();
    canManage = vp?.access === "manage";
  }

  return NextResponse.json({ rules: data ?? [], canManage });
}

// PATCH /api/admin/reward-rules
//   { id, label?, points_per_unit?, unit?, max_per_day?, max_lifetime?, is_active?, valid_until? }
// Inline edit of a single rule. Manage-only.
export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin("rewards", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  let body: Record<string, unknown> & { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : null;
  if (!id) return NextResponse.json({ error: "Rule id is required" }, { status: 400 });

  const update: Record<string, unknown> = {};

  if ("label" in body) {
    const label = String(body.label ?? "").trim();
    if (!label) return NextResponse.json({ error: "Label cannot be empty" }, { status: 400 });
    update.label = label;
  }

  for (const f of NUMERIC_FIELDS) {
    if (f in body) {
      const raw = body[f];
      if (raw === null || raw === "") {
        // max_per_day / max_lifetime are nullable (= unlimited). points_per_unit is not.
        if (f === "points_per_unit") {
          return NextResponse.json({ error: "Points per unit is required" }, { status: 400 });
        }
        update[f] = null;
      } else {
        const n = Number(raw);
        if (!Number.isFinite(n) || n < 0) {
          return NextResponse.json({ error: `Invalid value for ${f}` }, { status: 400 });
        }
        update[f] = n;
      }
    }
  }

  if ("unit" in body) {
    const unit = String(body.unit);
    if (unit !== "fixed" && unit !== "per_gbp") {
      return NextResponse.json({ error: "Unit must be 'fixed' or 'per_gbp'" }, { status: 400 });
    }
    update.unit = unit;
  }

  if ("is_active" in body && typeof body.is_active === "boolean") {
    update.is_active = body.is_active;
  }

  if ("valid_until" in body) {
    update.valid_until = body.valid_until ? String(body.valid_until) : null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await serviceClient.from("reward_rules").update(update).eq("id", id);
  if (error) {
    console.error("[api/admin/reward-rules] update error", error);
    return NextResponse.json({ error: "Failed to update reward rule" }, { status: 500 });
  }

  await logAdminAction(gate, {
    action: "reward_rule.update", module: "rewards", targetType: "reward_rule", targetId: id,
    summary: `Updated reward rule: ${Object.keys(update).join(", ")}`,
    metadata: update,
  });

  return NextResponse.json({ ok: true });
}
