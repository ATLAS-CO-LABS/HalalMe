// Types for the Marketplace vendor portal and its admin screens.
//
// These describe HalalMe's own vendor system. Catalogue and order fields keep
// to what Shopify also models (variants with SKU and stock, order line items,
// fulfilment with tracking) so the later integration is a mapping exercise.

// ── Vendor ───────────────────────────────────────────────────────────────────

export type VendorStatus =
  | "draft" // signed up, onboarding not finished
  | "submitted" // application sent, waiting for review
  | "changes_requested" // reviewed, vendor must fix something and resubmit
  | "rejected" // application closed
  | "active" // approved and selling
  | "suspended"; // was active, switched off by an admin

export type BusinessType = "sole_trader" | "limited_company" | "partnership" | "charity";

export type VendorDocType =
  | "proof_of_identity"
  | "business_registration"
  | "proof_of_address"
  | "halal_certificate"
  | "liability_insurance";

export type VendorDocStatus = "uploaded" | "approved" | "rejected";

export interface VendorDocument {
  type: VendorDocType;
  fileName: string;
  status: VendorDocStatus;
  rejectionReason: string | null;
  uploadedAt: string;
}

export interface VendorBusiness {
  legalName: string;
  tradingName: string;
  type: BusinessType;
  companyNumber: string;
  vatNumber: string;
  address: string;
  city: string;
  postCode: string;
  country: string;
}

export interface VendorOwner {
  name: string;
  email: string;
  phone: string;
}

export interface VendorStore {
  name: string;
  tagline: string;
  description: string;
  logo: string | null; // image URL or data URL
  banner: string | null;
  supportEmail: string;
}

export interface VendorDelivery {
  dispatchDays: number;
  ukRate: number;
  freeOver: number | null;
  couriers: string[];
  returnsDays: number;
  returnsAddress: string;
  returnsPolicy: string;
}

export interface VendorPayoutDetails {
  accountName: string;
  sortCode: string;
  accountNumber: string;
}

export interface VendorNotificationPrefs {
  newOrder: boolean;
  lowStock: boolean;
  productReview: boolean;
  payouts: boolean;
  marketing: boolean;
}

export interface Vendor {
  id: string;
  handle: string;
  status: VendorStatus;
  createdAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
  /** Message from the reviewing admin, shown to the vendor. */
  reviewNote: string | null;
  business: VendorBusiness;
  owner: VendorOwner;
  store: VendorStore;
  categories: string[];
  delivery: VendorDelivery;
  payout: VendorPayoutDetails;
  documents: VendorDocument[];
  /** Per-vendor commission override. Null means "use the marketplace rate". */
  commissionRate: number | null;
  notificationPrefs: VendorNotificationPrefs;
  /** Set once the vendor has dismissed the "you are approved" welcome. */
  welcomeSeen: boolean;
}

/** The editable sections a vendor can save, one per onboarding step. */
export type VendorPatch = Partial<
  Pick<Vendor, "business" | "owner" | "store" | "categories" | "delivery" | "payout" | "notificationPrefs" | "welcomeSeen">
>;

export interface VendorRegistration {
  tradingName: string;
  businessType: BusinessType;
  categories: string[];
  address: string;
  city: string;
  postCode: string;
  ownerName: string;
  email: string;
  phone: string;
}

// ── Products ─────────────────────────────────────────────────────────────────

export type ProductStatus =
  | "draft"
  | "pending_review"
  | "changes_requested"
  | "rejected"
  | "live"
  | "paused" // hidden by the vendor
  | "unpublished"; // hidden by an admin

export interface ProductVariant {
  id: string;
  name: string; // "Default" when the product has no options
  sku: string;
  price: number;
  stock: number;
}

