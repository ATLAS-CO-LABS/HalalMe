import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { signedDocUrl } from "@/lib/cloudinary";

// Returns a short-lived signed URL for a document the caller owns.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> },
) {
  const { docId } = await params;

  const authed = await createServerClient();
  const { data: { user } } = await authed.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  // Fetch the document and confirm it belongs to a merchant this user owns.
  const { data: doc, error } = await service
    .from("merchant_documents")
    .select("cloudinary_public_id, resource_type, format, merchant_id, merchants!inner(user_id)")
    .eq("id", docId)
    .maybeSingle();

  if (error || !doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ownerId = (doc as unknown as { merchants: { user_id: string | null } }).merchants?.user_id;
  if (ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = signedDocUrl(
    doc.cloudinary_public_id,
    (doc.resource_type as "image" | "raw") ?? "image",
    doc.format,
  );

  return NextResponse.json({ url });
}
