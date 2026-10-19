// Everything the admin Marketplace screens read or change.
//
// SIMULATED: backed by the same browser-only mock store as vendorService, so
// an admin decision here is visible in the vendor portal straight away. Real
// versions of these methods will be `/api/admin/marketplace/*` routes behind
// requireAdmin(), with each decision written to the admin audit log.

import {
  mutateDb,
  newId,
  pushNotification,
  readDb,
  resolveCommissionRate,
  simulateLatency,
  type MarketplaceDb,
} from "@/lib/marketplaceMockDb";
import { balanceOf, DAY_MS, deltaPct, isSale, placedBetween, round2, sumTotal, timeSeries } from "@/lib/marketplaceStats";
import { docLabel, onboardingProgress, requiredDocsApproved } from "@/lib/vendorOnboarding";
import type {
  AdminMarketplaceOverview,
  AdminOrderRow,
  AdminPayoutsData,
  AdminProductRow,
  AdminVendorDetail,
  AdminVendorRow,
  MarketplaceSettings,
  Payout,
  ProductDecision,
  Vendor,
  VendorDecision,
  VendorDocType,
  VendorStatus,
} from "@/types/marketplaceVendor";

function vendorName(db: MarketplaceDb, vendorId: string): string {
  return db.vendors.find((v) => v.id === vendorId)?.business.tradingName ?? "Unknown vendor";
}

function findVendor(db: MarketplaceDb, vendorId: string): Vendor {
  const vendor = db.vendors.find((v) => v.id === vendorId);
  if (!vendor) throw new Error("Vendor not found.");
  return vendor;
}

function toRow(db: MarketplaceDb, vendor: Vendor, now: number): AdminVendorRow {
  const products = db.products.filter((p) => p.vendorId === vendor.id);
  const orders = db.orders.filter((o) => o.vendorId === vendor.id);
  return {
    vendor,
    onboardingPercent: onboardingProgress(vendor).percent,
    liveProducts: products.filter((p) => p.status === "live").length,
    pendingProducts: products.filter((p) => p.status === "pending_review").length,
    sales30: sumTotal(orders.filter((o) => isSale(o) && placedBetween(o, now - 30 * DAY_MS, now + DAY_MS))),
    balance: balanceOf(orders).available,
  };
}

