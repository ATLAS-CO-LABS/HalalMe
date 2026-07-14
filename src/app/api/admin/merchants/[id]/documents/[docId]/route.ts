import { NextRequest, NextResponse } from "next/server";
import {
  sendMerchantDocsApprovedEmail,
  sendMerchantDocsActionNeededEmail,
} from "@/services/emailService";
import {
  MERCHANT_DOC_TYPES,
  REQUIRED_DOC_KEYS,
} from "@/lib/merchantStages";
import { requireAdmin as requireAdminAccess, type AccessLevel } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";
import * as Sentry from "@sentry/nextjs";

async function requireAdmin(level: AccessLevel) {
  const gate = await requireAdminAccess("merchants", level);
  if (!gate.ok) return { error: gate.error, status: gate.status, user: null, serviceClient: null, gate: null };
  return { error: null, status: 200, user: { id: gate.userId }, serviceClient: gate.serviceClient, gate };
}

function docLabel(docType: string): string {
  return MERCHANT_DOC_TYPES.find((d) => d.key === docType)?.label ?? "document";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  const { id, docId } = await params;
  const { error, status, user, serviceClient, gate } = await requireAdmin("manage");
  if (error || !serviceClient || !user) return NextResponse.json({ error }, { status });

  const body = await req.json() as { action?: "approve" | "reject"; reason?: string };
  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  if (body.action === "reject" && !body.reason?.trim()) {
    return NextResponse.json({ error: "A reason is required to reject" }, { status: 400 });
  }

  // Load the document and confirm it belongs to this merchant.
  const { data: doc, error: docErr } = await serviceClient
    .from("merchant_documents")
    .select("id, doc_type, merchant_id")
    .eq("id", docId)
    .eq("merchant_id", id)
    .maybeSingle();

  if (docErr || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const newStatus = body.action === "approve" ? "approved" : "rejected";

  const { data: updated, error: updErr } = await serviceClient
    .from("merchant_documents")
    .update({
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      rejection_reason: body.action === "reject" ? body.reason!.trim() : null,
    })
    .eq("id", docId)
    .select("*")
    .single();

  if (updErr) {
    console.error("[admin/documents] update error", updErr);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  if (gate) {
    logAdminAction(gate, {
      action: body.action === "approve" ? "merchant_document.approve" : "merchant_document.reject",
      module: "merchants", targetType: "merchant", targetId: id,
      summary: `${body.action === "approve" ? "Approved" : "Rejected"} ${docLabel(doc.doc_type)}`,
      metadata: { doc_id: docId, doc_type: doc.doc_type, reason: body.action === "reject" ? body.reason?.trim() : null },
    });
  }

  // ── Notify the merchant (fire-and-forget) ──────────────────────────────────
  const { data: merchant } = await serviceClient
    .from("merchants")
    .select("name, owner_name, email, business_email")
    .eq("id", id)
    .single();

  if (merchant) {
    const to = merchant.business_email ?? merchant.email;

    if (body.action === "reject") {
      sendMerchantDocsActionNeededEmail({
        to,
        restaurantName: merchant.name,
        ownerName: merchant.owner_name ?? undefined,
        documentLabel: docLabel(doc.doc_type),
        reason: body.reason!.trim(),
      }).catch((err) => {
        console.error("[admin/documents] action-needed email failed", err);
        Sentry.captureException(err);
      });
    } else {
      // Approved — if this completes all required docs, send the verified email.
      const { data: allDocs } = await serviceClient
        .from("merchant_documents")
        .select("doc_type, status")
        .eq("merchant_id", id);

      const allRequiredApproved = REQUIRED_DOC_KEYS.every((key) =>
        (allDocs ?? []).some((d) => d.doc_type === key && d.status === "approved"),
      );

      if (allRequiredApproved) {
        sendMerchantDocsApprovedEmail({
          to,
          restaurantName: merchant.name,
          ownerName: merchant.owner_name ?? undefined,
        }).catch((err) => {
          console.error("[admin/documents] approved email failed", err);
          Sentry.captureException(err);
        });
      }
    }
  }

  return NextResponse.json({ document: updated });
}
