import { supabase } from "./supabase";
import type { CommissionAnswers } from "@/lib/merchantStages";

// Mirrors the server limits in /api/merchant/documents — kept here so the client
// can reject a bad file before uploading it.
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_UPLOAD_FORMATS = ["pdf", "jpg", "jpeg", "png", "webp"];

// Hand-typed (mirrors the admin detail page convention; not from generated types).
export interface MerchantRecord {
  id: string;
  user_id: string | null;
  name: string;
  owner_name: string | null;
  email: string;
  business_email: string | null;
  phone: string;
  address: string | null;
  city: string | null;
  post_code: string | null;
  country: string;
  status: string;
  assigned_rep: string | null;
  commission_percentage: number | null;
  hyperzod_merchant_id: string | null;
  created_at: string;
}

export interface MerchantDocument {
  id: string;
  doc_type: string;
  status: "uploaded" | "under_review" | "approved" | "rejected";
  rejection_reason: string | null;
  expires_at: string | null;
  file_name: string | null;
  format: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
}

export type MerchantContactUpdate = Partial<{
  phone: string;
  address: string;
  city: string;
  post_code: string;
  business_email: string;
}>;

/** The commission record (Phase 1). Null until the merchant submits the review. */
export interface MerchantCommission {
  merchant_id: string;
  qualification_score: number | null;
  score_breakdown: { label: string; points: number }[] | null;
  recommended_commission: number | null;
  lane: "auto" | "review" | null;
  requested_commission: number | null;
  review_reason: string | null;
  review_status: "none" | "pending" | "approved" | "rejected" | "countered";
  countered_commission: number | null;
  final_commission: number | null;
  accepted_at: string | null;
  contract_signed_at: string | null;
}

export const merchantService = {
  /** The merchant record owned by the signed-in user (null if they aren't a merchant). */
  async getMyMerchant(): Promise<MerchantRecord | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("merchants")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) throw new Error(error.message);
    return (data?.[0] as MerchantRecord) ?? null;
  },

  /** Documents for a merchant the caller owns (enforced by RLS). */
  async getMyDocuments(merchantId: string): Promise<MerchantDocument[]> {
    const { data, error } = await supabase
      .from("merchant_documents")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("uploaded_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data as MerchantDocument[]) ?? [];
  },

  /** Upload (or replace) a verification document of a given type. */
  async uploadDocument(
    file: File,
    docType: string,
    expiresAt?: string,
  ): Promise<MerchantDocument> {
    // Validate in the browser first — gives an instant, friendly error and avoids
    // a wasted upload. (A body over 10 MB is also truncated in transit, which would
    // otherwise surface as a confusing generic failure.)
    if (file.size > MAX_UPLOAD_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(`That file is ${mb} MB — the limit is 10 MB. Please upload a smaller file.`);
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_UPLOAD_FORMATS.includes(ext)) {
      throw new Error("Unsupported file type. Please upload a PDF, JPG, PNG or WEBP.");
    }

    const form = new FormData();
    form.append("file", file);
    form.append("doc_type", docType);
    if (expiresAt) form.append("expires_at", expiresAt);

    const res = await fetch("/api/merchant/documents", { method: "POST", body: form });
    const json = await res.json() as { document?: MerchantDocument; error?: string };
    if (!res.ok || !json.document) {
      // 413 specifically means the body was rejected/truncated for size.
      if (res.status === 413) {
        throw new Error("That file is too large — the limit is 10 MB. Please upload a smaller file.");
      }
      throw new Error(json.error ?? "Upload failed.");
    }
    return json.document;
  },

  /** Get a short-lived signed URL to view one of the caller's own documents. */
  async getDocumentUrl(docId: string): Promise<string> {
    const res = await fetch(`/api/merchant/documents/${docId}/url`);
    const json = await res.json() as { url?: string; error?: string };
    if (!res.ok || !json.url) throw new Error(json.error ?? "Could not open document.");
    return json.url;
  },

  /** Send a support request that carries merchant context to the support inbox. */
  async sendSupport(subject: string, message: string): Promise<void> {
    const res = await fetch("/api/merchant/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    const json = await res.json() as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) throw new Error(json.error ?? "Could not send your message.");
  },

  /** Update editable contact fields via the server (column allowlist, service role). */
  async updateMyContactInfo(update: MerchantContactUpdate): Promise<MerchantRecord> {
    const res = await fetch("/api/merchant/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    const json = await res.json() as { merchant?: MerchantRecord; error?: string };
    if (!res.ok || !json.merchant) {
      throw new Error(json.error ?? "Could not save changes.");
    }
    return json.merchant;
  },

  // ── Commission review (Phase 1) ────────────────────────────────────────────

  /** The caller's commission record, or null before they've started the review. */
  async getMyCommission(): Promise<MerchantCommission | null> {
    const res = await fetch("/api/merchant/commission");
    const json = await res.json() as { commission?: MerchantCommission | null; error?: string };
    if (!res.ok) throw new Error(json.error ?? "Could not load your commission.");
    return json.commission ?? null;
  },

  /** Submit the Section A answers — the server scores them and returns the result. */
  async submitCommission(answers: CommissionAnswers): Promise<MerchantCommission> {
    return commissionAction({ action: "submit", answers });
  },

  /** Accept the recommended rate (auto lane) or an admin counter-offer. */
  async acceptCommission(): Promise<MerchantCommission> {
    return commissionAction({ action: "accept" });
  },

  /** Ask for a human review of the rate (does not advance the stage). */
  async requestCommissionReview(
    reason: string,
    requestedCommission?: number,
  ): Promise<MerchantCommission> {
    return commissionAction({ action: "request_review", reason, requested_commission: requestedCommission });
  },

  /** Record the Agreed-stage signature (tick + timestamp). Admin reviews → Live. */
  async signContract(): Promise<MerchantCommission> {
    return commissionAction({ action: "sign_contract" });
  },
};

async function commissionAction(payload: Record<string, unknown>): Promise<MerchantCommission> {
  const res = await fetch("/api/merchant/commission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json() as { commission?: MerchantCommission; error?: string };
  if (!res.ok || !json.commission) throw new Error(json.error ?? "Something went wrong.");
  return json.commission;
}
