// Everything the vendor portal reads or changes, scoped to the signed-in vendor.
//
// SIMULATED: each method reads and writes the browser-only mock store. The
// method names, arguments and return types are the contract the pages depend
// on, so wiring up the real backend (and Shopify behind it) means replacing
// the bodies here, not the screens.

import {
  getSessionVendorId,
  mutateDb,
  newId,
  pushNotification,
  readDb,
  resetDb,
  resolveCommissionRate,
  setSessionVendorId,
  simulateLatency,
  type MarketplaceDb,
} from "@/lib/marketplaceMockDb";
import { balanceOf, DAY_MS, deltaPct, isSale, nextPayoutDate, placedBetween, round2, sumTotal, timeSeries } from "@/lib/marketplaceStats";
import { categoryTitle, onboardingProgress, OPEN_ORDER_STATUSES, ORDER_STATUS } from "@/lib/vendorOnboarding";
import type {
  EarningsSummary,
  OrderAction,
  OrderStatus,
  ProductInput,
  ProductStatus,
  Promotion,
  PromotionInput,
  SupportTicket,
  Transaction,
  Vendor,
  VendorAnalytics,
  VendorDocType,
  VendorNotification,
  VendorOrder,
  VendorOverview,
  VendorPatch,
  VendorProduct,
  VendorRegistration,
} from "@/types/marketplaceVendor";

function requireVendor(db: MarketplaceDb): Vendor {
  const vendor = db.vendors.find((v) => v.id === getSessionVendorId());
  if (!vendor) throw new Error("You are not signed in as a marketplace vendor.");
  return vendor;
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "store";
}

/** Statuses a vendor may edit a product in without sending it back to review. */
const LIVE_STATUSES: ProductStatus[] = ["live", "paused"];

