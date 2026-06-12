import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import {
  sendMerchantAgreementEmail,
  sendMerchantCounterOfferEmail,
  sendMerchantReviewDeclinedEmail,
} from "@/services/emailService";
import { COMMISSION_PROTECTED_THRESHOLD } from "@/lib/merchantStages";

// Default shape so a null readiness_checklist isn't clobbered when we tick a flag.
const DEFAULT_CHECKLIST = {
  invite_accepted: false,
  commission_agreed: false,
  notes_completed: false,
  onboarding_verified: false,
};

async function requireAdmin() {
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401, service: null, userId: null };

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Forbidden", status: 403, service: null, userId: null };
  return { error: null, status: 200, service, userId: user.id };
}

// GET → the merchant's commission record (null if they haven't started).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { error, status, service } = await requireAdmin();
  if (error || !service) return NextResponse.json({ error }, { status });

  const { data } = await service
    .from("merchant_commission")
    .select("*")
    .eq("merchant_id", id)
    .maybeSingle();

  return NextResponse.json({ commission: data ?? null });
}

// POST { action: "approve" | "reject" | "counter", commission?, note? }
//   approve → lock the rate + advance the merchant to "agreed"
//   counter → record a counter-offer; merchant accepts it on their side
//   reject  → close the review (merchant stays in the Commission stage)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { error, status, service, userId } = await requireAdmin();
  if (error || !service) return NextResponse.json({ error }, { status });

  const body = await req.json() as { action?: string; commission?: number; note?: string };
  const action = body.action;

  const { data: row } = await service
    .from("merchant_commission")
    .select("*")
    .eq("merchant_id", id)
    .maybeSingle();

  if (!row) return NextResponse.json({ error: "No commission record for this merchant" }, { status: 404 });

  const { data: merchant } = await service
    .from("merchants")
    .select("id, status, name, email, owner_name, readiness_checklist")
    .eq("id", id)
    .single();
  if (!merchant) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

  const now = new Date().toISOString();

  if (action === "approve") {
    // The rate to grant: explicit value, else the merchant's ask, else the recommended.
    const rate =
      typeof body.commission === "number"
        ? body.commission
        : (row.requested_commission ?? row.recommended_commission);

    if (rate == null || rate <= 0 || rate > 100) {
      return NextResponse.json({ error: "Set a valid commission to approve" }, { status: 400 });
    }

    await service
      .from("merchant_commission")
      .update({
        review_status:    "approved",
        final_commission: rate,
        accepted_at:      now,
        decided_at:       now,
        decided_by:       userId,
      })
      .eq("merchant_id", id);

    // Advance the merchant to Agreed (forward-only) + sync the agreed rate +
    // auto-tick the "commission agreed" readiness item.
    if (merchant.status !== "live") {
      await service
        .from("merchants")
        .update({
          status: "agreed",
          commission_percentage: rate,
          readiness_checklist: {
            ...DEFAULT_CHECKLIST,
            ...(merchant.readiness_checklist ?? {}),
            commission_agreed: true,
          },
        })
        .eq("id", id);

      sendMerchantAgreementEmail({
        to: merchant.email,
        restaurantName: merchant.name,
        ownerName: merchant.owner_name ?? undefined,
      }).catch((err) => console.error("[admin/commission] agreement email failed", err));
    }

    return NextResponse.json({ ok: true, belowThreshold: rate < COMMISSION_PROTECTED_THRESHOLD });
  }

  if (action === "counter") {
    const rate = body.commission;
    if (typeof rate !== "number" || rate <= 0 || rate > 100) {
      return NextResponse.json({ error: "Enter a counter-offer rate" }, { status: 400 });
    }
    await service
      .from("merchant_commission")
      .update({
        review_status:        "countered",
        countered_commission: rate,
        decided_at:           now,
        decided_by:           userId,
      })
      .eq("merchant_id", id);

    // Tell the merchant there's a counter waiting for them to accept.
    sendMerchantCounterOfferEmail({
      to: merchant.email,
      restaurantName: merchant.name,
      ownerName: merchant.owner_name ?? undefined,
      commission: rate,
    }).catch((err) => console.error("[admin/commission] counter email failed", err));

    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    await service
      .from("merchant_commission")
      .update({
        review_status: "rejected",
        decided_at:    now,
        decided_by:    userId,
      })
      .eq("merchant_id", id);

    // Let the merchant know their standard rate stands.
    sendMerchantReviewDeclinedEmail({
      to: merchant.email,
      restaurantName: merchant.name,
      ownerName: merchant.owner_name ?? undefined,
      standardRate: row.recommended_commission,
    }).catch((err) => console.error("[admin/commission] decline email failed", err));

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
