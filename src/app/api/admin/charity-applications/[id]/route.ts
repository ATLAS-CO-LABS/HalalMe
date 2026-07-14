import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

type DocumentRef = { type?: string; path?: string; name?: string };

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/charity-applications/[id]
// Full application detail + short-lived signed URLs for each uploaded document
// (the charity-documents bucket is private — signed URLs only).
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("rewards", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { data: application, error } = await serviceClient
    .from("charity_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  // Applicant info for the review panel.
  const { data: applicant } = await serviceClient
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("id", application.applicant_user_id)
    .maybeSingle();

  // Reviewer name, if already reviewed.
  let reviewerName: string | null = null;
  if (application.reviewed_by) {
    const { data: r } = await serviceClient
      .from("profiles")
      .select("full_name")
      .eq("id", application.reviewed_by)
      .maybeSingle();
    reviewerName = r?.full_name ?? null;
  }

  // Sign each uploaded document for inline review (5 min).
  const docs: DocumentRef[] = Array.isArray(application.document_paths)
    ? (application.document_paths as DocumentRef[])
    : [];
  const documents = await Promise.all(
    docs.map(async (d) => {
      let url: string | null = null;
      if (d.path) {
        // Stored path may include the bucket prefix — strip it for the SDK.
        const objectPath = d.path.replace(/^charity-documents\//, "");
        const { data: signed } = await serviceClient.storage
          .from("charity-documents")
          .createSignedUrl(objectPath, 300);
        url = signed?.signedUrl ?? null;
      }
      return { type: d.type ?? "document", name: d.name ?? d.path ?? "Document", url };
    }),
  );

  // Manage gate for action buttons.
  const canManage = gate.access === "manage";

  return NextResponse.json({ application, applicant: applicant ?? null, reviewerName, documents, canManage });
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/charity-applications/[id]
//   { action: "approve", verification_level?: 1|2 }
//   { action: "reject", notes: string }       (notes required)
//   { action: "request_info", notes?: string }
//
// Approve creates a charities row from the application, links it back, and writes
// a charity_verification_log entry. Reject / request_info just update status.
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("rewards", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  let body: { action?: string; notes?: string; verification_level?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action;
  if (!action || !["approve", "reject", "request_info"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { data: application, error: appErr } = await serviceClient
    .from("charity_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (appErr || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (application.status === "approved") {
    return NextResponse.json({ error: "This application is already approved" }, { status: 409 });
  }

  const now = new Date().toISOString();

  // ── Reject ─────────────────────────────────────────────────────────────────
  if (action === "reject") {
    const notes = body.notes?.trim();
    if (!notes) {
      return NextResponse.json({ error: "A reason is required to reject" }, { status: 400 });
    }
    const { error } = await serviceClient
      .from("charity_applications")
      .update({ status: "rejected", reviewer_notes: notes, reviewed_by: gate.userId, reviewed_at: now })
      .eq("id", id);
    if (error) {
      console.error("[charity-applications PATCH] reject error", error);
      return NextResponse.json({ error: "Failed to reject application" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  // ── Request more info ────────────────────────────────────────────────────────
  if (action === "request_info") {
    const notes = body.notes?.trim() || null;
    const { error } = await serviceClient
      .from("charity_applications")
      .update({ status: "under_review", reviewer_notes: notes, reviewed_by: gate.userId, reviewed_at: now })
      .eq("id", id);
    if (error) {
      console.error("[charity-applications PATCH] request_info error", error);
      return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, status: "under_review" });
  }

  // ── Approve → create the charity row ─────────────────────────────────────────
  const level = body.verification_level === 1 ? 1 : 2; // admin picks 1 (docs) or 2 (verified)
  const slug = slugify(application.display_name) + "-" + id.slice(0, 6);

  const { data: charity, error: charityErr } = await serviceClient
    .from("charities")
    .insert({
      name: application.display_name,
      slug,
      description: application.description,
      category: application.category,
      legal_name: application.legal_name,
      registration_number: application.registration_number,
      country: application.country,
      charity_type: application.charity_type,
      contact_email: application.contact_email,
      contact_phone: application.contact_phone,
      website_url: application.website_url,
      is_zakat_eligible: application.is_zakat_eligible,
      document_paths: application.document_paths ?? [],
      goal_amount: 10000, // sensible default — admin edits in the directory
      verification_status: "approved",
      verification_level: level,
      verification_source: "admin_manual",
      verified_at: now,
      verified_by: gate.userId,
      last_verified_at: now,
      submitted_by: application.applicant_user_id,
      is_active: true,
    })
    .select("id")
    .single();

  if (charityErr || !charity) {
    if (charityErr?.code === "23505") {
      return NextResponse.json(
        { error: "A charity with this registration number already exists for this country" },
        { status: 409 },
      );
    }
    console.error("[charity-applications PATCH] charity insert error", charityErr);
    return NextResponse.json({ error: "Failed to create charity" }, { status: 500 });
  }

  // Link the application to the new charity + mark approved.
  const { error: linkErr } = await serviceClient
    .from("charity_applications")
    .update({
      status: "approved",
      charity_id: charity.id,
      reviewer_notes: body.notes?.trim() || null,
      reviewed_by: gate.userId,
      reviewed_at: now,
      documents_reviewed_at: now,
      documents_reviewed_by: gate.userId,
    })
    .eq("id", id);

  if (linkErr) {
    console.error("[charity-applications PATCH] link error", linkErr);
    return NextResponse.json({ error: "Charity created but failed to update application" }, { status: 500 });
  }

  // Immutable audit entry.
  await serviceClient.from("charity_verification_log").insert({
    charity_id: charity.id,
    application_id: id,
    changed_by: gate.userId,
    change_type: "level_upgraded",
    previous_level: 0,
    new_level: level,
    new_status: "approved",
    source: "admin_manual",
    notes: `Approved from application at level ${level}`,
  });

  return NextResponse.json({ ok: true, status: "approved", charity_id: charity.id });
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