export interface VendorProduct {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  category: string; // category handle
  images: string[];
  compareAtPrice: number | null;
  weightGrams: number;
  lowStockAt: number;
  variants: ProductVariant[];
  status: ProductStatus;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<VendorProduct, "id" | "vendorId" | "status" | "reviewNote" | "createdAt" | "updatedAt">;

// ── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus = "new" | "accepted" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded";

export interface OrderItem {
  productId: string;
  title: string;
  variantName: string | null;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderEvent {
  status: OrderStatus;
  at: string;
  note: string | null;
}

export interface VendorOrder {
  id: string;
  number: string; // "HM-10231"
  vendorId: string;
  placedAt: string;
  status: OrderStatus;
  customer: { name: string; email: string; phone: string };
  shippingAddress: { line1: string; city: string; postCode: string };
  customerNote: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  /** Vendor-funded promotion applied to this order, if any. */
  discount?: number;
  total: number;
  commissionRate: number;
  commissionAmount: number;
  /** What the vendor is paid for this order: total minus commission. */
  vendorNet: number;
  tracking: { courier: string; number: string } | null;
  timeline: OrderEvent[];
  payoutId: string | null;
  /** Shared by every vendor order created from one customer checkout. */
  checkoutId?: string;
}

export type OrderAction =
  | { type: "accept" }
  | { type: "pack" }
  | { type: "ship"; courier: string; trackingNumber: string }
  | { type: "deliver" }
  | { type: "cancel"; reason: string };

// ── Money ────────────────────────────────────────────────────────────────────

export type PayoutStatus = "processing" | "paid" | "failed";

export interface Payout {
  id: string;
  vendorId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  orderCount: number;
  status: PayoutStatus;
  createdAt: string;
  paidAt: string | null;
  reference: string;
}

export type TransactionType = "sale" | "commission" | "refund" | "payout";

export interface Transaction {
  id: string;
  at: string;
  type: TransactionType;
  description: string;
  amount: number; // signed, from the vendor's point of view
  orderNumber: string | null;
}

export interface EarningsSummary {
  available: number; // delivered, not yet paid out
  pending: number; // in progress, not yet delivered
  lifetimeSales: number;
  lifetimeCommission: number;
  lifetimePaid: number;
  commissionRate: number;
  nextPayoutDate: string;
  payouts: Payout[];
  transactions: Transaction[];
}

// ── Promotions ───────────────────────────────────────────────────────────────

export type PromotionType = "percent" | "fixed" | "free_shipping";

export interface Promotion {
  id: string;
  vendorId: string;
  code: string;
  type: PromotionType;
  value: number; // percent or pounds; ignored for free shipping
  minSpend: number | null;
  startsAt: string;
  endsAt: string | null;
  usageLimit: number | null;
  used: number;
  paused: boolean;
}

export type PromotionInput = Omit<Promotion, "id" | "vendorId" | "used" | "paused">;

export type PromotionState = "active" | "scheduled" | "expired" | "paused" | "used_up";

// ── Notifications and support ────────────────────────────────────────────────

export type NotificationKind = "order" | "product" | "payout" | "account" | "stock";

export interface VendorNotification {
  id: string;
  vendorId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href: string | null;
}

export interface TicketMessage {
  from: "vendor" | "support";
  body: string;
  at: string;
}

export interface SupportTicket {
  id: string;
  vendorId: string;
  subject: string;
  topic: string;
  status: "open" | "answered" | "closed";
  createdAt: string;
  messages: TicketMessage[];
}

// ── Marketplace settings (admin) ─────────────────────────────────────────────

export interface MarketplaceSettings {
  defaultCommissionRate: number;
  /** Per-category commission. A missing key means "use the default". */
  categoryRates: Record<string, number>;
  payoutSchedule: "weekly" | "fortnightly" | "monthly";
  minimumPayout: number;
  productApprovalRequired: boolean;
  commissionOnShipping: boolean;
  defaultLowStockAt: number;
  minimumReturnsDays: number;
}

// ── Aggregates returned to pages ─────────────────────────────────────────────

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface VendorOverview {
  sales30: number;
  sales30Delta: number | null;
  orders30: number;
  orders30Delta: number | null;
  toFulfil: number;
  available: number;
  liveProducts: number;
  salesSeries: SeriesPoint[];
  recentOrders: VendorOrder[];
  lowStock: { product: VendorProduct; variant: ProductVariant }[];
  productsNeedingAction: VendorProduct[];
}

export interface VendorAnalytics {
  sales: number;
  salesDelta: number | null;
  orders: number;
  ordersDelta: number | null;
  averageOrder: number;
  unitsSold: number;
  refundRate: number;
  salesSeries: SeriesPoint[];
  ordersSeries: SeriesPoint[];
  topProducts: { label: string; value: number; sub: string }[];
  byCategory: { label: string; value: number }[];
  byStatus: { label: string; value: number }[];
}

export interface AdminVendorRow {
  vendor: Vendor;
  onboardingPercent: number;
  liveProducts: number;
  pendingProducts: number;
  sales30: number;
  balance: number;
}

export interface AdminVendorDetail extends AdminVendorRow {
  products: VendorProduct[];
  orders: VendorOrder[];
  payouts: Payout[];
  lifetimeSales: number;
  lifetimeCommission: number;
  effectiveCommissionRate: number;
}

export interface AdminMarketplaceOverview {
  vendorsByStatus: Record<VendorStatus, number>;
  applicationsWaiting: number;
  productsWaiting: number;
  gmv30: number;
  gmv30Delta: number | null;
  commission30: number;
  orders30: number;
  payoutsDue: number;
  gmvSeries: SeriesPoint[];
  topVendors: { label: string; value: number; sub: string }[];
  funnel: { label: string; value: number }[];
  attention: { id: string; kind: "application" | "product" | "payout" | "stalled"; title: string; detail: string; href: string }[];
}

export interface AdminProductRow {
  product: VendorProduct;
  vendorName: string;
  totalStock: number;
  price: number;
}

export interface AdminOrderRow {
  order: VendorOrder;
  vendorName: string;
}

export interface AdminPayoutDue {
  vendorId: string;
  vendorName: string;
  amount: number;
  orderCount: number;
  hasBankDetails: boolean;
}

export interface AdminPayoutsData {
  due: AdminPayoutDue[];
  history: (Payout & { vendorName: string })[];
  minimumPayout: number;
}

export type VendorDecision = "approve" | "request_changes" | "reject" | "suspend" | "reactivate";
export type ProductDecision = "approve" | "request_changes" | "reject" | "unpublish" | "republish";
