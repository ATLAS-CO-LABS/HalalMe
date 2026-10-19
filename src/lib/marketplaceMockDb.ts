// Stand-in database for the Marketplace vendor system.
//
// SIMULATED. Nothing here reaches a server: the whole dataset lives in this
// browser's localStorage, so vendor and admin screens can act on the same
// records and a change made in one shows up in the other. vendorService and
// marketplaceAdminService are the only callers. When the real backend exists,
// those two services swap this module for API calls and it can be deleted.

import { buildSeed } from "@/data/marketplaceVendorMockData";
import type {
  MarketplaceSettings,
  Payout,
  Promotion,
  SupportTicket,
  Vendor,
  VendorNotification,
  VendorOrder,
  VendorProduct,
} from "@/types/marketplaceVendor";

export interface MarketplaceDb {
  vendors: Vendor[];
  products: VendorProduct[];
  orders: VendorOrder[];
  payouts: Payout[];
  promotions: Promotion[];
  notifications: VendorNotification[];
  tickets: SupportTicket[];
  settings: MarketplaceSettings;
}

// Bump the suffix whenever the seed or the shape changes, so stale browsers reseed.
const DB_KEY = "halalme-marketplace-demo-db-v1";
const SESSION_KEY = "halalme-marketplace-demo-vendor";

/** The vendor a fresh browser is signed in as, so the portal has something to show. */
export const DEFAULT_DEMO_VENDOR = "noor-and-co";

const hasStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function readDb(): MarketplaceDb {
  if (!hasStorage()) return buildSeed();
  const stored = window.localStorage.getItem(DB_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as MarketplaceDb;
    } catch {
      window.localStorage.removeItem(DB_KEY);
    }
  }
  const seed = buildSeed();
  writeDb(seed);
  return seed;
}

function writeDb(db: MarketplaceDb) {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // Storage is full, almost always from uploaded images.
    throw new Error("This browser's demo storage is full. Remove some product images or reset the demo data.");
  }
}

/** Read, change and save in one step. Returns whatever the callback returns. */
export function mutateDb<T>(change: (db: MarketplaceDb) => T): T {
  const db = readDb();
  const result = change(db);
  writeDb(db);
  return result;
}

export function resetDb() {
  if (!hasStorage()) return;
  window.localStorage.removeItem(DB_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}

/** Which vendor this browser is acting as. Stands in for the signed-in user. */
export function getSessionVendorId(): string | null {
  if (!hasStorage()) return null;
  const stored = window.localStorage.getItem(SESSION_KEY);
  // "none" is the signed-out state, used to reach the signup page.
  if (stored === "none") return null;
  return stored ?? DEFAULT_DEMO_VENDOR;
}

export function setSessionVendorId(id: string | null) {
  if (!hasStorage()) return;
  window.localStorage.setItem(SESSION_KEY, id ?? "none");
}

/** A short pause so loading states are visible, as they will be with a real API. */
export function simulateLatency<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

/** Add a notification for a vendor. Call inside mutateDb. */
export function pushNotification(
  db: MarketplaceDb,
  vendorId: string,
  note: Pick<VendorNotification, "kind" | "title" | "body" | "href">,
) {
  db.notifications.unshift({ id: newId("n"), vendorId, at: new Date().toISOString(), read: false, ...note });
}

/** The commission rate that applies to a vendor's sale in a category. */
export function resolveCommissionRate(db: MarketplaceDb, vendor: Vendor, category?: string): number {
  if (vendor.commissionRate !== null) return vendor.commissionRate;
  if (category && db.settings.categoryRates[category] !== undefined) return db.settings.categoryRates[category];
  return db.settings.defaultCommissionRate;
}
