import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { sendMerchantAgreementEmail, sendMerchantInviteSentEmail } from "@/services/emailService";
import { deleteHyperzodMerchant } from "@/services/hyperzodService";

async function getAdminServiceClient() {
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) return { error: "Unauthorized", status: 401, serviceClient: null };

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Forbidden", status: 403, serviceClient: null };

  return { error: null, status: 200, serviceClient };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, serviceClient } = await getAdminServiceClient();
  if (error || !serviceClient) return NextResponse.json({ error }, { status });

  const { data, error: dbError } = await serviceClient
    .from("merchants")
    .select("*")
    .eq("id", id)
    .single();

  if (dbError || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ merchant: data });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, serviceClient } = await getAdminServiceClient();
  if (error || !serviceClient) return NextResponse.json({ error }, { status });

  const body = await req.json() as {
    status?: string;
    assigned_rep?: string | null;
    commission_percentage?: number | null;
    readiness_checklist?: Record<string, boolean>;
    note?: string;
  };

  // Fetch current record so we can append notes and conditionally set timestamps
  const { data: current } = await serviceClient
    .from("merchants")
    .select("status, notes, invited_at, contacted_at, activated_at, name, owner_name, email")
    .eq("id", id)
    .single();

  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only email on FORWARD progress through the pipeline — never when reverting
  // a merchant backwards (e.g. live → … → pending shouldn't re-send invites).
  const STAGE_ORDER = ["pending", "invited", "contacted", "negotiating", "agreed", "live"];
  const oldIdx = STAGE_ORDER.indexOf(current.status);
  const newIdx = body.status ? STAGE_ORDER.indexOf(body.status) : -1;
  const movingForward = oldIdx !== -1 && newIdx > oldIdx;

  const enteringInvited = body.status === "invited" && movingForward;
  const enteringAgreed = body.status === "agreed" && movingForward;

  const updates: Record<string, unknown> = {};

  if (body.status !== undefined) {
    updates.status = body.status;
    // Write timestamps on first status transition only
    if (body.status === "invited" && !current.invited_at) {
      updates.invited_at = new Date().toISOString();
    }
    if (body.status === "contacted" && !current.contacted_at) {
      updates.contacted_at = new Date().toISOString();
    }
    if (body.status === "live" && !current.activated_at) {
      updates.activated_at = new Date().toISOString();
    }
  }

  if ("assigned_rep" in body) updates.assigned_rep = body.assigned_rep ?? null;
  if ("commission_percentage" in body) updates.commission_percentage = body.commission_percentage ?? null;
  if (body.readiness_checklist !== undefined) updates.readiness_checklist = body.readiness_checklist;

  if (body.note?.trim()) {
    const timestamp = new Date().toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const newLine = `[${timestamp}] ${body.note.trim()}`;
    updates.notes = current.notes ? `${newLine}\n${current.notes}` : newLine;
  }

  const { data: updated, error: dbError } = await serviceClient
    .from("merchants")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (dbError) {
    console.error("[api/admin/merchants/[id]] patch error", dbError);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // Email #2 — fire-and-forget when the merchant first reaches "invited"
  if (enteringInvited) {
    sendMerchantInviteSentEmail({
      to: current.email,
      restaurantName: current.name,
      ownerName: current.owner_name ?? undefined,
    }).catch((err) =>
      console.error("[api/admin/merchants/[id]] invite email failed", err)
    );
  }

  // Email #3 — fire-and-forget when the merchant first reaches "agreed"
  if (enteringAgreed) {
    sendMerchantAgreementEmail({
      to: current.email,
      restaurantName: current.name,
      ownerName: current.owner_name ?? undefined,
    }).catch((err) =>
      console.error("[api/admin/merchants/[id]] agreement email failed", err)
    );
  }

  return NextResponse.json({ merchant: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, serviceClient } = await getAdminServiceClient();
  if (error || !serviceClient) return NextResponse.json({ error }, { status });

  // Load merchant to get the Hyperzod link
  const { data: merchant } = await serviceClient
    .from("merchants")
    .select("id, hyperzod_merchant_id")
    .eq("id", id)
    .single();

  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  // Delete from Hyperzod first — if that fails, abort so we never orphan a record
  if (merchant.hyperzod_merchant_id) {
    const result = await deleteHyperzodMerchant(merchant.hyperzod_merchant_id);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: "hyperzod_failed",
          message: "Could not delete the merchant on Hyperzod. Nothing was removed. Please try again.",
        },
        { status: 502 }
      );
    }
  }

  // Then remove from HalalMe
  const { error: deleteError } = await serviceClient
    .from("merchants")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("[api/admin/merchants/[id]] delete error", deleteError);
    return NextResponse.json(
      {
        error: "db_error",
        message: "Removed from Hyperzod but failed to delete from HalalMe. Please refresh and retry.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
