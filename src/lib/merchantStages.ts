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
  | "commission" // "negotiation" is a bit opaque for merchants, so we use "commission" here to indicate what we're actually doing in this stage.
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
  /** True when the merchant was rejected - render a graceful "closed" view instead. */
  isClosed: boolean;
}

const JOURNEY: { key: MerchantStageKey; label: string }[] = [
  { key: "registered", label: "Registered" },
  { key: "verification", label: "Verification" },
  { key: "invited", label: "Invited" },
  { key: "commission", label: "Commission" },
  { key: "agreed", label: "Agreed" },
  { key: "live", label: "Live" },
];

// Internal status → index into JOURNEY of the merchant's current stage.
function currentIndexFor(status: string): number {
  switch (status) {
    case "pending":
      return 1; // sitting in Verification
    case "invited":
      return 2;
    case "contacted":
      return 3;
    case "negotiating":
      return 3;
    case "commission":
      return 3;
    case "agreed":
      return 4;
    case "live":
      return 5;
    default:
      return 1;
  }
}

function ctaFor(index: number, docsApproved: boolean): string {
  switch (index) {
    case 1:
      return docsApproved
        ? "Your documents are verified - we'll send your dashboard invite shortly."
        : "Upload your verification documents below to continue onboarding.";
    case 2:
      return "Check your email for the Hyperzod dashboard invite (don't forget your spam folder).";
    case 3:
      return "Our team is in touch about commission - we'll be in contact shortly.";
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
export function getMerchantJourney(
  status: string,
  docsApproved: boolean,
): MerchantJourney {
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
  /**
   * Which onboarding stage this document belongs to. Drives where its upload
   * control appears: verification docs in the Verification section, evidence in
   * the Commission review, the signed contract in the Agreed stage.
   */
  group: "verification" | "commission" | "agreed";
}

export const MERCHANT_DOC_TYPES: DocTypeDef[] = [
  {
    key: "food_hygiene",
    label: "Food Hygiene Rating",
    hint: "Your FSA food hygiene rating or local-authority registration.",
    required: true,
    hasExpiry: true,
    group: "verification",
  },
  {
    key: "halal_certificate",
    label: "Halal Certificate",
    hint: "HMC, HFA or supplier halal certification.",
    required: true,
    hasExpiry: true,
    group: "verification",
  },
  {
    key: "food_business_reg",
    label: "Food Business Registration",
    hint: "Proof of registration with your local council (optional).",
    required: false,
    hasExpiry: false,
    group: "verification",
  },
  {
    key: "public_liability",
    label: "Public Liability Insurance",
    hint: "Current public liability insurance certificate (optional).",
    required: false,
    hasExpiry: true,
    group: "verification",
  },
  {
    key: "business_proof",
    label: "Proof of Business",
    hint: "Companies House record or proof of ownership.",
    required: true,
    hasExpiry: false,
    group: "verification",
  },
  {
    key: "owner_id",
    label: "Owner ID",
    hint: "Photo ID of the business owner.",
    required: true,
    hasExpiry: false,
    group: "verification",
  },
  // ── Commission stage: Price-Promise evidence ────────────────────────────────
  {
    key: "competitor_evidence",
    label: "Competitor Evidence",
    hint: "Proof of a cheaper rate elsewhere (UberEats, Deliveroo, JustEat) - contract or statement.",
    required: false,
    hasExpiry: false,
    group: "commission",
  },
  // ── Agreed stage: the signed contract ───────────────────────────────────────
  {
    key: "signed_agreement",
    label: "Signed Agreement",
    hint: "Your countersigned HalalMe merchant agreement.",
    required: false,
    hasExpiry: false,
    group: "agreed",
  },
];

/** Verification documents only (the Verification-stage upload list). */
export const VERIFICATION_DOC_TYPES = MERCHANT_DOC_TYPES.filter(
  (d) => d.group === "verification",
);

export const REQUIRED_DOC_KEYS = MERCHANT_DOC_TYPES.filter(
  (d) => d.required,
).map((d) => d.key);

/** True when every required doc type has an approved document. */
export function areRequiredDocsApproved(
  docs: { doc_type: string; status: string }[],
): boolean {
  return REQUIRED_DOC_KEYS.every((key) =>
    docs.some((d) => d.doc_type === key && d.status === "approved"),
  );
}

// ── Commission Qualification Engine (Phase 1) ────────────────────────────────
// Deterministic, rules-based. The merchant taps answers; we add up points; the
// total lands on a FIXED rate. No free-text, no AI deciding money. Every output
// is explainable from the breakdown. This is the single source of truth for the
// scoring - the server recomputes it on submit so the client can never inflate.
//
// Policy (locked):
//   Opening 30% · standard range 27.5–25% · protected threshold 22%
//   Auto lane:   25 / 27.5 / 30%  → merchant accepts → straight to Agreed
//   Review lane: below 25%, score ≥ 36 ("Review Required"), Q4 sub-22 trigger,
//                or merchant taps Request Review → admin decides

export const COMMISSION_OPENING = 30;
export const COMMISSION_PROTECTED_THRESHOLD = 22;

export type CommissionLane = "auto" | "review";

/** The eight Section A answer keys + their allowed values. */
export interface CommissionAnswers {
  store_count: "1" | "2" | "3_5" | "6plus";
  monthly_volume_band: "lt200" | "200_500" | "500_1000" | "gt1000";
  on_other_platform: "no" | "yes";
  existing_commission_band: "30plus" | "25_29" | "22_2499" | "lt22";
  exclusivity: "no" | "yes";
  launch_ready_7d: "no" | "yes";
  menu_ready: "no" | "yes";
  referral_source: "organic" | "existing_merchant" | "strategic";
}

export type CommissionAnswerKey = keyof CommissionAnswers;

export interface CommissionOption {
  value: string;
  label: string;
  /** Points this answer adds. Omitted for Q4, which is a routing trigger. */
  points?: number;
}

export interface CommissionQuestion {
  key: CommissionAnswerKey;
  prompt: string;
  hint?: string;
  /** Short label used in the admin score breakdown, e.g. "Multi-site operator". */
  creditLabel: string;
  options: CommissionOption[];
}

export const COMMISSION_QUESTIONS: CommissionQuestion[] = [
  {
    key: "store_count",
    prompt: "How many operating locations do you currently run?",
    creditLabel: "Multi-site operator",
    options: [
      { value: "1", label: "1", points: 0 },
      { value: "2", label: "2", points: 8 },
      { value: "3_5", label: "3–5", points: 12 },
      { value: "6plus", label: "6+", points: 15 },
    ],
  },
  {
    key: "on_other_platform",
    prompt: "Do you currently operate on another delivery platform?",
    creditLabel: "Already operational",
    options: [
      { value: "no", label: "No", points: 0 },
      { value: "yes", label: "Yes", points: 4 },
    ],
  },
  {
    key: "monthly_volume_band",
    prompt: "Approximately how many delivery orders a month, across all platforms?",
    hint: "A rough estimate is fine.",
    creditLabel: "Existing delivery demand",
    options: [
      { value: "lt200", label: "Under 200", points: 0 },
      { value: "200_500", label: "200–500", points: 4 },
      { value: "500_1000", label: "500–1,000", points: 8 },
      { value: "gt1000", label: "1,000+", points: 12 },
    ],
  },
  {
    // Q4 - special: a ROUTING TRIGGER, not points. Claiming a sharp rate elsewhere
    // sends the case to review (Price-Promise) regardless of the total score.
    key: "existing_commission_band",
    prompt: "What commission do you currently pay elsewhere?",
    hint: "If it's lower than ours, our Price Promise may match it with proof.",
    creditLabel: "Existing commercial terms",
    options: [
      { value: "30plus", label: "30% or more", points: 0 },
      { value: "25_29", label: "25–29%", points: 3 },
      { value: "22_2499", label: "22–24.99%" },
      { value: "lt22", label: "Under 22%" },
    ],
  },
  {
    key: "exclusivity",
    prompt: "Would you consider making HalalMe your exclusive delivery partner?",
    creditLabel: "Exclusivity",
    options: [
      { value: "no", label: "No", points: 0 },
      { value: "yes", label: "Yes", points: 8 },
    ],
  },
  {
    key: "launch_ready_7d",
    prompt: "Can you go live within 7 days?",
    creditLabel: "Launch ready",
    options: [
      { value: "no", label: "No", points: 0 },
      { value: "yes", label: "Yes", points: 5 },
    ],
  },
  {
    key: "menu_ready",
    prompt: "Is your menu fully ready?",
    creditLabel: "Menu complete",
    options: [
      { value: "no", label: "No", points: 0 },
      { value: "yes", label: "Yes", points: 4 },
    ],
  },
  {
    key: "referral_source",
    prompt: "How did you hear about HalalMe?",
    creditLabel: "Referral source",
    options: [
      { value: "organic", label: "Found you myself", points: 0 },
      { value: "existing_merchant", label: "Another HalalMe merchant", points: 6 },
      { value: "strategic", label: "A strategic referral / partner", points: 10 },
    ],
  },
];

export interface CommissionResult {
  score: number;
  /** Non-zero contributions, for the "Why?" panel. */
  breakdown: { label: string; points: number }[];
  /** Score-based rate: 30 | 27.5 | 25, or null when "Review Required" (score ≥ 36). */
  recommended: number | null;
  lane: CommissionLane;
  /** True when something forces a human review regardless of the rate. */
  forcedReview: boolean;
  /** Human-readable reason a review was forced (admin/label use). */
  reviewTrigger: string | null;
}

/** Map a total score to the fixed recommended commission. */
export function recommendFromScore(score: number): number | null {
  if (score >= 36) return null;       // Review Required
  if (score >= 21) return 25;         // 21–35
  if (score >= 11) return 27.5;       // 11–20
  return 30;                          // 0–10
}

/**
 * The whole engine in one pure function. Recompute on the server on submit so
 * the client can never inflate the score.
 */
export function evaluateCommission(answers: CommissionAnswers): CommissionResult {
  let score = 0;
  const breakdown: { label: string; points: number }[] = [];

  for (const q of COMMISSION_QUESTIONS) {
    const value = answers[q.key];
    const opt = q.options.find((o) => o.value === value);
    if (opt?.points) {
      score += opt.points;
      breakdown.push({ label: q.creditLabel, points: opt.points });
    }
  }

  // Q4 routing triggers - independent of points.
  let forcedReview = false;
  let reviewTrigger: string | null = null;
  if (answers.existing_commission_band === "lt22") {
    forcedReview = true;
    reviewTrigger = "Claims sub-22% elsewhere - Price-Promise review";
  } else if (answers.existing_commission_band === "22_2499") {
    forcedReview = true;
    reviewTrigger = "Claims 22–24.99% elsewhere - commercial review";
  }

  const recommended = recommendFromScore(score);
  if (recommended === null) {
    forcedReview = true;
    reviewTrigger = reviewTrigger ?? "High qualification score - review required";
  }

  return {
    score,
    breakdown,
    recommended,
    lane: forcedReview ? "review" : "auto",
    forcedReview,
    reviewTrigger,
  };
}
