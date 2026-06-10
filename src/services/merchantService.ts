import { supabase } from "./supabase";

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
    const form = new FormData();
    form.append("file", file);
    form.append("doc_type", docType);
    if (expiresAt) form.append("expires_at", expiresAt);

    const res = await fetch("/api/merchant/documents", { method: "POST", body: form });
    const json = await res.json() as { document?: MerchantDocument; error?: string };
    if (!res.ok || !json.document) {
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
};
