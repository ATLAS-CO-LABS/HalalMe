import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { sendMerchantAgreementEmail, sendMerchantContractEmail } from "@/services/emailService";
import * as Sentry from "@sentry/nextjs";
import {
  COMMISSION_QUESTIONS,
  evaluateCommission,
  type CommissionAnswers,
} from "@/lib/merchantStages";

// Statuses where a merchant is sitting in the Commission stage and may interact
// with the review flow. Accepting on the auto lane advances them to "agreed".
const COMMISSION_STAGE_STATUSES = new Set(["contacted", "negotiating", "commission"]);

const REVIEW_REASONS = new Set(["existing_provider", "expansion", "strategic", "other"]);

// Default shape so a null readiness_checklist isn't clobbered when we tick a flag.
const DEFAULT_CHECKLIST = {
  invite_accepted: false,
  commission_agreed: false,
  notes_completed: false,
  onboarding_verified: false,
};

/** Find the merchant owned by the signed-in user (scoped strictly by user_id). */
async function ownedMerchant(userId: string) {
  const service = createServiceClient();
  const { data } = await service
    .from("merchants")
    .select("id, status, name, email, owner_name, readiness_checklist")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return { service, merchant: data };
}

/** Validate that every answer is one of the allowed option values. */
function parseAnswers(raw: unknown): CommissionAnswers | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const q of COMMISSION_QUESTIONS) {
    const v = obj[q.key];
    if (typeof v !== "string" || !q.options.some((o) => o.value === v)) return null;
    out[q.key] = v;
  }
  return out as unknown as CommissionAnswers;
}

// ── GET: the caller's own commission record (null before they start) ──────────
export async function GET() {
  const authed = await createServerClient();
  const { data: { user } } = await authed.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { service, merchant } = await ownedMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: "No merchant record found" }, { status: 404 });

  const { data } = await service
    .from("merchant_commission")
    .select("*")
    .eq("merchant_id", merchant.id)
    .maybeSingle();

  return NextResponse.json({ commission: data ?? null });
}