export const vendorService = {
  // ── Account ────────────────────────────────────────────────────────────────

  async getMyVendor(): Promise<Vendor | null> {
    const id = getSessionVendorId();
    return simulateLatency(readDb().vendors.find((v) => v.id === id) ?? null);
  },

  async register(input: VendorRegistration): Promise<Vendor> {
    const vendor = mutateDb((db) => {
      let handle = slugify(input.tradingName);
      while (db.vendors.some((v) => v.handle === handle)) handle = `${handle}-2`;

      const created: Vendor = {
        id: handle,
        handle,
        status: "draft",
        createdAt: new Date().toISOString(),
        submittedAt: null,
        approvedAt: null,
        reviewNote: null,
        business: {
          legalName: "",
          tradingName: input.tradingName.trim(),
          type: input.businessType,
          companyNumber: "",
          vatNumber: "",
          address: input.address.trim(),
          city: input.city.trim(),
          postCode: input.postCode.trim(),
          country: "United Kingdom",
        },
        owner: { name: input.ownerName.trim(), email: input.email.trim(), phone: input.phone.trim() },
        store: { name: input.tradingName.trim(), tagline: "", description: "", logo: null, banner: null, supportEmail: input.email.trim() },
        categories: input.categories,
        delivery: { dispatchDays: 0, ukRate: 3.95, freeOver: null, couriers: [], returnsDays: db.settings.minimumReturnsDays, returnsAddress: "", returnsPolicy: "" },
        payout: { accountName: "", sortCode: "", accountNumber: "" },
        documents: [],
        commissionRate: null,
        notificationPrefs: { newOrder: true, lowStock: true, productReview: true, payouts: true, marketing: false },
        welcomeSeen: false,
      };
      db.vendors.unshift(created);
      return created;
    });
    setSessionVendorId(vendor.id);
    return simulateLatency(vendor, 500);
  },

  async updateVendor(patch: VendorPatch): Promise<Vendor> {
    return simulateLatency(
      mutateDb((db) => {
        const vendor = requireVendor(db);
        Object.assign(vendor, patch);
        return vendor;
      }),
    );
  },

  async uploadDocument(type: VendorDocType, fileName: string): Promise<Vendor> {
    return simulateLatency(
      mutateDb((db) => {
        const vendor = requireVendor(db);
        vendor.documents = [
          ...vendor.documents.filter((d) => d.type !== type),
          { type, fileName, status: "uploaded", rejectionReason: null, uploadedAt: new Date().toISOString() },
        ];
        return vendor;
      }),
      700,
    );
  },

  async removeDocument(type: VendorDocType): Promise<Vendor> {
    return simulateLatency(
      mutateDb((db) => {
        const vendor = requireVendor(db);
        vendor.documents = vendor.documents.filter((d) => d.type !== type);
        return vendor;
      }),
    );
  },

  async submitApplication(): Promise<Vendor> {
    return simulateLatency(
      mutateDb((db) => {
        const vendor = requireVendor(db);
        if (!onboardingProgress(vendor).readyToSubmit) {
          throw new Error("Some sections are still incomplete.");
        }
        vendor.status = "submitted";
        vendor.submittedAt = new Date().toISOString();
        vendor.reviewNote = null;
        return vendor;
      }),
      600,
    );
  },

  // ── Overview ───────────────────────────────────────────────────────────────

  async getOverview(): Promise<VendorOverview> {
    const db = readDb();
    const vendor = requireVendor(db);
    const now = Date.now();
    const orders = db.orders.filter((o) => o.vendorId === vendor.id);
    const products = db.products.filter((p) => p.vendorId === vendor.id);
    const sales = orders.filter(isSale);
    const current = sales.filter((o) => placedBetween(o, now - 30 * DAY_MS, now + DAY_MS));
    const previous = sales.filter((o) => placedBetween(o, now - 60 * DAY_MS, now - 30 * DAY_MS));

    return simulateLatency({
      sales30: sumTotal(current),
      sales30Delta: deltaPct(sumTotal(current), sumTotal(previous)),
      orders30: current.length,
      orders30Delta: deltaPct(current.length, previous.length),
      toFulfil: orders.filter((o) => OPEN_ORDER_STATUSES.includes(o.status)).length,
      available: balanceOf(orders).available,
      liveProducts: products.filter((p) => p.status === "live").length,
      salesSeries: timeSeries(sales, 30, (o) => o.total, now),
      recentOrders: orders.slice(0, 6),
      lowStock: products
        .filter((p) => p.status === "live")
        .flatMap((product) => product.variants.filter((v) => v.stock <= product.lowStockAt).map((variant) => ({ product, variant })))
        .sort((a, b) => a.variant.stock - b.variant.stock)
        .slice(0, 6),
      productsNeedingAction: products.filter((p) => p.status === "changes_requested" || p.status === "rejected"),
    });
  },

  // ── Products ───────────────────────────────────────────────────────────────

  async listProducts(): Promise<VendorProduct[]> {
    const db = readDb();
    const vendor = requireVendor(db);
    return simulateLatency(
      db.products.filter((p) => p.vendorId === vendor.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    );
  },

  async getProduct(id: string): Promise<VendorProduct | null> {
    const db = readDb();
    const vendor = requireVendor(db);
    return simulateLatency(db.products.find((p) => p.id === id && p.vendorId === vendor.id) ?? null);
  },

  /**
   * Create or update a product. `submit` sends it for review (or straight live
   * when the marketplace does not require approval); otherwise it is saved as
   * it stands. Editing a live product keeps it live.
   */
  async saveProduct(id: string | null, input: ProductInput, submit: boolean): Promise<VendorProduct> {
    return simulateLatency(
      mutateDb((db) => {
        const vendor = requireVendor(db);
        const now = new Date().toISOString();
        const reviewed: ProductStatus = db.settings.productApprovalRequired ? "pending_review" : "live";
        const variants = input.variants.map((v) => ({ ...v, id: v.id || newId("v") }));

        if (id) {
          const product = db.products.find((p) => p.id === id && p.vendorId === vendor.id);
          if (!product) throw new Error("Product not found.");
          Object.assign(product, input, { variants, updatedAt: now });
          if (submit && !LIVE_STATUSES.includes(product.status)) {
            product.status = reviewed;
            product.reviewNote = null;
          }
          return product;
        }

        const product: VendorProduct = {
          ...input,
          variants,
          id: newId("p"),
          vendorId: vendor.id,
          status: submit ? reviewed : "draft",
          reviewNote: null,
          createdAt: now,
          updatedAt: now,
        };
        db.products.unshift(product);
        return product;
      }),
      500,
    );
  },

  /** Vendor-controlled visibility: pause a live product or put it back on sale. */
  async setProductPaused(id: string, paused: boolean): Promise<void> {
    mutateDb((db) => {
      const vendor = requireVendor(db);
      const product = db.products.find((p) => p.id === id && p.vendorId === vendor.id);
      if (!product || !LIVE_STATUSES.includes(product.status)) throw new Error("Only live products can be paused.");
      product.status = paused ? "paused" : "live";
      product.updatedAt = new Date().toISOString();
    });
    return simulateLatency(undefined);
  },

  async duplicateProduct(id: string): Promise<VendorProduct> {
    return simulateLatency(
      mutateDb((db) => {
        const vendor = requireVendor(db);
        const source = db.products.find((p) => p.id === id && p.vendorId === vendor.id);
        if (!source) throw new Error("Product not found.");
        const now = new Date().toISOString();
        const copy: VendorProduct = {
          ...source,
          id: newId("p"),
          title: `${source.title} (copy)`,
          variants: source.variants.map((v) => ({ ...v, id: newId("v"), sku: `${v.sku}-COPY` })),
          status: "draft",
          reviewNote: null,
          createdAt: now,
          updatedAt: now,
        };
        db.products.unshift(copy);
        return copy;
      }),
    );
  },

  async deleteProduct(id: string): Promise<void> {
    mutateDb((db) => {
      const vendor = requireVendor(db);
      db.products = db.products.filter((p) => !(p.id === id && p.vendorId === vendor.id));
    });
    return simulateLatency(undefined);
  },

  async setStock(productId: string, variantId: string, stock: number): Promise<void> {
    mutateDb((db) => {
      const vendor = requireVendor(db);
      const variant = db.products.find((p) => p.id === productId && p.vendorId === vendor.id)?.variants.find((v) => v.id === variantId);
      if (!variant) throw new Error("Variant not found.");
      variant.stock = Math.max(0, Math.round(stock));
    });
    return simulateLatency(undefined, 150);
  },

  // ── Orders ─────────────────────────────────────────────────────────────────

  async listOrders(): Promise<VendorOrder[]> {
    const db = readDb();
    const vendor = requireVendor(db);
    return simulateLatency(db.orders.filter((o) => o.vendorId === vendor.id));
  },

  async getOrder(id: string): Promise<VendorOrder | null> {
    const db = readDb();
    const vendor = requireVendor(db);
    return simulateLatency(db.orders.find((o) => o.id === id && o.vendorId === vendor.id) ?? null);
  },

  /** Move an order along the fulfilment flow. Each action is only valid from one status. */
  async updateOrder(id: string, action: OrderAction): Promise<VendorOrder> {
    return simulateLatency(
      mutateDb((db) => {
        const vendor = requireVendor(db);
        const order = db.orders.find((o) => o.id === id && o.vendorId === vendor.id);
        if (!order) throw new Error("Order not found.");

        const move = (from: OrderStatus[], to: OrderStatus, note: string | null = null) => {
          if (!from.includes(order.status)) {
            throw new Error(`This order is already ${ORDER_STATUS[order.status].label.toLowerCase()}.`);
          }
          order.status = to;
          order.timeline.push({ status: to, at: new Date().toISOString(), note });
        };

        switch (action.type) {
          case "accept":
            move(["new"], "accepted");
            break;
          case "pack":
            move(["accepted"], "packed");
            break;
          case "ship":
            if (!action.trackingNumber.trim()) throw new Error("Add a tracking number before marking as shipped.");
            move(["packed", "accepted"], "shipped", `${action.courier} ${action.trackingNumber.trim()}`);
            order.tracking = { courier: action.courier, number: action.trackingNumber.trim() };
            break;
          case "deliver":
            move(["shipped"], "delivered");
            break;
          case "cancel":
            move(["new", "accepted", "packed"], "cancelled", action.reason.trim() || null);
            break;
        }
        return order;
      }),
      400,
    );
  },

  // ── Analytics ──────────────────────────────────────────────────────────────

  async getAnalytics(days: number): Promise<VendorAnalytics> {
    const db = readDb();
    const vendor = requireVendor(db);
    const now = Date.now();
    const all = db.orders.filter((o) => o.vendorId === vendor.id);
    const inRange = all.filter((o) => placedBetween(o, now - days * DAY_MS, now + DAY_MS));
    const sales = inRange.filter(isSale);
    const previous = all.filter((o) => isSale(o) && placedBetween(o, now - 2 * days * DAY_MS, now - days * DAY_MS));

    const productTotals = new Map<string, { revenue: number; units: number }>();
    const categoryTotals = new Map<string, number>();
    for (const order of sales) {
      for (const item of order.items) {
        const line = item.unitPrice * item.quantity;
        const entry = productTotals.get(item.title) ?? { revenue: 0, units: 0 };
        productTotals.set(item.title, { revenue: entry.revenue + line, units: entry.units + item.quantity });
        const category = db.products.find((p) => p.id === item.productId)?.category ?? "other";
        categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + line);
      }
    }

    const statusCounts = new Map<OrderStatus, number>();
    inRange.forEach((o) => statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1));

    return simulateLatency({
      sales: sumTotal(sales),
      salesDelta: deltaPct(sumTotal(sales), sumTotal(previous)),
      orders: sales.length,
      ordersDelta: deltaPct(sales.length, previous.length),
      averageOrder: sales.length ? round2(sumTotal(sales) / sales.length) : 0,
      unitsSold: sales.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0),
      refundRate: inRange.length ? Math.round((inRange.filter((o) => o.status === "refunded").length / inRange.length) * 100) : 0,
      salesSeries: timeSeries(sales, days, (o) => o.total, now),
      ordersSeries: timeSeries(sales, days, () => 1, now),
      topProducts: [...productTotals.entries()]
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 6)
        .map(([label, t]) => ({ label, value: round2(t.revenue), sub: `${t.units} sold` })),
      byCategory: [...categoryTotals.entries()].map(([handle, value]) => ({ label: categoryTitle(handle), value: round2(value) })),
      byStatus: [...statusCounts.entries()].map(([status, value]) => ({ label: ORDER_STATUS[status].label, value })),
    });
  },

  // ── Earnings ───────────────────────────────────────────────────────────────

  async getEarnings(): Promise<EarningsSummary> {
    const db = readDb();
    const vendor = requireVendor(db);
    const orders = db.orders.filter((o) => o.vendorId === vendor.id);
    const payouts = db.payouts.filter((p) => p.vendorId === vendor.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const earned = orders.filter((o) => o.status !== "cancelled");
    const { available, pending } = balanceOf(orders);

    const transactions: Transaction[] = [];
    for (const order of earned) {
      transactions.push(
        { id: `${order.id}-sale`, at: order.placedAt, type: "sale", description: `Order ${order.number}`, amount: order.total, orderNumber: order.number },
        { id: `${order.id}-fee`, at: order.placedAt, type: "commission", description: `Commission at ${order.commissionRate}%`, amount: -order.commissionAmount, orderNumber: order.number },
      );
      if (order.status === "refunded") {
        const refundedAt = order.timeline.find((e) => e.status === "refunded")?.at ?? order.placedAt;
        transactions.push({ id: `${order.id}-refund`, at: refundedAt, type: "refund", description: `Refund for ${order.number}`, amount: -order.vendorNet, orderNumber: order.number });
      }
    }
    for (const payout of payouts) {
      transactions.push({ id: `${payout.id}-tx`, at: payout.createdAt, type: "payout", description: `Payout ${payout.reference}`, amount: -payout.amount, orderNumber: null });
    }
    transactions.sort((a, b) => b.at.localeCompare(a.at));

    const sales = orders.filter(isSale);
    return simulateLatency({
      available,
      pending,
      lifetimeSales: sumTotal(sales),
      lifetimeCommission: round2(sales.reduce((sum, o) => sum + o.commissionAmount, 0)),
      lifetimePaid: round2(payouts.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)),
      commissionRate: resolveCommissionRate(db, vendor),
      nextPayoutDate: nextPayoutDate(db.settings.payoutSchedule),
      payouts,
      transactions,
    });
  },

  // ── Promotions ─────────────────────────────────────────────────────────────

  async listPromotions(): Promise<Promotion[]> {
    const db = readDb();
    const vendor = requireVendor(db);
    return simulateLatency(db.promotions.filter((p) => p.vendorId === vendor.id));
  },

  async savePromotion(id: string | null, input: PromotionInput): Promise<void> {
    mutateDb((db) => {
      const vendor = requireVendor(db);
      const code = input.code.trim().toUpperCase();
      if (db.promotions.some((p) => p.code === code && p.id !== id)) {
        throw new Error("That code is already in use. Choose a different one.");
      }
      if (id) {
        const promo = db.promotions.find((p) => p.id === id && p.vendorId === vendor.id);
        if (!promo) throw new Error("Promotion not found.");
        Object.assign(promo, input, { code });
      } else {
        db.promotions.unshift({ ...input, code, id: newId("promo"), vendorId: vendor.id, used: 0, paused: false });
      }
    });
    return simulateLatency(undefined, 400);
  },

  async setPromotionPaused(id: string, paused: boolean): Promise<void> {
    mutateDb((db) => {
      const vendor = requireVendor(db);
      const promo = db.promotions.find((p) => p.id === id && p.vendorId === vendor.id);
      if (promo) promo.paused = paused;
    });
    return simulateLatency(undefined);
  },

  async deletePromotion(id: string): Promise<void> {
    mutateDb((db) => {
      const vendor = requireVendor(db);
      db.promotions = db.promotions.filter((p) => !(p.id === id && p.vendorId === vendor.id));
    });
    return simulateLatency(undefined);
  },

  // ── Notifications ──────────────────────────────────────────────────────────

  async listNotifications(): Promise<VendorNotification[]> {
    const db = readDb();
    const vendor = requireVendor(db);
    return simulateLatency(db.notifications.filter((n) => n.vendorId === vendor.id));
  },

  /** Mark one notification read, or all of them when no id is given. */
  async markNotificationsRead(id?: string): Promise<void> {
    mutateDb((db) => {
      const vendor = requireVendor(db);
      db.notifications.forEach((n) => {
        if (n.vendorId === vendor.id && (!id || n.id === id)) n.read = true;
      });
    });
    return simulateLatency(undefined, 100);
  },

  // ── Support ────────────────────────────────────────────────────────────────

  async listTickets(): Promise<SupportTicket[]> {
    const db = readDb();
    const vendor = requireVendor(db);
    return simulateLatency(
      db.tickets.filter((t) => t.vendorId === vendor.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async createTicket(subject: string, topic: string, message: string): Promise<SupportTicket> {
    return simulateLatency(
      mutateDb((db) => {
        const vendor = requireVendor(db);
        const now = new Date().toISOString();
        const ticket: SupportTicket = {
          id: newId("t"),
          vendorId: vendor.id,
          subject: subject.trim(),
          topic,
          status: "open",
          createdAt: now,
          messages: [{ from: "vendor", body: message.trim(), at: now }],
        };
        db.tickets.unshift(ticket);
        return ticket;
      }),
      500,
    );
  },

  async replyToTicket(id: string, message: string): Promise<void> {
    mutateDb((db) => {
      const vendor = requireVendor(db);
      const ticket = db.tickets.find((t) => t.id === id && t.vendorId === vendor.id);
      if (!ticket) throw new Error("Ticket not found.");
      ticket.messages.push({ from: "vendor", body: message.trim(), at: new Date().toISOString() });
      ticket.status = "open";
    });
    return simulateLatency(undefined, 400);
  },

  // ── Demo controls ──────────────────────────────────────────────────────────
  // These exist only while the portal runs on mock data. They let a reviewer
  // step into each vendor's shoes; delete them with the mock store.

  demoVendorOptions(): { id: string; name: string; status: Vendor["status"] }[] {
    return readDb().vendors.map((v) => ({ id: v.id, name: v.business.tradingName, status: v.status }));
  },

  demoSignInAs(vendorId: string | null) {
    setSessionVendorId(vendorId);
  },

  demoReset() {
    resetDb();
  },

  /** A customer places an order, so the fulfilment flow can be tried from the start. */
  async demoPlaceOrder(): Promise<VendorOrder> {
    return simulateLatency(
      mutateDb((db) => {
        const vendor = requireVendor(db);
        const product = db.products.find((p) => p.vendorId === vendor.id && p.status === "live");
        if (!product) throw new Error("Add a live product first, then a test order can be placed.");
        const variant = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
        const now = new Date().toISOString();
        const subtotal = variant.price;
        const shipping = vendor.delivery.freeOver !== null && subtotal >= vendor.delivery.freeOver ? 0 : vendor.delivery.ukRate;
        const rate = resolveCommissionRate(db, vendor, product.category);
        const commissionBase = db.settings.commissionOnShipping ? subtotal + shipping : subtotal;
        const commissionAmount = round2((commissionBase * rate) / 100);
        const total = round2(subtotal + shipping);
        const highest = Math.max(10_000, ...db.orders.map((o) => Number(o.number.replace("HM-", "")) || 0));

        const order: VendorOrder = {
          id: newId("o"),
          number: `HM-${highest + 1}`,
          vendorId: vendor.id,
          placedAt: now,
          status: "new",
          customer: { name: "Test Customer", email: "test@customer.example", phone: "07700 900000" },
          shippingAddress: { line1: "1 Example Road", city: "London", postCode: "N1 9GU" },
          customerNote: null,
          items: [{ productId: product.id, title: product.title, variantName: product.variants.length > 1 ? variant.name : null, sku: variant.sku, quantity: 1, unitPrice: variant.price }],
          subtotal,
          shipping,
          total,
          commissionRate: rate,
          commissionAmount,
          vendorNet: round2(total - commissionAmount),
          tracking: null,
          timeline: [{ status: "new", at: now, note: null }],
          payoutId: null,
        };
        variant.stock = Math.max(0, variant.stock - 1);
        db.orders.unshift(order);
        pushNotification(db, vendor.id, { kind: "order", title: "New order received", body: `Order ${order.number} is waiting to be accepted.`, href: `/vendor/orders/${order.id}` });
        return order;
      }),
      400,
    );
  },
};
