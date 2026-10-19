// Everything the customer-facing Marketplace reads or changes.
//
// SIMULATED: the shop reads the same browser-only sample store as the vendor
// portal and the admin screens, so a product a vendor publishes appears here,
// and an order placed here appears in that vendor's dashboard. Each method is
// async and returns storefront-shaped data, so connecting Shopify means
// replacing the bodies below (Storefront API for the catalogue, Cart API and
// hosted checkout for buying, order webhooks for order history).

import { MOCK_CATEGORIES } from "@/data/marketplaceMockData";
import {
  mutateDb,
  newId,
  pushNotification,
  readDb,
  resolveCommissionRate,
  simulateLatency,
  type MarketplaceDb,
} from "@/lib/marketplaceMockDb";
import { round2 } from "@/lib/marketplaceStats";
import { categoryTitle, money, promotionState } from "@/lib/vendorOnboarding";
import type { Promotion, Vendor, VendorOrder, VendorProduct } from "@/types/marketplaceVendor";
import type {
  CartQuote,
  CartSellerGroup,
  CheckoutInput,
  CustomerOrder,
  CustomerParcel,
  MarketplaceCartLine,
  MarketplaceCategory,
  MarketplaceProduct,
  MarketplaceProductFilter,
  MarketplaceVendor,
} from "@/types/marketplace";

// The orders this browser has placed. Stands in for "orders belonging to the
// signed-in customer", which the real backend will key by user id.
const MY_ORDERS_KEY = "halalme-marketplace-my-orders";

function myOrderIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(MY_ORDERS_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

// ── Mapping from the vendor system to storefront shapes ──────────────────────

const SIZE_NAMES = new Set(["XXS", "XS", "S", "M", "L", "XL", "XXL"]);

/** Vendors name their options freely; label the picker "Size" when that is clearly what they are. */
function optionName(product: VendorProduct): string {
  return product.variants.every((v) => SIZE_NAMES.has(v.name.toUpperCase())) ? "Size" : "Option";
}

function dispatchText(days: number): string {
  if (days <= 1) return "Usually ships next working day";
  return `Usually ships in ${days} working days`;
}

function isOnSale(product: VendorProduct, vendors: Map<string, Vendor>): boolean {
  return product.status === "live" && vendors.get(product.vendorId)?.status === "active";
}

function toProduct(product: VendorProduct, vendor: Vendor): MarketplaceProduct {
  const hasOptions = product.variants.length > 1;
  const name = optionName(product);
  return {
    id: product.id,
    handle: product.id,
    title: product.title,
    description: product.description,
    vendor: { handle: vendor.handle, name: vendor.store.name || vendor.business.tradingName },
    category: { handle: product.category, title: categoryTitle(product.category) },
    images: product.images.map((url) => ({ url, alt: product.title })),
    options: hasOptions ? [{ name, values: product.variants.map((v) => v.name) }] : [],
    variants: product.variants.map((v) => ({
      id: v.id,
      title: v.name,
      price: v.price,
      compareAtPrice: product.compareAtPrice,
      available: v.stock > 0,
      stock: v.stock,
      selectedOptions: hasOptions ? [{ name, value: v.name }] : [],
    })),
    price: Math.min(...product.variants.map((v) => v.price)),
  };
}

function toVendor(vendor: Vendor, productCount: number): MarketplaceVendor {
  return {
    handle: vendor.handle,
    name: vendor.store.name || vendor.business.tradingName,
    tagline: vendor.store.tagline,
    location: `${vendor.business.city}, UK`,
    about: vendor.store.description,
    logo: vendor.store.logo,
    banner: vendor.store.banner,
    dispatch: dispatchText(vendor.delivery.dispatchDays),
    couriers: vendor.delivery.couriers,
    deliveryRate: vendor.delivery.ukRate,
    freeDeliveryOver: vendor.delivery.freeOver,
    returnsDays: vendor.delivery.returnsDays,
    returnsPolicy: vendor.delivery.returnsPolicy,
    productCount,
  };
}

function catalogue(db: MarketplaceDb): MarketplaceProduct[] {
  const vendors = new Map(db.vendors.map((v) => [v.id, v]));
  return db.products.filter((p) => isOnSale(p, vendors)).map((p) => toProduct(p, vendors.get(p.vendorId)!));
}

// ── Basket pricing ───────────────────────────────────────────────────────────

function describePromo(promo: Promotion): string {
  if (promo.type === "percent") return `${promo.value}% off`;
  if (promo.type === "fixed") return `${money(promo.value)} off`;
  return "Free delivery";
}

/** Price a basket: per-seller delivery, and one optional discount code. */
function buildQuote(db: MarketplaceDb, lines: MarketplaceCartLine[], promoCode: string | null): CartQuote {
  const groups: CartSellerGroup[] = [];
  for (const line of lines) {
    let group = groups.find((g) => g.vendor.handle === line.vendor.handle);
    if (!group) {
      group = { vendor: line.vendor, lines: [], subtotal: 0, delivery: 0, toFreeDelivery: null, discount: 0, dispatch: "" };
      groups.push(group);
    }
    group.lines.push(line);
  }

  for (const group of groups) {
    const vendor = db.vendors.find((v) => v.handle === group.vendor.handle);
    group.subtotal = round2(group.lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
    const freeOver = vendor?.delivery.freeOver ?? null;
    const free = freeOver !== null && group.subtotal >= freeOver;
    group.delivery = free ? 0 : (vendor?.delivery.ukRate ?? 0);
    group.toFreeDelivery = freeOver !== null && !free ? round2(freeOver - group.subtotal) : null;
    group.dispatch = dispatchText(vendor?.delivery.dispatchDays ?? 2);
  }

  let promo: CartQuote["promo"] = null;
  let promoError: string | null = null;
  const code = promoCode?.trim().toUpperCase();
  if (code) {
    const found = db.promotions.find((p) => p.code === code);
    const group = found ? groups.find((g) => g.vendor.handle === found.vendorId) : undefined;
    if (!found || promotionState(found) !== "active") {
      promoError = "That code is not valid or has expired.";
    } else if (!group) {
      promoError = `That code only works on products from ${db.vendors.find((v) => v.id === found.vendorId)?.store.name ?? "another seller"}.`;
    } else if (found.minSpend !== null && group.subtotal < found.minSpend) {
      promoError = `Spend ${money(found.minSpend)} or more with ${group.vendor.name} to use that code.`;
    } else {
      if (found.type === "percent") group.discount = round2((group.subtotal * found.value) / 100);
      if (found.type === "fixed") group.discount = Math.min(found.value, group.subtotal);
      if (found.type === "free_shipping") {
        group.discount = group.delivery;
        // Shown as a discount line, so delivery itself stays visible.
      }
      promo = { code, description: `${describePromo(found)} at ${group.vendor.name}` };
    }
  }

  const subtotal = round2(groups.reduce((sum, g) => sum + g.subtotal, 0));
  const delivery = round2(groups.reduce((sum, g) => sum + g.delivery, 0));
  const discount = round2(groups.reduce((sum, g) => sum + g.discount, 0));
  return { groups, subtotal, delivery, discount, total: round2(subtotal + delivery - discount), promo, promoError };
}

// ── Customer orders ──────────────────────────────────────────────────────────

function toParcel(db: MarketplaceDb, order: VendorOrder): CustomerParcel {
  const vendor = db.vendors.find((v) => v.id === order.vendorId);
  return {
    orderNumber: order.number,
    vendor: { handle: order.vendorId, name: vendor?.store.name || vendor?.business.tradingName || "Seller" },
    status: order.status,
    items: order.items.map((i) => ({ productHandle: i.productId, title: i.title, variantTitle: i.variantName, quantity: i.quantity, unitPrice: i.unitPrice })),
    subtotal: order.subtotal,
    delivery: order.shipping,
    discount: order.discount ?? 0,
    total: order.total,
    tracking: order.tracking,
    timeline: order.timeline,
  };
}

function toCustomerOrder(db: MarketplaceDb, checkoutId: string): CustomerOrder | null {
  const orders = db.orders.filter((o) => o.checkoutId === checkoutId);
  if (orders.length === 0) return null;
  const parcels = orders.map((o) => toParcel(db, o));
  const sum = (pick: (p: CustomerParcel) => number) => round2(parcels.reduce((total, p) => total + pick(p), 0));
  return {
    id: checkoutId,
    placedAt: orders[0].placedAt,
    contact: orders[0].customer,
    address: orders[0].shippingAddress,
    parcels,
    subtotal: sum((p) => p.subtotal),
    delivery: sum((p) => p.delivery),
    discount: sum((p) => p.discount),
    total: sum((p) => p.total),
  };
}

export const marketplaceService = {
  // ── Catalogue ──────────────────────────────────────────────────────────────

  async listCategories(): Promise<MarketplaceCategory[]> {
    return MOCK_CATEGORIES;
  },

  async getCategory(handle: string): Promise<MarketplaceCategory | null> {
    return MOCK_CATEGORIES.find((c) => c.handle === handle) ?? null;
  },

  async listProducts(filter: MarketplaceProductFilter = {}): Promise<MarketplaceProduct[]> {
    const query = filter.query?.trim().toLowerCase();

    let products = catalogue(readDb()).filter((p) => {
      if (filter.category && p.category.handle !== filter.category) return false;
      if (filter.vendor && p.vendor.handle !== filter.vendor) return false;
      if (query) {
        const haystack = `${p.title} ${p.description} ${p.vendor.name} ${p.category.title}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    switch (filter.sort) {
      case "price-asc":
        products = [...products].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products = [...products].sort((a, b) => b.price - a.price);
        break;
      case "title":
        products = [...products].sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filter.limit ? products.slice(0, filter.limit) : products;
  },

  /** Look up several products at once, for the saved-items page. Unknown or delisted handles are dropped. */
  async getProducts(handles: string[]): Promise<MarketplaceProduct[]> {
    const all = catalogue(readDb());
    return handles.map((h) => all.find((p) => p.handle === h)).filter((p): p is MarketplaceProduct => Boolean(p));
  },

  async getProduct(handle: string): Promise<MarketplaceProduct | null> {
    return catalogue(readDb()).find((p) => p.handle === handle) ?? null;
  },

  // ── Sellers ────────────────────────────────────────────────────────────────

  async listVendors(): Promise<MarketplaceVendor[]> {
    const db = readDb();
    const products = catalogue(db);
    return db.vendors
      .filter((v) => v.status === "active")
      .map((v) => toVendor(v, products.filter((p) => p.vendor.handle === v.handle).length))
      .filter((v) => v.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount);
  },

  async getVendor(handle: string): Promise<MarketplaceVendor | null> {
    const db = readDb();
    const vendor = db.vendors.find((v) => v.handle === handle && v.status === "active");
    if (!vendor) return null;
    return toVendor(vendor, catalogue(db).filter((p) => p.vendor.handle === handle).length);
  },

  // ── Basket and checkout ────────────────────────────────────────────────────

  async quoteCart(lines: MarketplaceCartLine[], promoCode: string | null = null): Promise<CartQuote> {
    return simulateLatency(buildQuote(readDb(), lines, promoCode), 150);
  },

  /**
   * Place the order. One vendor order is created per seller in the basket, all
   * sharing a checkout id, and stock is taken straight away.
   *
   * PREVIEW: no payment is taken. With Shopify connected this method goes
   * away: the basket page redirects to Shopify's hosted checkout instead, and
   * orders arrive through the order webhook.
   */
  async placeOrder(input: CheckoutInput): Promise<string> {
    const checkoutId = mutateDb((db) => {
      if (input.lines.length === 0) throw new Error("Your basket is empty.");
      const quote = buildQuote(db, input.lines, input.promoCode);
      const id = newId("co");
      const now = new Date().toISOString();
      let highest = Math.max(10_000, ...db.orders.map((o) => Number(o.number.replace("HM-", "")) || 0));

      for (const group of quote.groups) {
        const vendor = db.vendors.find((v) => v.handle === group.vendor.handle);
        if (!vendor || vendor.status !== "active") throw new Error(`${group.vendor.name} is not taking orders right now.`);

        const items = group.lines.map((line) => {
          const product = db.products.find((p) => p.id === line.productHandle);
          const variant = product?.variants.find((v) => v.id === line.variantId);
          if (!product || !variant || product.status !== "live") throw new Error(`${line.title} is no longer available.`);
          if (variant.stock < line.quantity) {
            throw new Error(variant.stock === 0 ? `${line.title} has sold out.` : `Only ${variant.stock} of ${line.title} left. Please lower the quantity.`);
          }
          variant.stock -= line.quantity;
          if (variant.stock <= product.lowStockAt) {
            pushNotification(db, vendor.id, {
              kind: "stock",
              title: variant.stock === 0 ? "Out of stock" : "Low stock",
              body: `${product.title}${product.variants.length > 1 ? ` in ${variant.name}` : ""} ${variant.stock === 0 ? "has sold out" : `is down to ${variant.stock} units`}.`,
              href: "/vendor/inventory",
            });
          }
          return { item: { productId: product.id, title: product.title, variantName: product.variants.length > 1 ? variant.name : null, sku: variant.sku, quantity: line.quantity, unitPrice: variant.price }, category: product.category };
        });

        const rate = resolveCommissionRate(db, vendor, items[0].category);
        const total = round2(group.subtotal + group.delivery - group.discount);
        // Commission follows what the customer actually paid, so a discount the
        // vendor funds lowers it too.
        const commissionBase = db.settings.commissionOnShipping ? total : Math.max(0, total - group.delivery);
        const commissionAmount = round2((commissionBase * rate) / 100);

        highest += 1;
        const order: VendorOrder = {
          id: newId("o"),
          number: `HM-${highest}`,
          vendorId: vendor.id,
          placedAt: now,
          status: "new",
          customer: input.contact,
          shippingAddress: input.address,
          customerNote: input.note.trim() || null,
          items: items.map((i) => i.item),
          subtotal: group.subtotal,
          shipping: group.delivery,
          discount: group.discount,
          total,
          commissionRate: rate,
          commissionAmount,
          vendorNet: round2(total - commissionAmount),
          tracking: null,
          timeline: [{ status: "new", at: now, note: null }],
          payoutId: null,
          checkoutId: id,
        };
        db.orders.unshift(order);
        pushNotification(db, vendor.id, { kind: "order", title: "New order received", body: `Order ${order.number} is waiting to be accepted.`, href: `/vendor/orders/${order.id}` });
      }

      if (quote.promo) {
        const promo = db.promotions.find((p) => p.code === quote.promo!.code);
        if (promo) promo.used += 1;
      }
      return id;
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem(MY_ORDERS_KEY, JSON.stringify([checkoutId, ...myOrderIds()]));
    }
    return simulateLatency(checkoutId, 700);
  },

  // ── Customer orders ────────────────────────────────────────────────────────

  async listMyOrders(): Promise<CustomerOrder[]> {
    const db = readDb();
    return simulateLatency(
      myOrderIds()
        .map((id) => toCustomerOrder(db, id))
        .filter((o): o is CustomerOrder => o !== null),
    );
  },

  async getMyOrder(id: string): Promise<CustomerOrder | null> {
    if (!myOrderIds().includes(id)) return simulateLatency(null);
    return simulateLatency(toCustomerOrder(readDb(), id));
  },
};
