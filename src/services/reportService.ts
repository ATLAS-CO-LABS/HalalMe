import { supabase } from "./supabase";

// User-facing content reporting. Inserts a row into content_reports as the
// logged-in user (RLS enforces reporter_id = auth.uid()). The unique
// (content_type, content_id, reporter_id) constraint means a second report of the
// same item by the same person is reported back as "already reported".

export type ReportContentType = "post" | "comment" | "recipe";
export type ReportReason = "spam" | "offensive" | "not_halal" | "misinformation" | "harassment" | "other";

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam or scam" },
  { value: "offensive", label: "Offensive or abusive" },
  { value: "not_halal", label: "Not halal / inappropriate" },
  { value: "misinformation", label: "False information" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "other", label: "Something else" },
];

export type SubmitReportResult = "ok" | "duplicate" | "unauthenticated" | "error";

export async function submitReport(input: {
  contentType: ReportContentType;
  contentId: string;
  reason: ReportReason;
  details?: string;
}): Promise<SubmitReportResult> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return "unauthenticated";

  const { error } = await supabase.from("content_reports").insert({
    content_type: input.contentType,
    content_id: input.contentId,
    reporter_id: userId,
    reason: input.reason,
    details: input.details?.trim() || null,
  });

  if (error) {
    // 23505 = unique violation → this user already reported this item.
    if (error.code === "23505") return "duplicate";
    console.error("[reportService] submit error", error);
    return "error";
  }
  return "ok";
}
