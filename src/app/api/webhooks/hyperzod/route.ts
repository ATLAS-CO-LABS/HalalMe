import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import * as Sentry from "@sentry/nextjs";

// const WEBHOOK_SECRET = process.env.HYPERZOD_WEBHOOK_SECRET ?? ""; // TODO: re-enable when Hyperzod confirms secret header name

function verifySecret(_req: NextRequest): boolean {
  // TEMP DEBUG — capturing real headers to find which one carries the whsec_ secret. Remove after.
  console.log("[hyperzod-debug] headers:", JSON.stringify(Object.fromEntries(_req.headers.entries())));
  // TODO: re-enable once Hyperzod confirms which header carries the whsec_ secret
  return true;
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

  // Hyperzod sends customer data under "payload" key: { event: "...", payload: { ... } }
  const data = (payload.payload ?? payload.data ?? payload) as Record<string, unknown>;
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
  // mobile arrives as "+923483096535" (already prefixed), store as "PK:+923483096535"
  const phone = mobile ? `${countryCode}:${mobile}` : null;
  const username = generateUsername(firstName, lastName);

  // Attempt to create the account — if email already exists Supabase returns an error
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://halalme.co.uk";
  const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name: fullName, from_hyperzod: true },
      redirectTo: `${siteUrl}/login`,
    }
  );

  if (inviteError) {
    const msg = inviteError.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("duplicate")) {
      return NextResponse.json({ skipped: "email_exists" });
    }
    console.error("[webhook/hyperzod] inviteUserByEmail error", inviteError);
    Sentry.captureException(inviteError);
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
