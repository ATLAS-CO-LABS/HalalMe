import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim();

  let query = serviceClient
    .from("merchants")
    .select(
      "id, name, owner_name, email, phone, city, post_code, status, assigned_rep, commission_percentage, created_at, invited_at, contacted_at, activated_at, hyperzod_merchant_id, hyperzod_sync_failed"
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[api/admin/merchants] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch merchants" }, { status: 500 });
  }

  return NextResponse.json({ merchants: data ?? [] });
}
