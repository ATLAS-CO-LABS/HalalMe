import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { getFollowUp, THRESHOLDS } from "@/lib/followUps";
import { sendMerchantChaseEmail } from "@/services/emailService";
import { notifyTeam, type FollowUpSummaryItem } from "@/services/followUpService";
import * as Sentry from "@sentry/nextjs";

// Don't re-chase the same merchant more often than this
const CHASE_COOLDOWN_DAYS = 3;

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export async function GET(req: NextRequest) {
  // ── Secure the endpoint ──────────────────────────────────────────────────
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const serviceClient = createServiceClient();

  const { data: merchants, error } = await serviceClient
    .from("merchants")
    .select("id, name, owner_name, email, status, assigned_rep, created_at, invited_at, contacted_at, last_followup_at, next_followup_on, followup_count");

  if (error) {
    console.error("[cron/follow-ups] fetch error", error);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }

  const summaryItems: FollowUpSummaryItem[] = [];
  let chaseSent = 0;

  for (const m of merchants ?? []) {
    const followUp = getFollowUp(m);
    if (!followUp) continue;

    summaryItems.push({
      id: m.id,
      name: m.name,
      reason: followUp.label,
      action: followUp.action,
      days: followUp.days,
      rep: m.assigned_rep,
    });

    // Merchant-facing chase email: invited & ignored, respecting cooldown
    if (
      m.status === "invited" &&
      m.invited_at &&
      daysSince(m.invited_at) >= THRESHOLDS.invited &&
      (!m.last_followup_at || daysSince(m.last_followup_at) >= CHASE_COOLDOWN_DAYS)
    ) {
      try {
        await sendMerchantChaseEmail({
          to: m.email,
          restaurantName: m.name,
          ownerName: m.owner_name ?? undefined,
        });
        await serviceClient
          .from("merchants")
          .update({
            last_followup_at: new Date().toISOString(),
            followup_count: (m.followup_count ?? 0) + 1,
          })
          .eq("id", m.id);
        chaseSent++;
      } catch (err) {
        console.error(`[cron/follow-ups] chase email failed for ${m.email}`, err);
        Sentry.captureException(err);
      }
    }
  }

  // Internal digest (logs now; emails/Slack when configured)
  await notifyTeam({ total: summaryItems.length, items: summaryItems });

  return NextResponse.json({
    scanned: merchants?.length ?? 0,
    needsAttention: summaryItems.length,
    chaseEmailsSent: chaseSent,
  });
}
