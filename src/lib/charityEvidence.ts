// Evidence-led labels for charity verification_level (0-3), matching the
// scoring already defined in supabase/migrations/017_charity_verification.sql.
// Per HME-WEB-DEC-001 (Sami, 9 Aug 2026): no blanket "verified" badge —
// show what was actually reviewed instead.

export const VERIFICATION_LEVEL_LABEL: Record<number, string> = {
  0: "Registration pending review",
  1: "Documents submitted",
  2: "Reviewed by HalalMe",
  3: "Externally verified",
};

export function verificationLevelLabel(level: number): string {
  return VERIFICATION_LEVEL_LABEL[level] ?? "Registration pending review";
}

export function formatReviewDate(isoDate: string | null): string | null {
  if (!isoDate) return null;
  return new Date(isoDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
