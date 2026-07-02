import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";
import { issueCharityOnboardingLink } from "@/lib/charityConnect";
import { sendCharityConnectInviteEmail } from "@/services/emailService";

// POST /api/admin/charities/[id]/connect
// Creates the charity's Stripe Express account (if it doesn't have one yet),
// generates an account-onboarding link, saves it, and emails it to the charity.
// Also serves as "resend" — calling again for a not-yet-connected charity issues
// a fresh link (Stripe links expire ~24h). Manage-only.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("rewards", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { data: charity, error } = await serviceClient
    .from("charities")
    .select(
      "id, name, legal_name, country, contact_email, website_url, stripe_account_id, stripe_charges_enabled",
    )
    .eq("id", id)
    .single();

  if (error || !charity) {
    return NextResponse.json({ error: "Charity not found" }, { status: 404 });
  }

  if (!charity.contact_email) {
    return NextResponse.json(
      { error: "Add a contact email for this charity before sending the onboarding link." },
      { status: 422 },
    );
  }

  if (charity.stripe_charges_enabled) {
    return NextResponse.json(
      { error: "This charity is already connected and accepting donations." },
      { status: 409 },
    );
  }

  const isResend = charity.stripe_account_id != null;

  let link: { url: string; accountId: string; expiresAt: string };
  try {
    link = await issueCharityOnboardingLink(serviceClient, charity);
  } catch (e) {
    console.error("[charities/connect] stripe error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create Stripe onboarding link" },
      { status: 502 },
    );
  }

  try {
    await sendCharityConnectInviteEmail({
      to: charity.contact_email,
      charityName: charity.name,
      onboardingUrl: link.url,
    });
  } catch (e) {
    // The link is saved — only the email failed. Return partial success so the
    // admin can copy the link and send it manually.
    console.error("[charities/connect] email failed", e);
    return NextResponse.json({
      ok: true,
      emailed: false,
      onboarding_url: link.url,
      error: "Onboarding link created, but the email failed to send. Copy the link and send it manually.",
    });
  }

  await logAdminAction(gate, {
    action: isResend ? "charity.connect_resend" : "charity.connect_invite",
    module: "rewards",
    targetType: "charity",
    targetId: id,
    summary: isResend
      ? `Resent Stripe onboarding link to ${charity.name}`
      : `Sent Stripe onboarding link to ${charity.name}`,
    metadata: { account_id: link.accountId, to: charity.contact_email },
  });

  return NextResponse.json({ ok: true, emailed: true, onboarding_url: link.url });
}
