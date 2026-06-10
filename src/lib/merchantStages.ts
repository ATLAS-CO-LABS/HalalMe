// Maps internal merchant pipeline state → the friendly journey a merchant sees.
// The merchant never sees ops words ("contacted", "negotiating"). Each stage also
// carries a one-line "what to do next" so the tracker is actionable, not passive.
//
// Internal statuses (DB): pending | invited | contacted | negotiating | agreed | live | rejected
// Visible journey:        Registered → Verification → Invited → Negotiation → Agreed → Live

export type MerchantStageKey =
  | "registered"
  | "verification"
  | "invited"
  | "negotiation"
  | "agreed"
  | "live";

export interface MerchantStage {
  key: MerchantStageKey;
  label: string;
  done: boolean;
  current: boolean;
}

export interface MerchantJourney {
  stages: MerchantStage[];
  /** One-line call to action for the current stage. */
  cta: string;
  /** True when the merchant was rejected — render a graceful "closed" view instead. */
  isClosed: boolean;
}

const JOURNEY: { key: MerchantStageKey; label: string }[] = [
  { key: "registered",   label: "Registered" },
  { key: "verification", label: "Verification" },
  { key: "invited",      label: "Invited" },
  { key: "negotiation",  label: "Negotiation" },
  { key: "agreed",       label: "Agreed" },
  { key: "live",         label: "Live" },
];

// Internal status → index into JOURNEY of the merchant's current stage.
function currentIndexFor(status: string): number {
  switch (status) {
    case "pending":     return 1; // sitting in Verification
    case "invited":     return 2;
    case "contacted":   return 3;
    case "negotiating": return 3;
    case "agreed":      return 4;
    case "live":        return 5;
    default:            return 1;
  }
}

function ctaFor(index: number, docsApproved: boolean): string {
  switch (index) {
    case 1:
      return docsApproved
        ? "Your documents are verified — we'll send your dashboard invite shortly."
        : "Upload your verification documents below to continue onboarding.";
    case 2:
      return "Check your email for the Hyperzod dashboard invite (don't forget your spam folder).";
    case 3:
      return "Our team is in touch about commission — we'll be in contact shortly.";
    case 4:
      return "Final checks are underway. You'll be live on HalalMe very soon.";
    case 5:
      return "You're live! Manage your orders from your Hyperzod dashboard.";
    default:
      return "Upload your verification documents below to continue onboarding.";
  }
}

/**
 * Build the merchant-facing journey from internal status + document state.
 * @param status         merchants.status
 * @param docsApproved   true when every REQUIRED document is approved
 */
export function getMerchantJourney(status: string, docsApproved: boolean): MerchantJourney {
  if (status === "rejected") {
    return {
      isClosed: true,
      cta: "Your application is currently closed. Contact our support team if you'd like to reopen it.",
      stages: JOURNEY.map((s) => ({ ...s, done: false, current: false })),
    };
  }

  const isLive = status === "live";
  const currentIndex = currentIndexFor(status);

  const stages: MerchantStage[] = JOURNEY.map((s, i) => ({
    key: s.key,
    label: s.label,
    done: isLive ? true : i < currentIndex,
    current: !isLive && i === currentIndex,
  }));

  return {
    isClosed: false,
    cta: ctaFor(currentIndex, docsApproved),
    stages,
  };
}

// ── Required documents (UK halal food business) ──────────────────────────────
// Drives both the merchant upload list and the "all required approved" check.

export interface DocTypeDef {
  key: string;
  label: string;
  hint: string;
  required: boolean;
  /** Whether to ask for an expiry date (certs/ratings that lapse). */
  hasExpiry: boolean;
}

export const MERCHANT_DOC_TYPES: DocTypeDef[] = [
  { key: "food_hygiene",      label: "Food Hygiene Rating",        hint: "Your FSA food hygiene rating or local-authority registration.", required: true,  hasExpiry: true  },
  { key: "halal_certificate", label: "Halal Certificate",          hint: "HMC, HFA or supplier halal certification.",                     required: true,  hasExpiry: true  },
  { key: "food_business_reg", label: "Food Business Registration", hint: "Proof of registration with your local council.",                required: true,  hasExpiry: false },
  { key: "public_liability",  label: "Public Liability Insurance", hint: "Current public liability insurance certificate.",               required: true,  hasExpiry: true  },
  { key: "business_proof",    label: "Proof of Business",          hint: "Companies House record or proof of ownership (optional).",      required: false, hasExpiry: false },
  { key: "owner_id",          label: "Owner ID",                   hint: "Photo ID of the business owner (optional).",                    required: false, hasExpiry: false },
];

export const REQUIRED_DOC_KEYS = MERCHANT_DOC_TYPES.filter((d) => d.required).map((d) => d.key);

/** True when every required doc type has an approved document. */
export function areRequiredDocsApproved(
  docs: { doc_type: string; status: string }[],
): boolean {
  return REQUIRED_DOC_KEYS.every((key) =>
    docs.some((d) => d.doc_type === key && d.status === "approved"),
  );
}
