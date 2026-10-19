// Vendor onboarding rules and the labels for every marketplace status.
// Shared by the vendor portal and the admin screens so both describe a vendor,
// product or order in the same words. Mirrors the role merchantStages.ts plays
// for restaurants.

import type {
  BusinessType,
  OrderStatus,
  PayoutStatus,
  ProductStatus,
  Promotion,
  PromotionState,
  Vendor,
  VendorDocType,
  VendorStatus,
} from "@/types/marketplaceVendor";

export type Tone = "green" | "amber" | "red" | "gray" | "blue" | "purple";

// ── Categories ───────────────────────────────────────────────────────────────
// Same handles as the storefront categories in marketplaceMockData.

export const VENDOR_CATEGORIES: { handle: string; title: string }[] = [
  { handle: "modest-fashion", title: "Modest Fashion" },
  { handle: "prayer-worship", title: "Prayer & Worship" },
  { handle: "books-learning", title: "Books & Learning" },
  { handle: "beauty-skincare", title: "Beauty & Skincare" },
  { handle: "kids-family", title: "Kids & Family" },
  { handle: "food-pantry", title: "Food & Pantry" },
  { handle: "daily-essentials", title: "Daily Essentials" },
  { handle: "gifts-occasions", title: "Gifts & Occasions" },
];

export function categoryTitle(handle: string): string {
  return VENDOR_CATEGORIES.find((c) => c.handle === handle)?.title ?? handle;
}

export const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "sole_trader", label: "Sole trader" },
  { value: "limited_company", label: "Limited company" },
  { value: "partnership", label: "Partnership" },
  { value: "charity", label: "Charity or social enterprise" },
];

export const COURIERS = ["Royal Mail", "Evri", "DPD", "DHL", "Parcelforce", "Yodel", "UPS"];

// ── Documents ────────────────────────────────────────────────────────────────

export interface VendorDocDef {
  type: VendorDocType;
  label: string;
  hint: string;
  required: boolean;
}

export const VENDOR_DOC_TYPES: VendorDocDef[] = [
  {
    type: "proof_of_identity",
    label: "Proof of identity",
    hint: "Passport or driving licence of the business owner.",
    required: true,
  },
  {
    type: "business_registration",
    label: "Business registration",
    hint: "Companies House certificate, or HMRC self-assessment letter for sole traders.",
    required: true,
  },
  {
    type: "proof_of_address",
    label: "Proof of business address",
    hint: "Utility bill or bank statement from the last 3 months.",
    required: true,
  },
  {
    type: "halal_certificate",
    label: "Halal certificate",
    hint: "Needed if you sell food, supplements or cosmetics.",
    required: false,
  },
  {
    type: "liability_insurance",
    label: "Product liability insurance",
    hint: "Recommended for all sellers.",
    required: false,
  },
];

export const REQUIRED_VENDOR_DOCS = VENDOR_DOC_TYPES.filter((d) => d.required).map((d) => d.type);

export function docLabel(type: VendorDocType): string {
  return VENDOR_DOC_TYPES.find((d) => d.type === type)?.label ?? type;
}

// ── Onboarding steps ─────────────────────────────────────────────────────────

export type OnboardingStepKey = "business" | "verification" | "store" | "categories" | "delivery" | "payout" | "review";

export interface OnboardingStep {
  key: OnboardingStepKey;
  label: string;
  description: string;
  /** Empty when the step is complete, otherwise what is still missing. */
  missing: (vendor: Vendor) => string[];
}

const need = (ok: boolean, message: string) => (ok ? [] : [message]);

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    key: "business",
    label: "Business details",
    description: "Who you are and where you trade from.",
    missing: (v) => [
      ...need(v.business.legalName.trim() !== "", "Legal business name"),
      ...need(v.business.tradingName.trim() !== "", "Trading name"),
      ...need(v.business.address.trim() !== "" && v.business.city.trim() !== "" && v.business.postCode.trim() !== "", "Business address"),
      ...need(v.business.type !== "limited_company" || v.business.companyNumber.trim() !== "", "Company number"),
      ...need(v.owner.name.trim() !== "" && v.owner.email.trim() !== "" && v.owner.phone.trim() !== "", "Owner contact details"),
    ],
  },
  {
    key: "verification",
    label: "Verification",
    description: "Documents that prove your business is real.",
    missing: (v) =>
      VENDOR_DOC_TYPES.filter((d) => d.required)
        .filter((d) => {
          const doc = v.documents.find((x) => x.type === d.type);
          return !doc || doc.status === "rejected";
        })
        .map((d) => d.label),
  },
  {
    key: "store",
    label: "Store profile",
    description: "How your shop looks to customers.",
    missing: (v) => [
      ...need(v.store.name.trim() !== "", "Store name"),
      ...need(v.store.description.trim().length >= 40, "Store description (at least 40 characters)"),
      ...need(v.store.supportEmail.trim() !== "", "Customer support email"),
    ],
  },
  {
    key: "categories",
    label: "Categories",
    description: "What you plan to sell.",
    missing: (v) => need(v.categories.length > 0, "At least one category"),
  },
  {
    key: "delivery",
    label: "Delivery & returns",
    description: "How orders reach customers and come back.",
    missing: (v) => [
      ...need(v.delivery.couriers.length > 0, "At least one courier"),
      ...need(v.delivery.dispatchDays > 0, "Dispatch time"),
      ...need(v.delivery.returnsAddress.trim() !== "", "Returns address"),
    ],
  },
  {
    key: "payout",
    label: "Payout details",
    description: "Where we send your earnings.",
    missing: (v) => [
      ...need(v.payout.accountName.trim() !== "", "Account name"),
      ...need(/^\d{2}-?\d{2}-?\d{2}$/.test(v.payout.sortCode.trim()), "Valid sort code"),
      ...need(/^\d{8}$/.test(v.payout.accountNumber.trim()), "8-digit account number"),
    ],
  },
  {
    key: "review",
    label: "Review & submit",
    description: "Check everything and send it to us.",
    missing: () => [],
  },
];

