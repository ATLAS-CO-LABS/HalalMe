import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { isStaffRole } from "@/lib/adminRoles";

// GET /api/admin/team
// Lightweight list of all staff (admin + super_admin) for rep-picker dropdowns.
// Available to any staff member — it's just team names, used to assign reps.
export async function GET() {
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!isStaffRole(profile?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await serviceClient
    .from("profiles")
    .select("id, full_name, email, role")
    .in("role", ["admin", "super_admin"])
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[api/admin/team] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }

  return NextResponse.json({ team: data ?? [] });
}
