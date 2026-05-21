import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { deleteAssets } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let publicIds: string[] = [];
  try {
    const body = await req.json();
    publicIds = Array.isArray(body.public_ids) ? body.public_ids : [];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Only allow deleting assets under our own folder prefix
  const safe = publicIds.filter(
    (id) => typeof id === "string" && id.startsWith("halalme/")
  );

  try {
    await deleteAssets(safe);
    return NextResponse.json({ deleted: safe.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
