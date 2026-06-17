import { NextRequest, NextResponse } from "next/server";
import { signedDocUrl } from "@/lib/cloudinary";
import { requireAdmin as requireAdminAccess, type AccessLevel } from "@/lib/adminAuth";

async function requireAdmin(level: AccessLevel) {
  const gate = await requireAdminAccess("merchants", level);
  if (!gate.ok) return { error: gate.error, status: gate.status, serviceClient: null };
  return { error: null, status: 200, serviceClient: gate.serviceClient };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { error, status, serviceClient } = await requireAdmin("view");
  if (error || !serviceClient) return NextResponse.json({ error }, { status });

  const { data, error: dbError } = await serviceClient
    .from("merchant_documents")
    .select("*")
    .eq("merchant_id", id)
    .order("uploaded_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: "Could not load documents" }, { status: 500 });
  }

  // Attach a short-lived signed URL so admins can view each private asset.
  const documents = (data ?? []).map((d) => ({
    ...d,
    url: signedDocUrl(d.cloudinary_public_id, (d.resource_type as "image" | "raw") ?? "image", d.format),
  }));

  return NextResponse.json({ documents });
}
