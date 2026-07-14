import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { uploadBuffer, deleteAssets } from "@/lib/cloudinary";
import { MERCHANT_DOC_TYPES } from "@/lib/merchantStages";
import * as Sentry from "@sentry/nextjs";

const ALLOWED_DOC_TYPES = new Set(MERCHANT_DOC_TYPES.map((d) => d.key));
const ALLOWED_FORMATS = new Set(["pdf", "jpg", "jpeg", "png", "webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function formatFromName(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export async function POST(req: NextRequest) {
  const authed = await createServerClient();
  const { data: { user } } = await authed.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  // Parse multipart form
  let file: File | null = null;
  let docType: string | null = null;
  let expiresAt: string | null = null;
  try {
    const form = await req.formData();
    file      = form.get("file")       as File | null;
    docType   = form.get("doc_type")   as string | null;
    expiresAt = form.get("expires_at") as string | null;
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!docType || !ALLOWED_DOC_TYPES.has(docType)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
  }
  const format = formatFromName(file.name);
  if (!ALLOWED_FORMATS.has(format)) {
    return NextResponse.json({ error: "Use PDF, JPG, PNG or WEBP" }, { status: 400 });
  }

  const service = createServiceClient();

  // Find the merchant owned by this user (strictly scoped by user_id).
  const { data: merchant, error: mErr } = await service
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (mErr || !merchant) {
    return NextResponse.json({ error: "No merchant record found" }, { status: 404 });
  }

  // All documents (PDF + images) go in as private "image" assets so delivery
  // URLs carry the file extension and render inline via signed URL. Requires
  // "Allow delivery of PDF and ZIP files" enabled in Cloudinary for PDFs.
  const resourceType: "image" | "raw" = "image";

  // Supersede any existing document of this type (delete the old Cloudinary asset).
  const { data: prev } = await service
    .from("merchant_documents")
    .select("id, cloudinary_public_id, resource_type")
    .eq("merchant_id", merchant.id)
    .eq("doc_type", docType);

  const buffer = Buffer.from(await file.arrayBuffer());

  let upload;
  try {
    upload = await uploadBuffer(buffer, {
      folder: `halalme/merchant-docs/${merchant.id}`,
      type: "authenticated",
      resource_type: resourceType,
    });
  } catch (err) {
    // Cloudinary errors carry { message, http_code } or { error: { message } }.
    const e = err as { message?: string; http_code?: number; error?: { message?: string } };
    const detail = e?.error?.message ?? e?.message ?? String(err);
    console.error("[merchant/documents] upload failed", { detail, http_code: e?.http_code, err });
    Sentry.captureException(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  // Insert the new document row.
  const { data: doc, error: insErr } = await service
    .from("merchant_documents")
    .insert({
      merchant_id:          merchant.id,
      doc_type:             docType,
      status:               "uploaded",
      cloudinary_public_id: upload.public_id,
      resource_type:        upload.resource_type,
      format:               upload.format ?? format,
      file_name:            file.name,
      expires_at:           expiresAt || null,
    })
    .select("*")
    .single();

  if (insErr) {
    console.error("[merchant/documents] insert error", insErr);
    Sentry.captureException(insErr);
    return NextResponse.json({ error: "Could not save document" }, { status: 500 });
  }

  // Clean up superseded rows + assets (best-effort, after the new one is safe).
  if (prev && prev.length) {
    const ids = prev.map((p) => p.id);
    await service.from("merchant_documents").delete().in("id", ids);
    for (const p of prev) {
      await deleteAssets([p.cloudinary_public_id], {
        resource_type: (p.resource_type as "image" | "raw") ?? "image",
        type: "authenticated",
      }).catch(() => {});
    }
  }

  return NextResponse.json({ document: doc });
}
