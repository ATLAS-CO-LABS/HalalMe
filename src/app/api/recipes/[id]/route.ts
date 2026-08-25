import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { queueAssets, flushAssets, type PendingAsset } from "@/lib/assetCleanup";

/**
 * DELETE /api/recipes/[id] — delete a recipe and its Cloudinary image.
 *
 * Previously recipeService.deleteRecipe removed the row straight from the
 * browser and never touched the image, so every deleted recipe left its file
 * behind. Posts already did cleanup correctly, so the capability existed and
 * simply was not wired up here.
 *
 * This runs server-side rather than following the posts pattern because recipe
 * images live in a flat `halalme/recipes` folder with no owner in the path.
 * Post media encodes the user id in its path, which is what lets
 * /api/upload/delete authorise those deletions after the row is gone. Recipes
 * have no such handle, so ownership has to be proven from the row itself, which
 * means proving it before the row is deleted.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  // Ownership is read from the row while it still exists. This is both the
  // authorisation check and the only chance to capture the image reference.
  const { data: recipe } = await service
    .from("recipes")
    .select("id, user_id, image_public_id")
    .eq("id", id)
    .maybeSingle();

  if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  if (recipe.user_id !== user.id) {
    return NextResponse.json({ error: "Not your recipe" }, { status: 403 });
  }

  // Seeded demo recipes point image_url at /images/Recipes/*.jpg with a NULL
  // public_id (migration 031). Nothing to remove from Cloudinary in that case.
  const assets: PendingAsset[] = recipe.image_public_id
    ? [{ public_id: recipe.image_public_id, resource_type: "image", delivery_type: "upload" }]
    : [];

  await queueAssets(service, assets, "recipe_delete");

  // Deleted through the user's own client so RLS still applies as the final
  // guard, rather than relying only on the ownership check above.
  const { data: deleted, error } = await supabase
    .from("recipes").delete().eq("id", id).select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!deleted?.length) {
    return NextResponse.json({ error: "Recipe could not be deleted" }, { status: 403 });
  }

  try {
    await flushAssets(service, assets);
  } catch (err) {
    console.error("[api/recipes/[id]] asset flush failed", err);
  }

  return NextResponse.json({ ok: true });
}
