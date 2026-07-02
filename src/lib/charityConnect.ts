import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase-server";

type ServiceClient = ReturnType<typeof createServiceClient>;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://halalme.co.uk";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" as any });
}

export interface CharityForConnect {
  id: string;
  name: string;
  legal_name: string | null;
  country: string | null;
  contact_email: string | null;
  website_url: string | null;
  stripe_account_id: string | null;
}

// Ensures the charity has a Stripe Express account, creates a fresh
// account-onboarding link, persists it on the charity row, and returns the URL.
// Used by both the admin "send/resend" route and the public refresh_url route.
export async function issueCharityOnboardingLink(
  serviceClient: ServiceClient,
  charity: CharityForConnect,
): Promise<{ url: string; accountId: string; expiresAt: string }> {
  const stripe = getStripe();
  const country = (charity.country || "GB").toUpperCase();

  let accountId = charity.stripe_account_id;

  if (!accountId) {
    if (!charity.contact_email) {
      throw new Error(
        "Charity has no contact email — add one before sending the onboarding link",
      );
    }
    const account = await stripe.accounts.create({
      type: "express",
      country,
      email: charity.contact_email,
      business_type: "non_profit",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: charity.legal_name || charity.name,
        mcc: "8398", // Charitable and social service organizations
        url: charity.website_url || undefined,
      },
      metadata: { charity_id: charity.id },
    });
    accountId = account.id;
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${SITE_URL}/api/charity-onboarding/refresh?charity=${charity.id}`,
    return_url: `${SITE_URL}/charity-onboarding/return`,
    type: "account_onboarding",
  });

  const expiresAt = new Date(link.expires_at * 1000).toISOString();

  const { error } = await serviceClient
    .from("charities")
    .update({
      stripe_account_id: accountId,
      stripe_onboarding_status: "pending",
      stripe_onboarding_url: link.url,
      stripe_onboarding_url_expires_at: expiresAt,
      stripe_onboarding_sent_at: new Date().toISOString(),
      stripe_country: country,
    })
    .eq("id", charity.id);

  if (error) throw new Error(`Failed to save onboarding link: ${error.message}`);

  return { url: link.url, accountId, expiresAt };
}
