import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";

const BOOL_FLAGS = ["is_published", "is_halal_verified", "is_featured"] as const;

// GET /api/admin/recipes/[id] — full recipe (incl. ingredients/instructions) +
// author, via service role so admins can preview even hidden/unpublished recipes.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("kitchen", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { data: recipe, error } = await gate.serviceClient
    .from("recipes")
    .select("*, author:profiles!recipes_user_id_fkey(id, full_name, username)")
    .eq("id", id)
    .single();

  if (error || !recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  return NextResponse.json({ recipe });
}

// PATCH /api/admin/recipes/[id]
//   { is_published?, is_halal_verified?, is_featured? }
// Toggle moderation flags on a recipe. Manage-only.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("kitchen", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Restore from the Trash — clears the soft-delete marker (stays unpublished).
  if (body.restore === true) {
    const { error } = await serviceClient
      .from("recipes")
      .update({ deleted_at: null, deleted_by: null })
      .eq("id", id);
    if (error) {
      console.error("[api/admin/recipes/[id]] restore error", error);
      return NextResponse.json({ error: "Failed to restore recipe" }, { status: 500 });
    }
    await logAdminAction(gate, {
      action: "recipe.restore", module: "kitchen", targetType: "recipe", targetId: id,
      summary: `Restored recipe ${id} from Trash`,
    });
    return NextResponse.json({ ok: true });
  }

  const update: Record<string, boolean> = {};
  for (const f of BOOL_FLAGS) {
    if (f in body && typeof body[f] === "boolean") update[f] = body[f] as boolean;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await serviceClient.from("recipes").update(update).eq("id", id);
  if (error) {
    console.error("[api/admin/recipes/[id]] update error", error);
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }

  await logAdminAction(gate, {
    action: "recipe.update", module: "kitchen", targetType: "recipe", targetId: id,
    summary: `Updated recipe flags: ${Object.entries(update).map(([k, v]) => `${k}=${v}`).join(", ")}`,
    metadata: update,
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/recipes/[id]
//   default  → soft delete (Trash): set deleted_at, hide from public.
//   ?hard=1  → permanent delete (cascades to recipe_reviews/favorites via FK).
// Manage-only.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const hard = new URL(req.url).searchParams.get("hard") === "1";

  const gate = await requireAdmin("kitchen", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { data: recipe } = await gate.serviceClient.from("recipes").select("title").eq("id", id).single();

  if (hard) {
    const { error } = await gate.serviceClient.from("recipes").delete().eq("id", id);
    if (error) {
      console.error("[api/admin/recipes/[id]] purge error", error);
      return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
    }
    await logAdminAction(gate, {
      action: "recipe.purge", module: "kitchen", targetType: "recipe", targetId: id,
      summary: `Permanently deleted recipe ${recipe?.title ?? id}`,
      metadata: { title: recipe?.title ?? null },
    });
    return NextResponse.json({ ok: true });
  }

  const { error } = await gate.serviceClient
    .from("recipes")
    .update({ deleted_at: new Date().toISOString(), deleted_by: gate.userId, is_published: false })
    .eq("id", id);
  if (error) {
    console.error("[api/admin/recipes/[id]] soft-delete error", error);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }

  await logAdminAction(gate, {
    action: "recipe.delete", module: "kitchen", targetType: "recipe", targetId: id,
    summary: `Moved recipe ${recipe?.title ?? id} to Trash`,
    metadata: { title: recipe?.title ?? null },
  });

  return NextResponse.json({ ok: true });
}
