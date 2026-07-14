import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { issueCharityOnboardingLink, SITE_URL } from "@/lib/charityConnect";

// GET /api/charity-onboarding/refresh?charity=<id>
// Public endpoint hit by Stripe (in the charity's browser) when an onboarding
// link expires or is reopened. Issues a fresh link and redirects the charity
// straight back into onboarding. No admin auth — this only ever regenerates an
// onboarding link for the charity's OWN Express account, which still requires
// them to pass Stripe KYC to enable payouts to their own bank.
export async function GET(req: NextRequest) {
  const charityId = new URL(req.url).searchParams.get("charity");
  const returnUrl = `${SITE_URL}/charity-onboarding/return`;

  if (!charityId) {
    return NextResponse.redirect(`${returnUrl}?error=missing`);
  }

  const serviceClient = createServiceClient();
  const { data: charity } = await serviceClient
    .from("charities")
    .select(
      "id, name, legal_name, country, contact_email, website_url, stripe_account_id, stripe_charges_enabled",
    )
    .eq("id", charityId)
    .single();

  if (!charity || !charity.stripe_account_id) {
    return NextResponse.redirect(`${returnUrl}?error=notfound`);
  }

  // Already finished — nothing to refresh.
  if (charity.stripe_charges_enabled) {
    return NextResponse.redirect(returnUrl);
  }

  try {
    const link = await issueCharityOnboardingLink(serviceClient, charity);
    return NextResponse.redirect(link.url);
  } catch (e) {
    console.error("[charity-onboarding/refresh] error", e);
    return NextResponse.redirect(`${returnUrl}?error=link`);
  }
}
