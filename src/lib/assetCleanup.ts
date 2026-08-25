// Cloudinary cleanup that survives a database cascade.
//
// The ordering problem this exists to solve: every public_id lives on a row that
// the delete is about to remove (profiles.avatar_public_id,
// posts.media_public_ids, recipes.image_public_id,
// merchant_documents.cloudinary_public_id). Delete first and the references are
// gone, so the files can never be found again. Collection therefore has to run
// BEFORE the cascade, and the ids have to be parked somewhere durable.
//
// pending_asset_deletions is that parking space (migration 073). Queue, then
// cascade, then try Cloudinary. Anything the immediate attempt misses stays
// queued for the sweeper at /api/cron/asset-sweeper, which is the part the old
// fire-and-forget `.catch(() => {})` in hubService never had.

import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteAssets } from "@/lib/cloudinary";
import { isVideoUrl } from "@/lib/cldUrl";

export type PendingAsset = {
  public_id: string;
  resource_type: "image" | "video" | "raw";
  /** "authenticated" is Cloudinary's private mode, used for merchant documents. */
  delivery_type: "upload" | "authenticated";
};

/** Max ids Cloudinary accepts in one delete_resources call. */
const CLOUDINARY_BATCH = 100;

/**
 * Every Cloudinary asset belonging to a user, gathered before anything is
 * deleted. Uses a service-role client because it reads across tables the user
 * may no longer be able to see once deletion is under way.
 */
export async function collectUserAssets(
  db: SupabaseClient,
  userId: string,
): Promise<PendingAsset[]> {
  const assets: PendingAsset[] = [];

  const { data: profile } = await db
    .from("profiles").select("avatar_public_id").eq("id", userId).maybeSingle();
  if (profile?.avatar_public_id) {
    assets.push({ public_id: profile.avatar_public_id, resource_type: "image", delivery_type: "upload" });
  }

  // media_urls is read purely to tell images from video: Cloudinary refuses to
  // delete a video addressed as resource_type "image", which is how videos
  // silently orphaned before.
  const { data: posts } = await db
    .from("posts").select("media_public_ids, media_urls").eq("user_id", userId);
  for (const post of posts ?? []) {
    const ids: string[] = post.media_public_ids ?? [];
    const urls: string[] = post.media_urls ?? [];
    ids.forEach((id, i) => {
      if (!id) return;
      assets.push({
        public_id: id,
        resource_type: isVideoUrl(urls[i]) ? "video" : "image",
        delivery_type: "upload",
      });
    });
  }

  const { data: recipes } = await db
    .from("recipes").select("image_public_id").eq("user_id", userId);
  for (const recipe of recipes ?? []) {
    if (recipe.image_public_id) {
      assets.push({ public_id: recipe.image_public_id, resource_type: "image", delivery_type: "upload" });
    }
  }

  return assets;
}

/**
 * Assets for specific posts, addressed by post id.
 *
 * Used by the admin purge paths. Note the deliberate split between soft and
 * hard delete in admin moderation: a soft delete is the Trash and can be
 * restored, so its images must stay. Only a purge should reach this.
 */
export async function collectPostAssets(
  db: SupabaseClient,
  postIds: string[],
): Promise<PendingAsset[]> {
  if (!postIds.length) return [];
  const { data: posts } = await db
    .from("posts").select("media_public_ids, media_urls").in("id", postIds);

  const assets: PendingAsset[] = [];
  for (const post of posts ?? []) {
    const ids: string[] = post.media_public_ids ?? [];
    const urls: string[] = post.media_urls ?? [];
    ids.forEach((id, i) => {
      if (!id) return;
      assets.push({
        public_id: id,
        resource_type: isVideoUrl(urls[i]) ? "video" : "image",
        delivery_type: "upload",
      });
    });
  }
  return assets;
}

/** Assets for specific recipes, addressed by recipe id. Same purge-only note. */
export async function collectRecipeAssets(
  db: SupabaseClient,
  recipeIds: string[],
): Promise<PendingAsset[]> {
  if (!recipeIds.length) return [];
  const { data: recipes } = await db
    .from("recipes").select("image_public_id").in("id", recipeIds);

  return (recipes ?? [])
    .filter((r) => r.image_public_id)
    .map((r) => ({
      public_id: r.image_public_id as string,
      resource_type: "image" as const,
      delivery_type: "upload" as const,
    }));
}

/**
 * Compliance documents for a merchant. Stored as private `authenticated`
 * assets, and `resource_type` is persisted per row because a PDF uploads as
 * "raw" while a photographed certificate uploads as "image".
 */
export async function collectMerchantAssets(
  db: SupabaseClient,
  merchantId: string,
): Promise<PendingAsset[]> {
  const { data: docs } = await db
    .from("merchant_documents")
    .select("cloudinary_public_id, resource_type")
    .eq("merchant_id", merchantId);

  return (docs ?? [])
    .filter((d) => d.cloudinary_public_id)
    .map((d) => ({
      public_id: d.cloudinary_public_id as string,
      resource_type: (d.resource_type as PendingAsset["resource_type"]) ?? "image",
      delivery_type: "authenticated" as const,
    }));
}

/** Parks assets in the queue so they survive the cascade. Never throws. */
export async function queueAssets(
  db: SupabaseClient,
  assets: PendingAsset[],
  reason: string,
): Promise<void> {
  if (!assets.length) return;
  const { error } = await db.from("pending_asset_deletions").insert(
    assets.map((a) => ({ ...a, reason })),
  );
  if (error) console.error("[assetCleanup] queue failed:", error.message, { reason });
}

/**
 * Best-effort immediate delete. Marks what Cloudinary confirms and leaves the
 * rest queued for the sweeper, so a failure here costs a delay rather than an
 * orphan. Never throws: a Cloudinary outage must not block account deletion.
 */
export async function flushAssets(
  db: SupabaseClient,
  assets: PendingAsset[],
): Promise<{ deleted: number; deferred: number }> {
  if (!assets.length) return { deleted: 0, deferred: 0 };

  // Cloudinary's API takes one resource_type and one delivery type per call.
  const groups = new Map<string, PendingAsset[]>();
  for (const a of assets) {
    const key = `${a.resource_type}|${a.delivery_type}`;
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }

  let deleted = 0;
  const done: string[] = [];

  for (const [key, group] of groups) {
    const [resourceType, deliveryType] = key.split("|") as
      [PendingAsset["resource_type"], PendingAsset["delivery_type"]];

    for (let i = 0; i < group.length; i += CLOUDINARY_BATCH) {
      const batch = group.slice(i, i + CLOUDINARY_BATCH);
      try {
        await deleteAssets(batch.map((a) => a.public_id), {
          resource_type: resourceType,
          type: deliveryType,
        });
        deleted += batch.length;
        done.push(...batch.map((a) => a.public_id));
      } catch (err) {
        // Left queued deliberately — the sweeper will retry.
        console.error("[assetCleanup] flush batch failed:", err instanceof Error ? err.message : err);
      }
    }
  }

  if (done.length) {
    await db.from("pending_asset_deletions")
      .update({ deleted_at: new Date().toISOString() })
      .in("public_id", done)
      .is("deleted_at", null);
  }

  return { deleted, deferred: assets.length - deleted };
}

/**
 * Queue, then immediately try. The common path for a delete handler.
 */
export async function purgeAssets(
  db: SupabaseClient,
  assets: PendingAsset[],
  reason: string,
): Promise<{ deleted: number; deferred: number }> {
  await queueAssets(db, assets, reason);
  return flushAssets(db, assets);
}