export const marketplaceAdminService = {
  // ── Overview ───────────────────────────────────────────────────────────────

  async getOverview(): Promise<AdminMarketplaceOverview> {
    const db = readDb();
    const now = Date.now();
    const sales = db.orders.filter(isSale);
    const current = sales.filter((o) => placedBetween(o, now - 30 * DAY_MS, now + DAY_MS));
    const previous = sales.filter((o) => placedBetween(o, now - 60 * DAY_MS, now - 30 * DAY_MS));

    const vendorsByStatus = { draft: 0, submitted: 0, changes_requested: 0, rejected: 0, active: 0, suspended: 0 } as Record<VendorStatus, number>;
    db.vendors.forEach((v) => { vendorsByStatus[v.status] += 1; });

    const due = db.vendors
      .map((v) => balanceOf(db.orders.filter((o) => o.vendorId === v.id)).available)
      .reduce((sum, n) => sum + n, 0);

    const attention: AdminMarketplaceOverview["attention"] = [];
    for (const vendor of db.vendors) {
      const href = `/admin/marketplace/vendors/${vendor.id}`;
      if (vendor.status === "submitted") {
        attention.push({ id: `app-${vendor.id}`, kind: "application", title: `${vendor.business.tradingName} applied to sell`, detail: "Application waiting for review", href });
      }
      if (vendor.status === "draft" && Date.now() - new Date(vendor.createdAt).getTime() > DAY_MS) {
        attention.push({ id: `stall-${vendor.id}`, kind: "stalled", title: `${vendor.business.tradingName} has not finished setup`, detail: `${onboardingProgress(vendor).percent}% complete`, href });
      }
    }
    const waitingProducts = db.products.filter((p) => p.status === "pending_review");
    if (waitingProducts.length > 0) {
      attention.push({ id: "products", kind: "product", title: `${waitingProducts.length} product${waitingProducts.length === 1 ? "" : "s"} waiting for approval`, detail: "Review listings before they go live", href: "/admin/marketplace?tab=products" });
    }
    const processing = db.payouts.filter((p) => p.status === "processing");
    if (processing.length > 0) {
      attention.push({ id: "payouts", kind: "payout", title: `${processing.length} payout${processing.length === 1 ? "" : "s"} still processing`, detail: "Mark as paid once the transfer has been sent", href: "/admin/marketplace?tab=payouts" });
    }

    const perVendor = new Map<string, { total: number; orders: number }>();
    current.forEach((o) => {
      const entry = perVendor.get(o.vendorId) ?? { total: 0, orders: 0 };
      perVendor.set(o.vendorId, { total: entry.total + o.total, orders: entry.orders + 1 });
    });

    const reached = (statuses: VendorStatus[]) => db.vendors.filter((v) => statuses.includes(v.status)).length;

    return simulateLatency({
      vendorsByStatus,
      applicationsWaiting: vendorsByStatus.submitted,
      productsWaiting: waitingProducts.length,
      gmv30: sumTotal(current),
      gmv30Delta: deltaPct(sumTotal(current), sumTotal(previous)),
      commission30: round2(current.reduce((sum, o) => sum + o.commissionAmount, 0)),
      orders30: current.length,
      payoutsDue: round2(due),
      gmvSeries: timeSeries(sales, 30, (o) => o.total, now),
      topVendors: [...perVendor.entries()]
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)
        .map(([id, t]) => ({ label: vendorName(db, id), value: round2(t.total), sub: `${t.orders} orders` })),
      funnel: [
        { label: "Signed up", value: db.vendors.length },
        { label: "Submitted", value: reached(["submitted", "changes_requested", "rejected", "active", "suspended"]) },
        { label: "Approved", value: reached(["active", "suspended"]) },
        { label: "Selling", value: db.vendors.filter((v) => v.status === "active" && db.products.some((p) => p.vendorId === v.id && p.status === "live")).length },
      ],
      attention,
    });
  },

  // ── Vendors ────────────────────────────────────────────────────────────────

  async listVendors(): Promise<AdminVendorRow[]> {
    const db = readDb();
    const now = Date.now();
    return simulateLatency(db.vendors.map((v) => toRow(db, v, now)));
  },

  async getVendor(vendorId: string): Promise<AdminVendorDetail | null> {
    const db = readDb();
    const vendor = db.vendors.find((v) => v.id === vendorId);
    if (!vendor) return simulateLatency(null);
    const orders = db.orders.filter((o) => o.vendorId === vendorId);
    const sales = orders.filter(isSale);
    return simulateLatency({
      ...toRow(db, vendor, Date.now()),
      products: db.products.filter((p) => p.vendorId === vendorId),
      orders,
      payouts: db.payouts.filter((p) => p.vendorId === vendorId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      lifetimeSales: sumTotal(sales),
      lifetimeCommission: round2(sales.reduce((sum, o) => sum + o.commissionAmount, 0)),
      effectiveCommissionRate: resolveCommissionRate(db, vendor),
    });
  },

  async reviewDocument(vendorId: string, type: VendorDocType, approve: boolean, reason: string): Promise<void> {
    mutateDb((db) => {
      const vendor = findVendor(db, vendorId);
      const doc = vendor.documents.find((d) => d.type === type);
      if (!doc) throw new Error("Document not found.");
      doc.status = approve ? "approved" : "rejected";
      doc.rejectionReason = approve ? null : reason.trim() || "This document could not be accepted.";
      if (!approve) {
        pushNotification(db, vendorId, { kind: "account", title: "A document needs replacing", body: `${docLabel(type)}: ${doc.rejectionReason}`, href: "/vendor" });
      }
    });
    return simulateLatency(undefined, 300);
  },

  /** Approve, send back, reject, suspend or reactivate a vendor. */
  async decideVendor(vendorId: string, decision: VendorDecision, note: string): Promise<void> {
    mutateDb((db) => {
      const vendor = findVendor(db, vendorId);
      const message = note.trim();

      switch (decision) {
        case "approve":
          if (!requiredDocsApproved(vendor)) throw new Error("Approve every required document before approving the vendor.");
          vendor.status = "active";
          vendor.approvedAt = new Date().toISOString();
          vendor.reviewNote = null;
          vendor.welcomeSeen = false;
          pushNotification(db, vendorId, { kind: "account", title: "Your store is approved", body: "Welcome to HalalMe Marketplace. Add your first products to start selling.", href: "/vendor/products" });
          break;
        case "request_changes":
          if (!message) throw new Error("Tell the vendor what needs to change.");
          vendor.status = "changes_requested";
          vendor.reviewNote = message;
          pushNotification(db, vendorId, { kind: "account", title: "Changes requested on your application", body: message, href: "/vendor" });
          break;
        case "reject":
          if (!message) throw new Error("Give the vendor a reason.");
          vendor.status = "rejected";
          vendor.reviewNote = message;
          break;
        case "suspend":
          if (!message) throw new Error("Give the vendor a reason.");
          vendor.status = "suspended";
          vendor.reviewNote = message;
          // A suspended store must not keep selling.
          db.products.forEach((p) => {
            if (p.vendorId === vendorId && p.status === "live") {
              p.status = "unpublished";
              p.reviewNote = "Unpublished while the store is suspended.";
            }
          });
          pushNotification(db, vendorId, { kind: "account", title: "Your store has been suspended", body: message, href: "/vendor" });
          break;
        case "reactivate":
          vendor.status = "active";
          vendor.reviewNote = null;
          db.products.forEach((p) => {
            if (p.vendorId === vendorId && p.status === "unpublished") {
              p.status = "live";
              p.reviewNote = null;
            }
          });
          pushNotification(db, vendorId, { kind: "account", title: "Your store is active again", body: "Your products are back on sale.", href: "/vendor" });
          break;
      }
    });
    return simulateLatency(undefined, 400);
  },

  /** Set a vendor-specific commission rate, or pass null to return them to the marketplace rate. */
  async setVendorCommission(vendorId: string, rate: number | null): Promise<void> {
    mutateDb((db) => {
      findVendor(db, vendorId).commissionRate = rate;
    });
    return simulateLatency(undefined, 300);
  },

  // ── Products ───────────────────────────────────────────────────────────────

  async listProducts(): Promise<AdminProductRow[]> {
    const db = readDb();
    return simulateLatency(
      db.products
        .filter((p) => p.status !== "draft")
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((product) => ({
          product,
          vendorName: vendorName(db, product.vendorId),
          totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
          price: Math.min(...product.variants.map((v) => v.price)),
        })),
    );
  },

  async decideProduct(productId: string, decision: ProductDecision, note: string): Promise<void> {
    mutateDb((db) => {
      const product = db.products.find((p) => p.id === productId);
      if (!product) throw new Error("Product not found.");
      const message = note.trim();
      const href = `/vendor/products/${product.id}`;

      if (decision === "approve" || decision === "republish") {
        product.status = "live";
        product.reviewNote = null;
        pushNotification(db, product.vendorId, { kind: "product", title: "Product approved", body: `${product.title} is now live.`, href });
        return;
      }
      if (!message) throw new Error("Add a note so the vendor knows why.");
      product.status = decision === "request_changes" ? "changes_requested" : decision === "reject" ? "rejected" : "unpublished";
      product.reviewNote = message;
      pushNotification(db, product.vendorId, {
        kind: "product",
        title: decision === "request_changes" ? "Changes requested on a product" : decision === "reject" ? "Product rejected" : "Product unpublished",
        body: `${product.title}: ${message}`,
        href,
      });
    });
    return simulateLatency(undefined, 350);
  },

  // ── Orders ─────────────────────────────────────────────────────────────────

  async listOrders(): Promise<AdminOrderRow[]> {
    const db = readDb();
    return simulateLatency(db.orders.map((order) => ({ order, vendorName: vendorName(db, order.vendorId) })));
  },

  async refundOrder(orderId: string, reason: string): Promise<void> {
    mutateDb((db) => {
      const order = db.orders.find((o) => o.id === orderId);
      if (!order) throw new Error("Order not found.");
      if (order.status === "refunded" || order.status === "cancelled") throw new Error("This order is already closed.");
      if (order.payoutId) throw new Error("This order has already been paid out. Recover it from the vendor's next payout instead.");
      order.status = "refunded";
      order.timeline.push({ status: "refunded", at: new Date().toISOString(), note: reason.trim() || null });
      pushNotification(db, order.vendorId, { kind: "order", title: "Order refunded", body: `Order ${order.number} was refunded by HalalMe.`, href: `/vendor/orders/${order.id}` });
    });
    return simulateLatency(undefined, 400);
  },

  // ── Payouts ────────────────────────────────────────────────────────────────

  async getPayouts(): Promise<AdminPayoutsData> {
    const db = readDb();
    const due = db.vendors
      .map((vendor) => {
        const balance = balanceOf(db.orders.filter((o) => o.vendorId === vendor.id));
        return {
          vendorId: vendor.id,
          vendorName: vendor.business.tradingName,
          amount: balance.available,
          orderCount: balance.availableOrders.length,
          hasBankDetails: vendor.payout.accountNumber.trim() !== "",
        };
      })
      .filter((row) => row.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return simulateLatency({
      due,
      history: db.payouts
        .map((p) => ({ ...p, vendorName: vendorName(db, p.vendorId) }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      minimumPayout: db.settings.minimumPayout,
    });
  },

  /** Bundle everything a vendor is owed into one payout and start processing it. */
  async createPayout(vendorId: string): Promise<Payout> {
    return simulateLatency(
      mutateDb((db) => {
        const vendor = findVendor(db, vendorId);
        const { available, availableOrders } = balanceOf(db.orders.filter((o) => o.vendorId === vendorId));
        if (available <= 0) throw new Error("Nothing is owed to this vendor.");
        if (available < db.settings.minimumPayout) throw new Error(`Below the minimum payout of £${db.settings.minimumPayout}.`);
        if (!vendor.payout.accountNumber.trim()) throw new Error("This vendor has not added bank details.");

        const dates = availableOrders.map((o) => o.placedAt).sort();
        const now = new Date().toISOString();
        const payout: Payout = {
          id: newId("pay"),
          vendorId,
          periodStart: dates[0],
          periodEnd: now,
          amount: available,
          orderCount: availableOrders.length,
          status: "processing",
          createdAt: now,
          paidAt: null,
          reference: `HALALME-${vendorId.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-5)}`,
        };
        availableOrders.forEach((o) => { o.payoutId = payout.id; });
        db.payouts.unshift(payout);
        return payout;
      }),
      500,
    );
  },

  async markPayoutPaid(payoutId: string): Promise<void> {
    mutateDb((db) => {
      const payout = db.payouts.find((p) => p.id === payoutId);
      if (!payout) throw new Error("Payout not found.");
      payout.status = "paid";
      payout.paidAt = new Date().toISOString();
      pushNotification(db, payout.vendorId, { kind: "payout", title: "Payout sent", body: `£${payout.amount.toFixed(2)} has been sent to your bank account.`, href: "/vendor/earnings" });
    });
    return simulateLatency(undefined, 350);
  },

  // ── Settings ───────────────────────────────────────────────────────────────

  async getSettings(): Promise<MarketplaceSettings> {
    return simulateLatency(readDb().settings);
  },

  async saveSettings(settings: MarketplaceSettings): Promise<void> {
    mutateDb((db) => {
      db.settings = settings;
    });
    return simulateLatency(undefined, 400);
  },
};
