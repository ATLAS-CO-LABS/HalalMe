import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";

const WEBHOOK_SECRET = process.env.HYPERZOD_WEBHOOK_SECRET ?? "";

function verifySecret(req: NextRequest): boolean {
  if (!WEBHOOK_SECRET) return true; // skip verification if not configured yet
  const header =
    req.headers.get("x-webhook-secret") ??
    req.headers.get("x-hyperzod-secret") ??
    req.headers.get("authorization")?.replace("Bearer ", "");
  return header === WEBHOOK_SECRET;
}

function generateUsername(firstName: string, lastName: string): string {
  const base = `${firstName}${lastName ? "_" + lastName : ""}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}_${suffix}`;
}

export async function POST(req: NextRequest) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Extract customer data — handle both flat and nested payloads
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const email = (data.email ?? "") as string;
  const firstName = (data.first_name ?? "") as string;
  const lastName = (data.last_name ?? "") as string;
  const mobile = (data.mobile ?? "") as string;
  const countryCode = (data.country_code ?? "GB") as string;

  if (!email) {
    return NextResponse.json({ error: "No email in payload" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  const fullName = `${firstName} ${lastName}`.trim() || email.split("@")[0];
  const phone = mobile ? `${countryCode}:${mobile}` : null;
  const username = generateUsername(firstName, lastName);

  // Attempt to create the account — if email already exists Supabase returns an error
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://halalme.co.uk";
  const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name: fullName, from_hyperzod: true },
      redirectTo: `${siteUrl}/complete-profile`,
    }
  );

  if (inviteError) {
    const msg = inviteError.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("duplicate")) {
      return NextResponse.json({ skipped: "email_exists" });
    }
    console.error("[webhook/hyperzod] inviteUserByEmail error", inviteError);
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  const userId = inviteData.user.id;

  // Save phone + a default username to their profile
  await serviceClient
    .from("profiles")
    .update({
      ...(phone ? { phone } : {}),
      username,
    })
    .eq("id", userId);

  return NextResponse.json({ success: true, user_id: userId });
}
