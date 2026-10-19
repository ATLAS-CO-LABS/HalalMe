// Aggregation helpers shared by the vendor and admin Marketplace services.
// With a real backend these become SQL or API aggregates; the shapes they
// return are what the pages consume, so those stay the same.

import type { OrderStatus, SeriesPoint, VendorOrder } from "@/types/marketplaceVendor";

export const DAY_MS = 86_400_000;

const NOT_A_SALE: OrderStatus[] = ["cancelled", "refunded"];

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function isSale(order: VendorOrder): boolean {
  return !NOT_A_SALE.includes(order.status);
}

export function placedBetween(order: VendorOrder, from: number, to: number): boolean {
  const at = new Date(order.placedAt).getTime();
  return at >= from && at < to;
}

export function sumTotal(orders: VendorOrder[]): number {
  return round2(orders.reduce((sum, o) => sum + o.total, 0));
}

/** Percentage change against the previous period, or null when there is nothing to compare with. */
export function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Bucket orders into a time series ending today. Daily points up to a month,
 * weekly beyond that so a 90-day chart is not ninety thin bars.
 */
export function timeSeries(
  orders: VendorOrder[],
  days: number,
  value: (order: VendorOrder) => number,
  now = Date.now(),
): SeriesPoint[] {
  const bucketDays = days > 31 ? 7 : 1;
  const bucketCount = Math.ceil(days / bucketDays);
  const endOfToday = new Date(now);
  endOfToday.setHours(24, 0, 0, 0);
  const end = endOfToday.getTime();

  const points: SeriesPoint[] = [];
  for (let i = bucketCount - 1; i >= 0; i--) {
    const to = end - i * bucketDays * DAY_MS;
    const from = to - bucketDays * DAY_MS;
    const total = orders.filter((o) => placedBetween(o, from, to)).reduce((sum, o) => sum + value(o), 0);
    points.push({
      label: new Date(from).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      value: round2(total),
    });
  }
  return points;
}

/** What a vendor is owed now, and what is still on its way to being owed. */
export function balanceOf(orders: VendorOrder[]) {
  const available = orders.filter((o) => o.status === "delivered" && o.payoutId === null);
  const pending = orders.filter((o) => ["new", "accepted", "packed", "shipped"].includes(o.status));
  return {
    available: round2(available.reduce((sum, o) => sum + o.vendorNet, 0)),
    availableOrders: available,
    pending: round2(pending.reduce((sum, o) => sum + o.vendorNet, 0)),
  };
}

/** The next scheduled payout date for a given cadence. */
export function nextPayoutDate(schedule: "weekly" | "fortnightly" | "monthly", now = Date.now()): string {
  const date = new Date(now);
  if (schedule === "monthly") {
    date.setMonth(date.getMonth() + 1, 1);
  } else {
    // Payouts go out on Fridays.
    const untilFriday = (5 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + untilFriday + (schedule === "fortnightly" ? 7 : 0));
  }
  date.setHours(9, 0, 0, 0);
  return date.toISOString();
}
