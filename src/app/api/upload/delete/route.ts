import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { deleteAssets } from "@/lib/cloudinary";
import { isVideoUrl } from "@/lib/cldUrl";

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

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

  // Only allow deleting assets under our own folder prefix; split by type so
  // images and videos are each removed with the correct Cloudinary resource_type.
  const images: string[] = [];
  const videos: string[] = [];
  publicIds.forEach((id, i) => {
    if (typeof id !== "string" || !id.startsWith("halalme/")) return;
    if (isVideoUrl(mediaUrls[i])) videos.push(id);
    else images.push(id);
  });

  try {
    if (images.length) await deleteAssets(images, { resource_type: "image" });
    if (videos.length) await deleteAssets(videos, { resource_type: "video" });
    return NextResponse.json({ deleted: images.length + videos.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