// ── POST: submit answers · accept · request review ────────────────────────────
export async function POST(req: NextRequest) {
  const authed = await createServerClient();
  const { data: { user } } = await authed.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { service, merchant } = await ownedMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: "No merchant record found" }, { status: 404 });

  const action = body.action;

  // ── submit: compute score server-side and store the result ──────────────────
  if (action === "submit") {
    const answers = parseAnswers(body.answers);
    if (!answers) return NextResponse.json({ error: "Invalid answers" }, { status: 400 });

    const result = evaluateCommission(answers);

    const { data, error } = await service
      .from("merchant_commission")
      .upsert({
        merchant_id:              merchant.id,
        store_count:              ({ "1": 1, "2": 2, "3_5": 3, "6plus": 6 })[answers.store_count],
        monthly_volume_band:      answers.monthly_volume_band,
        on_other_platform:        answers.on_other_platform === "yes",
        existing_commission_band: answers.existing_commission_band,
        exclusivity:              answers.exclusivity === "yes",
        launch_ready_7d:          answers.launch_ready_7d === "yes",
        menu_ready:               answers.menu_ready === "yes",
        referral_source:          answers.referral_source,
        qualification_score:      result.score,
        score_breakdown:          result.breakdown,
        recommended_commission:   result.recommended,
        lane:                     result.lane,
        // Reset the review/result trail on (re)submit.
        review_status:            "none",
        requested_commission:     null,
        review_reason:            null,
        countered_commission:     null,
        final_commission:         null,
        accepted_at:              null,
      }, { onConflict: "merchant_id" })
      .select("*")
      .single();

    if (error) {
      console.error("[merchant/commission] submit error", error);
      return NextResponse.json({ error: "Could not save your answers" }, { status: 500 });
    }
    return NextResponse.json({ commission: data });
  }

  // For accept / request_review we need the existing record.
  const { data: existing } = await service
    .from("merchant_commission")
    .select("*")
    .eq("merchant_id", merchant.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Complete the commission questions first" }, { status: 400 });
  }

  // ── accept: lock the rate + advance to Agreed ────────────────────────────────
  // Two acceptable cases: the AUTO-lane recommended rate, or an admin counter-offer.
  if (action === "accept") {
    let rate: number | null = null;
    if (existing.review_status === "countered" && existing.countered_commission != null) {
      rate = Number(existing.countered_commission); // accepting the admin's counter
    } else if (
      existing.review_status === "none" &&
      existing.recommended_commission != null
    ) {
      // The recommended rate (25/27.5/30) can be accepted from either lane —
      // on the review lane it's the standard offer the merchant takes instead of
      // pursuing a lower Price-Promise match.
      rate = Number(existing.recommended_commission);
    }

    if (rate == null) {
      return NextResponse.json({ error: "This rate needs a review before it can be accepted" }, { status: 400 });
    }

    const { data: updated, error } = await service
      .from("merchant_commission")
      .update({
        final_commission: rate,
        accepted_at:      new Date().toISOString(),
        // A counter that the merchant accepts becomes an approved outcome.
        review_status:    existing.review_status === "countered" ? "approved" : "none",
      })
      .eq("merchant_id", merchant.id)
      .select("*")
      .single();

    if (error) {
      console.error("[merchant/commission] accept error", error);
      return NextResponse.json({ error: "Could not accept the rate" }, { status: 500 });
    }

    // The one place a merchant self-advances a stage: auto-lane Accept → Agreed.
    if (COMMISSION_STAGE_STATUSES.has(merchant.status)) {
      await service
        .from("merchants")
        .update({
          status: "agreed",
          commission_percentage: rate,
          readiness_checklist: {
            ...DEFAULT_CHECKLIST,
            ...((merchant.readiness_checklist as Record<string, boolean> | null) ?? {}),
            commission_agreed: true,
          },
        })
        .eq("id", merchant.id);

      sendMerchantAgreementEmail({
        to: merchant.email,
        restaurantName: merchant.name,
        ownerName: merchant.owner_name ?? undefined,
      }).catch((err) => {
        console.error("[merchant/commission] agreement email failed", err);
        Sentry.captureException(err);
      });
    }

    return NextResponse.json({ commission: updated });
  }

  // ── sign_contract: Agreed-stage tick + timestamp (admin still reviews → Live) ─
  if (action === "sign_contract") {
    // Already signed — don't re-stamp or re-email on a duplicate/retried request.
    if (existing.contract_signed_at) {
      return NextResponse.json({ commission: existing });
    }

    const signedAtIso = new Date().toISOString();
    const { data: updated, error } = await service
      .from("merchant_commission")
      .update({ contract_signed_at: signedAtIso })
      .eq("merchant_id", merchant.id)
      .select("*")
      .single();

    if (error) {
      console.error("[merchant/commission] sign_contract error", error);
      return NextResponse.json({ error: "Could not record your signature" }, { status: 500 });
    }

    // Email the merchant their signed agreement as a record (fire-and-forget).
    if (updated.final_commission != null) {
      sendMerchantContractEmail({
        to: merchant.email,
        restaurantName: merchant.name,
        ownerName: merchant.owner_name ?? undefined,
        commission: Number(updated.final_commission),
        signedAt: new Date(signedAtIso).toLocaleString("en-GB", {
          day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
        }),
      }).catch((err) => {
        console.error("[merchant/commission] contract email failed", err);
        Sentry.captureException(err);
      });
    }

    return NextResponse.json({ commission: updated });
  }

  // ── request_review: send to the admin queue (does NOT advance the stage) ──────
  if (action === "request_review") {
    const reason = typeof body.reason === "string" ? body.reason : "";
    if (!REVIEW_REASONS.has(reason)) {
      return NextResponse.json({ error: "Choose a reason for review" }, { status: 400 });
    }
    const requested = body.requested_commission;
    const requestedNum =
      typeof requested === "number" && requested > 0 && requested <= 100 ? requested : null;

    const { data: updated, error } = await service
      .from("merchant_commission")
      .update({
        review_status:        "pending",
        review_reason:        reason,
        requested_commission: requestedNum,
      })
      .eq("merchant_id", merchant.id)
      .select("*")
      .single();

    if (error) {
      console.error("[merchant/commission] request_review error", error);
      return NextResponse.json({ error: "Could not submit your review request" }, { status: 500 });
    }
    return NextResponse.json({ commission: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
