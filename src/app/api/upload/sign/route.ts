import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { cloudinary } from "@/lib/cloudinary";
import { createRateLimiter, rateLimitResponse } from "@/lib/rateLimit";

const limiter = createRateLimiter("upload-sign", 40, "1 h");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Issues a short-lived Cloudinary upload signature for post media.
 *
 * Why signatures rather than routing the file through this server: Vercel caps
 * a function request body at 4.5 MB at the infrastructure level, and it cannot
 * be raised from config. Post media allows video up to 50 MB, so the bytes have
 * to go browser → Cloudinary directly. Signing is what makes that direct upload
 * authorised instead of anonymous.
 *
 * The folder is built from the session user id and never read from the request
 * body, so a caller cannot sign an upload into another user's folder. That
 * pairing matters: /api/upload/delete grants delete rights based on the
 * `halalme/posts/{userId}/` prefix, so if the client could choose its own
 * folder it could also choose whose assets it may later delete.
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { success, reset } = await limiter.limit(user.id);
  if (!success) return rateLimitResponse(reset);

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!apiKey || !apiSecret || !cloudName) {
    console.error("[api/upload/sign] Cloudinary env vars missing");
    return NextResponse.json({ error: "Upload is not configured" }, { status: 500 });
  }

  let postId = "";
  try {
    const body = await req.json();
    postId = String(body.post_id ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Constrained to a UUID so the value cannot walk the folder tree with "..".
  if (!UUID_RE.test(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  const folder = `halalme/posts/${user.id}/${postId}`;
  const timestamp = Math.floor(Date.now() / 1000);

  // Only signed params are enforced by Cloudinary. Folder is signed, so the
  // upload cannot land anywhere else even though the request is made by the
  // browser. Signatures expire on Cloudinary's own clock (1 hour).
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret);

  return NextResponse.json({ signature, timestamp, folder, apiKey, cloudName });
}
