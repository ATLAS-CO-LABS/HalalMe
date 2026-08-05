import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServiceClient } from "@/lib/supabase-server";
import * as Sentry from "@sentry/nextjs";

const WEBHOOK_SECRET = process.env.HYPERZOD_WEBHOOK_SECRET ?? "";
// Escape hatch: set to "false" to accept unverified payloads if Hyperzod
// changes how it signs and user sync would otherwise stop.
const ENFORCE = process.env.HYPERZOD_WEBHOOK_ENFORCE !== "false";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * Verify the request came from Hyperzod.
 *
 * Their dashboard shows a `whsec_...` per webhook but doesn't document which
 * header carries it, and the check has been disabled since May 2026 waiting for
 * that answer. Rather than keep waiting, this checks every header two ways —
 * the secret sent verbatim, and an HMAC-SHA256 of the body keyed with it — and
 * reports which header matched. That covers both conventions and tells us the
 * header name the first time a real event lands.
 */
function verifySignature(
  rawBody: string,
  headers: Headers
): { ok: boolean; via: string | null } {
  if (!WEBHOOK_SECRET) return { ok: false, via: null };

  for (const [name, value] of headers.entries()) {
    if (safeEqual(value.trim(), WEBHOOK_SECRET)) return { ok: true, via: name };
  }

  const hmacHex = createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  const hmacB64 = createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("base64");

  for (const [name, value] of headers.entries()) {
    const v = value.trim();
    // Signature headers are often prefixed ("sha256=...", "t=...,v1=...").
    if (v.includes(hmacHex) || v.includes(hmacB64)) return { ok: true, via: name };
  }

  return { ok: false, via: null };
}

/** Hyperzod nests the object under `payload`; older samples used `data`. */
function unwrap(body: Record<string, unknown>): Record<string, unknown> {
  return (body.payload ?? body.data ?? body) as Record<string, unknown>;
}

function readCustomerId(data: Record<string, unknown>): string | null {
  const id = data.id ?? data.user_id ?? data.customer_id ?? data._id;
  return id == null || id === "" ? null : String(id);
}

export async function POST(req: NextRequest) {
  // Read the body as text first — an HMAC has to be computed over the exact
  // bytes sent, not a re-serialised object.
  const rawBody = await req.text();

  const { ok, via } = verifySignature(rawBody, req.headers);

  if (ok) {
    // One-off: record which header carried it so the guesswork can be deleted.
    console.log("[hyperzod-webhook] verified via header:", via);
  } else if (ENFORCE) {
    console.error(
      "[hyperzod-webhook] rejected — no header matched the secret. Headers seen:",
      [...req.headers.keys()].join(", ")
    );
    Sentry.captureMessage("Hyperzod webhook signature verification failed", {
      level: "warning",
      extra: { headers: [...req.headers.keys()], has_secret: Boolean(WEBHOOK_SECRET) },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } else {
    console.warn("[hyperzod-webhook] unverified payload accepted (enforcement off)");
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = String(body.event ?? body.type ?? "").toLowerCase();
  const data = unwrap(body);

  // Deletions have to be handled, otherwise a customer removed on Hyperzod
  // leaves us holding an id that matches nobody — the link looks healthy and
  // silently drops that user's order points.
  if (event.includes("delet")) {
    return handleCustomerDeleted(data);
  }

  return handleCustomerCreated(data);
}

/** Clear the stored link so the user is re-matched on their next visit. */
async function handleCustomerDeleted(data: Record<string, unknown>) {
  const customerId = readCustomerId(data);
  // Supabase stores emails lowercased; Hyperzod does not promise to send them
  // that way, and Postgres `=` is case-sensitive.
  const email = String(data.email ?? "").trim().toLowerCase();

  if (!customerId && !email) {
    return NextResponse.json({ error: "No customer id or email" }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const query = serviceClient.from("profiles").update({ hyperzod_customer_id: null });

  const { error } = customerId
    ? await query.eq("hyperzod_customer_id", customerId)
    : await query.eq("email", email);

  if (error) {
    console.error("[hyperzod-webhook] failed to clear link", error);
    Sentry.captureException(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, unlinked: customerId ?? email });
}

async function handleCustomerCreated(data: Record<string, unknown>) {
  const email = String(data.email ?? "").trim().toLowerCase();
  const firstName = String(data.first_name ?? "");
  const lastName = String(data.last_name ?? "");
  const mobile = String(data.mobile ?? "");
  const countryCode = String(data.country_code ?? "GB");
  const customerId = readCustomerId(data);

  if (!email) {
    return NextResponse.json({ error: "No email in payload" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  const fullName = `${firstName} ${lastName}`.trim() || email.split("@")[0];
  // mobile arrives internationalised ("+447911123456"); toE164Digits handles
  // both this and the national form written by /complete-profile.
  const phone = mobile ? `${countryCode}:${mobile}` : null;

  // Already a HalalMe user? Then this is the same person arriving from the
  // delivery side. Link them instead of trying to invite a duplicate.
  const { data: existing } = await serviceClient
    .from("profiles")
    .select("id, hyperzod_customer_id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    if (customerId && existing.hyperzod_customer_id !== customerId) {
      await serviceClient
        .from("profiles")
        .update({ hyperzod_customer_id: customerId })
        .eq("id", existing.id);
    }
    return NextResponse.json({ success: true, linked_existing: true, user_id: existing.id });
  }

  // New to us — invite them.
  //
  // The Hyperzod details go in user metadata rather than straight to profiles:
  // inviteUserByEmail leaves email_confirmed_at NULL, and profiles are only
  // created on confirmation (on_auth_user_confirmed). Writing to profiles here
  // updates a row that does not exist yet, which is why every Hyperzod signup
  // so far lost its phone and never got a customer id. Migration 068 copies
  // these across when the profile is finally created.
  //
  // No username is generated. A made-up handle makes the app treat onboarding
  // as finished, so the user never reaches /complete-profile and never gets
  // linked. Leaving it NULL routes them there to choose their own.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://halalme.co.uk";
  const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        full_name: fullName,
        from_hyperzod: true,
        ...(phone ? { phone } : {}),
        ...(customerId ? { hyperzod_customer_id: customerId } : {}),
      },
      redirectTo: `${siteUrl}/login`,
    }
  );

  if (inviteError) {
    const msg = inviteError.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("duplicate")) {
      return NextResponse.json({ skipped: "email_exists" });
    }
    console.error("[hyperzod-webhook] inviteUserByEmail error", inviteError);
    Sentry.captureException(inviteError);
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    user_id: inviteData.user.id,
    linked: Boolean(customerId),
  });
}
