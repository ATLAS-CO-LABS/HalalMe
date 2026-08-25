import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { deleteAssets } from "@/lib/cloudinary";
import { isVideoUrl } from "@/lib/cldUrl";
import { createRateLimiter, rateLimitResponse } from "@/lib/rateLimit";

const limiter = createRateLimiter("upload-delete", 60, "1 h");

/**
 * Public IDs the caller is allowed to delete.
 *
 * Both families embed the owner's user id in the path, so ownership is provable
 * from the string itself with no extra query. Anything outside these prefixes is
 * refused — notably `halalme/merchant-docs/*`, which is compliance material and
 * must never be reachable from a user-facing route, and `halalme/recipes/*`,
 * which is a flat folder with no owner in the path and therefore needs a
 * database lookup instead (added alongside recipe-delete cleanup).
 *
 * The trailing slash matters. Without it `halalme/posts/{id}` would also match
 * a sibling id that merely starts with the same characters.
 */
function ownedPrefixes(userId: string): string[] {
  return [`halalme/posts/${userId}/`, `halalme/avatars/${userId}/`];
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { success, reset } = await limiter.limit(user.id);
  if (!success) return rateLimitResponse(reset);

  let publicIds: string[] = [];
  let mediaUrls: string[] = [];
  try {
    const body = await req.json();
    publicIds = Array.isArray(body.public_ids) ? body.public_ids : [];
    // Optional, parallel to public_ids — lets us delete videos with the right
    // resource_type (Cloudinary won't delete a video asset as resource_type "image").
    mediaUrls = Array.isArray(body.media_urls) ? body.media_urls : [];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Split by type so images and videos are each removed with the correct
  // Cloudinary resource_type, and drop anything the caller does not own.
  const prefixes = ownedPrefixes(user.id);
  const images: string[] = [];
  const videos: string[] = [];
  let refused = 0;

  publicIds.forEach((id, i) => {
    if (typeof id !== "string") return;
    if (!prefixes.some((p) => id.startsWith(p))) {
      refused++;
      return;
    }
    if (isVideoUrl(mediaUrls[i])) videos.push(id);
    else images.push(id);
  });

  // Skipped silently rather than 4xx: a refusal that distinguishes "not yours"
  // from "does not exist" would confirm which assets are real. Logged instead,
  // because a caller sending ids it does not own is worth seeing.
  if (refused > 0) {
    console.warn(`[api/upload/delete] refused ${refused} unowned public_id(s) from user ${user.id}`);
  }

  try {
    if (images.length) await deleteAssets(images, { resource_type: "image" });
    if (videos.length) await deleteAssets(videos, { resource_type: "video" });
    return NextResponse.json({ deleted: images.length + videos.length, refused });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