/** Steps the vendor fills in, i.e. everything except the final review. */
export const DATA_STEPS = ONBOARDING_STEPS.filter((s) => s.key !== "review");

export function onboardingProgress(vendor: Vendor) {
  const steps = DATA_STEPS.map((step) => ({ step, missing: step.missing(vendor) }));
  const done = steps.filter((s) => s.missing.length === 0).length;
  return {
    steps,
    done,
    total: steps.length,
    percent: Math.round((done / steps.length) * 100),
    readyToSubmit: done === steps.length,
  };
}

export function requiredDocsApproved(vendor: Vendor): boolean {
  return REQUIRED_VENDOR_DOCS.every((type) => vendor.documents.find((d) => d.type === type)?.status === "approved");
}

// ── Status labels ────────────────────────────────────────────────────────────

export const VENDOR_STATUS: Record<VendorStatus, { label: string; tone: Tone }> = {
  draft: { label: "Setting up", tone: "gray" },
  submitted: { label: "Awaiting review", tone: "amber" },
  changes_requested: { label: "Changes requested", tone: "purple" },
  rejected: { label: "Rejected", tone: "red" },
  active: { label: "Active", tone: "green" },
  suspended: { label: "Suspended", tone: "red" },
};

export const PRODUCT_STATUS: Record<ProductStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "gray" },
  pending_review: { label: "In review", tone: "amber" },
  changes_requested: { label: "Changes requested", tone: "purple" },
  rejected: { label: "Rejected", tone: "red" },
  live: { label: "Live", tone: "green" },
  paused: { label: "Paused", tone: "gray" },
  unpublished: { label: "Unpublished", tone: "red" },
};

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "amber" },
  accepted: { label: "Accepted", tone: "blue" },
  packed: { label: "Packed", tone: "blue" },
  shipped: { label: "Shipped", tone: "purple" },
  delivered: { label: "Delivered", tone: "green" },
  cancelled: { label: "Cancelled", tone: "gray" },
  refunded: { label: "Refunded", tone: "red" },
};

/** The happy-path order of fulfilment, used for the progress stepper. */
export const FULFILMENT_FLOW: OrderStatus[] = ["new", "accepted", "packed", "shipped", "delivered"];

/** Orders the vendor still has to act on. */
export const OPEN_ORDER_STATUSES: OrderStatus[] = ["new", "accepted", "packed"];

export const PAYOUT_STATUS: Record<PayoutStatus, { label: string; tone: Tone }> = {
  processing: { label: "Processing", tone: "amber" },
  paid: { label: "Paid", tone: "green" },
  failed: { label: "Failed", tone: "red" },
};

export const PROMOTION_STATE: Record<PromotionState, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "green" },
  scheduled: { label: "Scheduled", tone: "blue" },
  expired: { label: "Expired", tone: "gray" },
  paused: { label: "Paused", tone: "gray" },
  used_up: { label: "Used up", tone: "gray" },
};

export function promotionState(promo: Promotion, now = Date.now()): PromotionState {
  if (promo.paused) return "paused";
  if (promo.usageLimit !== null && promo.used >= promo.usageLimit) return "used_up";
  if (new Date(promo.startsAt).getTime() > now) return "scheduled";
  if (promo.endsAt && new Date(promo.endsAt).getTime() < now) return "expired";
  return "active";
}

// ── Formatting ───────────────────────────────────────────────────────────────

/** Pounds and pence. The admin `fmtMoney` rounds to whole pounds, which is wrong for order lines. */
export function money(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
