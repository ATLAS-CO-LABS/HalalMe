import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { signedDocUrl } from "@/lib/cloudinary";
import { isStaffRole } from "@/lib/adminRoles";

async function requireAdmin() {
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401, user: null, serviceClient: null };

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!isStaffRole(profile?.role)) {
    return { error: "Forbidden", status: 403, user: null, serviceClient: null };
  }
  return { error: null, status: 200, user, serviceClient };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { error, status, serviceClient } = await requireAdmin();
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
