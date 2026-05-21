import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { uploadBuffer } from "@/lib/cloudinary";

const ALLOWED_FOLDERS = ["halalme/avatars", "halalme/recipes"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB for signed uploads

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let file: File | null = null;
  let folder: string | null = null;
  let publicId: string | null = null;

  try {
    const form = await req.formData();
    file     = form.get("file")      as File | null;
    folder   = form.get("folder")    as string | null;
    publicId = form.get("public_id") as string | null;
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  if (!file)   return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!folder || !ALLOWED_FOLDERS.includes(folder as AllowedFolder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await uploadBuffer(buffer, {
      folder,
      public_id: publicId ?? undefined,
      overwrite: !!publicId,
    });
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
