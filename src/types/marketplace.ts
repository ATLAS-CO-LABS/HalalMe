// Marketplace domain types.
//
// These are shaped after the Shopify Storefront API (handles, options,
// variants, vendor) so the UI does not change when marketplaceService swaps
// its mock data for real Storefront queries.

export interface MarketplaceImage {
  url: string;
  alt: string;
}

export interface MarketplaceOption {
  name: string; // e.g. "Size"
  values: string[];
}

export interface MarketplaceVariant {
  id: string;
  title: string; // e.g. "M / Black"
  price: number; // GBP
  compareAtPrice: number | null;
  available: boolean;
  /** Units left. Used to cap quantity and show "only a few left". */
  stock: number;
  selectedOptions: { name: string; value: string }[];
}

export interface MarketplaceProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: { handle: string; name: string };
  category: { handle: string; title: string };
  images: MarketplaceImage[];
  options: MarketplaceOption[];
  variants: MarketplaceVariant[];
  /** Lowest variant price, for cards and sorting. */
  price: number;
}

export interface MarketplaceCategory {
  handle: string;
  title: string;
  description: string;
}

export interface MarketplaceVendor {
  handle: string;
  name: string;
  tagline: string;
  location: string;
  about: string;
  logo: string | null;
  banner: string | null;
  dispatch: string; // e.g. "Usually ships in 2 working days"
  couriers: string[];
  deliveryRate: number;
  freeDeliveryOver: number | null;
  returnsDays: number;
  returnsPolicy: string;
  productCount: number;
}

export interface MarketplaceCartLine {
  variantId: string;
  productHandle: string;
  title: string;
  variantTitle: string | null;
  vendor: { handle: string; name: string };
  price: number;
  image: MarketplaceImage | null;
  quantity: number;
}

export type MarketplaceSort = "featured" | "price-asc" | "price-desc" | "title";

export interface MarketplaceProductFilter {
  category?: string;
  vendor?: string;
  query?: string;
  sort?: MarketplaceSort;
  limit?: number;
}

// ── Basket pricing ───────────────────────────────────────────────────────────

/** One seller's share of the basket. Each seller sends their own parcel. */
export interface CartSellerGroup {
  vendor: { handle: string; name: string };
  lines: MarketplaceCartLine[];
  subtotal: number;
  delivery: number;
  /** How much more to spend with this seller for free delivery, or null. */
  toFreeDelivery: number | null;
  discount: number;
  dispatch: string;
}

export interface CartQuote {
  groups: CartSellerGroup[];
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  /** The code that was applied, with a short description of what it did. */
  promo: { code: string; description: string } | null;
  /** Why the entered code was not applied. */
  promoError: string | null;
}

// ── Customer orders ──────────────────────────────────────────────────────────

export type ParcelStatus = "new" | "accepted" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded";

export interface CustomerParcel {
  orderNumber: string;
  vendor: { handle: string; name: string };
  status: ParcelStatus;
  items: { productHandle: string; title: string; variantTitle: string | null; quantity: number; unitPrice: number }[];
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  tracking: { courier: string; number: string } | null;
  timeline: { status: ParcelStatus; at: string; note: string | null }[];
}

export interface CustomerOrder {
  id: string;
  placedAt: string;
  contact: { name: string; email: string; phone: string };
  address: { line1: string; city: string; postCode: string };
  parcels: CustomerParcel[];
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
}

export interface CheckoutInput {
  contact: { name: string; email: string; phone: string };
  address: { line1: string; city: string; postCode: string };
  note: string;
  lines: MarketplaceCartLine[];
  promoCode: string | null;
}
