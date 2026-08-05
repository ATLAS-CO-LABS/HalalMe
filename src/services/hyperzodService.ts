// Server-side only — never import this in client components

import { COUNTRY_CODES } from "@/data/countryCodes";

const HYPERZOD_BASE_URL = "https://api.hyperzod.app/admin/v1";
const HYPERZOD_TENANT_ID = process.env.HYPERZOD_TENANT_ID ?? "";
const HYPERZOD_API_KEY = process.env.HYPERZOD_API_KEY ?? "";

const HYPERZOD_HEADERS = {
  "Content-Type": "application/json",
  "accept": "application/json",
  "x-api-key": HYPERZOD_API_KEY,
  "x-tenant": HYPERZOD_TENANT_ID,
};

export interface HyperzodCustomerResult {
  id: string | null;
  raw: Record<string, unknown>;
}

export async function createHyperzodCustomer(params: {
  full_name: string;
  email: string;
  phone: string; // stored as "GB:07911123456"
}): Promise<HyperzodCustomerResult | null> {
  if (!HYPERZOD_API_KEY || !HYPERZOD_TENANT_ID) return null;

  const [country_code] = params.phone.split(":");
  if (!country_code) return null;
  // Hyperzod expects the national number without the dialling prefix
  // (7911123456, not 07911123456 or +447911123456).
  const mobile = toNationalDigits(params.phone);
  if (!mobile) return null;

  const nameParts = params.full_name.trim().split(" ");
  const first_name = nameParts[0] ?? "";
  const last_name = nameParts.slice(1).join(" ") || first_name;

  const requestBody = { first_name, last_name, email: params.email, country_code, mobile };

  try {
    const res = await fetch(`${HYPERZOD_BASE_URL}/auth/user/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "x-api-key": HYPERZOD_API_KEY,
        "x-tenant": HYPERZOD_TENANT_ID,
      },
      body: JSON.stringify(requestBody),
    });

    const json = await res.json() as Record<string, unknown>;

    if (!res.ok) {
      console.error("[hyperzod] createCustomer failed", res.status, json);
      return null;
    }

    const data = (json.data ?? {}) as Record<string, unknown>;
    const id = (data.id ?? data.user_id ?? data.customer_id ?? data.userId ?? data.customerId ?? null) as string | null;

    return { id, raw: json };
  } catch (err) {
    console.error("[hyperzod] createCustomer error", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Customer lookup
//
// Hyperzod has no search/filter and no get-by-id for customers: /auth/user/all
// is the only read endpoint (confirmed against their docs + live API). Two
// undocumented behaviours make a lookup practical anyway:
//   • `per_page` is honoured up to 1000, so the whole book is a handful of
//     requests rather than the 550+ the default page size of 10 implies.
//   • Results come back newest-first, so a just-created customer is on page 1.
//
// Numbers are stored E.164 with the prefix ("+447911123456") even though
// /auth/user/add takes the national part and country_code separately, so we
// rebuild the full number from our "GB:07911123456" before comparing.
// ---------------------------------------------------------------------------

const HYPERZOD_PAGE_SIZE = 1000;
const HYPERZOD_MAX_PAGES = 20; // safety ceiling; ~20k customers

/** Digits only, so "+44 7911-123456" and "+447911123456" compare equal. */
function digitsOnly(value: unknown): string {
  return String(value ?? "").replace(/\D/g, "");
}

/**
 * Convert our stored phone into E.164 digits ("447911123456").
 *
 * Two formats exist in profiles.phone and both have to work:
 *   • "GB:7911123456"    — written by /complete-profile (national)
 *   • "GB:+447911123456" — written by the Hyperzod signup webhook, which
 *                          receives the number already internationalised
 * Returns null when the country is unknown or the number is empty.
 */
export function toE164Digits(storedPhone: string): string | null {
  const [iso, rawMobile] = storedPhone.split(":");
  if (!iso || !rawMobile) return null;

  const dial = COUNTRY_CODES.find((c) => c.code === iso.toUpperCase())?.dial;
  if (!dial) return null;

  // Already international — trust it rather than prefixing a second time.
  const raw = rawMobile.trim();
  if (raw.startsWith("+")) return digitsOnly(raw) || null;

  // National numbers carry a trunk zero ("07911...") that is dropped abroad.
  const national = digitsOnly(raw).replace(/^0+/, "");
  if (!national) return null;

  return `${digitsOnly(dial)}${national}`;
}

/**
 * The national part only ("7911123456"), which is what /auth/user/add expects
 * alongside a separate country_code. Accepts either stored format.
 */
export function toNationalDigits(storedPhone: string): string | null {
  const [iso] = storedPhone.split(":");
  const e164 = toE164Digits(storedPhone);
  if (!iso || !e164) return null;

  const dialDigits = digitsOnly(
    COUNTRY_CODES.find((c) => c.code === iso.toUpperCase())?.dial
  );
  return dialDigits && e164.startsWith(dialDigits)
    ? e164.slice(dialDigits.length)
    : e164;
}

export interface HyperzodCustomer {
  id: string;
  mobile: string;
  email: string;
  full_name: string;
  deleted_at: string | null;
  raw: Record<string, unknown>;
}

function toCustomer(row: Record<string, unknown>): HyperzodCustomer {
  return {
    id: String(row.id ?? ""),
    mobile: String(row.mobile ?? ""),
    email: String(row.email ?? ""),
    full_name: String(row.full_name ?? ""),
    deleted_at: (row.deleted_at as string | null) ?? null,
    raw: row,
  };
}

/**
 * Page through the customer list, newest first, returning the first row the
 * predicate accepts. Returns null if nothing matches or the API errors.
 */
async function scanHyperzodCustomers(
  match: (row: Record<string, unknown>) => boolean,
  maxPages: number = HYPERZOD_MAX_PAGES
): Promise<HyperzodCustomer | null> {
  if (!HYPERZOD_API_KEY || !HYPERZOD_TENANT_ID) return null;

  try {
    for (let page = 1; page <= maxPages; page++) {
      const res = await fetch(
        `${HYPERZOD_BASE_URL}/auth/user/all?per_page=${HYPERZOD_PAGE_SIZE}&page=${page}`,
        { method: "GET", headers: HYPERZOD_HEADERS }
      );

      if (!res.ok) {
        console.error("[hyperzod] customer list failed", res.status, "page", page);
        return null;
      }

      const json = (await res.json()) as Record<string, unknown>;
      const pageData = (json.data ?? {}) as Record<string, unknown>;
      const rows = (pageData.data ?? []) as Record<string, unknown>[];

      const hit = rows.find(match);
      if (hit) return toCustomer(hit);

      const lastPage = Number(pageData.last_page ?? page);
      if (page >= lastPage || rows.length === 0) break;
    }
    return null;
  } catch (err) {
    console.error("[hyperzod] customer list error", err);
    return null;
  }
}

/**
 * Find a live (non-deleted) customer by mobile number.
 * `storedPhone` is our own "GB:07911123456" format.
 *
 * `maxPages` bounds the scan. Most people signing up on HalalMe have never
 * ordered, so "not found" is the common outcome — and an unbounded scan would
 * make the slowest path the usual one. Interactive callers pass a small number
 * to check only recent customers; the exhaustive scan is worth paying for once
 * a create has actually failed.
 */
export async function findHyperzodCustomerByMobile(
  storedPhone: string,
  maxPages: number = HYPERZOD_MAX_PAGES
): Promise<HyperzodCustomer | null> {
  const target = toE164Digits(storedPhone);
  if (!target) return null;

  return scanHyperzodCustomers(
    (row) => digitsOnly(row.mobile) === target && !row.deleted_at,
    maxPages
  );
}

/** Pages checked on the interactive signup path (newest ~1000 customers). */
export const HYPERZOD_QUICK_SCAN_PAGES = 1;

/**
 * Look a customer up by id, including soft-deleted ones — callers need to be
 * able to tell "gone" apart from "never existed" when repairing a stale link.
 */
export async function findHyperzodCustomerById(
  customerId: string
): Promise<HyperzodCustomer | null> {
  if (!customerId) return null;
  return scanHyperzodCustomers((row) => String(row.id ?? "") === customerId);
}

export interface HyperzodMerchantResult {
  id: string | null;
  raw: Record<string, unknown>;
}

export async function createHyperzodMerchant(params: {
  name: string;
  email: string;
  phone: string; // full international format e.g. "+441234567890"
  address: string;
  city: string;
  state: string;
  post_code: string;
  country: string;
  country_code: string;
  merchant_category_ids: string[];
  accepted_order_types: string[]; // ["delivery", "pickup"]
}): Promise<HyperzodMerchantResult | null> {
  if (!HYPERZOD_API_KEY || !HYPERZOD_TENANT_ID) return null;

  // Strip spaces/dashes — Hyperzod requires clean E.164 format e.g. +441234567890
  const cleanPhone = params.phone.replace(/(?!^\+)\D/g, "");

  const requestBody = {
    language_translation: [{ key: "name", value: params.name, locale: "en" }],
    name: params.name,
    address: params.address,
    post_code: params.post_code,
    country_code: params.country_code,
    country: params.country,
    state: params.state,
    city: params.city,
    phone: cleanPhone,
    email: params.email,
    merchant_category_ids: params.merchant_category_ids,
    accepted_order_types: params.accepted_order_types,
    status: 0,
    delivery_by: "tenant",
    commission: {
      delivery: { order_type: "delivery", type: "percentage", calculate_on_status: 5, percent_value: 0, fixed: 0 },
      pickup: { order_type: "pickup", type: "percentage", calculate_on_status: 5, percent_value: 0, fixed: 0 },
      custom_1: { order_type: "custom_1", type: "percentage", calculate_on_status: 5, percent_value: 0, fixed: 0 },
    },
    tax_method: "inclusive",
    type: "ecommerce",
  };

  try {
    const res = await fetch(`${HYPERZOD_BASE_URL}/merchant/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "x-api-key": HYPERZOD_API_KEY,
        "x-tenant": HYPERZOD_TENANT_ID,
      },
      body: JSON.stringify(requestBody),
    });

    const json = await res.json() as Record<string, unknown>;

    if (!res.ok) {
      console.error("[hyperzod] createMerchant failed", res.status, json);
      return null;
    }

    const data = (json.data ?? {}) as Record<string, unknown>;
    const id = (data._id ?? data.merchant_id ?? data.id ?? null) as string | null;

    return { id, raw: json };
  } catch (err) {
    console.error("[hyperzod] createMerchant error", err);
    return null;
  }
}

/**
 * Find a single merchant's full object by paging through the list endpoint.
 * Hyperzod has no get-by-id endpoint, so we page until we match on _id.
 * Returns the raw merchant object, or null if not found / on error.
 */
export async function fetchHyperzodMerchant(
  merchantId: string
): Promise<Record<string, unknown> | null> {
  if (!HYPERZOD_API_KEY || !HYPERZOD_TENANT_ID) return null;

  const MAX_PAGES = 50; // safety ceiling

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch(`${HYPERZOD_BASE_URL}/merchant/list?page=${page}`, {
        method: "GET",
        headers: HYPERZOD_HEADERS,
      });

      if (!res.ok) {
        console.error("[hyperzod] fetchMerchant list failed", res.status);
        return null;
      }

      const json = await res.json() as Record<string, unknown>;
      const pageData = (json.data ?? {}) as Record<string, unknown>;
      const merchants = (pageData.data ?? []) as Record<string, unknown>[];

      const match = merchants.find(
        (m) => m._id === merchantId || m.merchant_id === merchantId
      );
      if (match) return match;

      // Stop when we've reached the last page
      const lastPage = Number(pageData.last_page ?? page);
      if (page >= lastPage || merchants.length === 0) break;
    }

    return null;
  } catch (err) {
    console.error("[hyperzod] fetchMerchant error", err);
    return null;
  }
}

export interface HyperzodUpdateResult {
  ok: boolean;
  raw: Record<string, unknown> | null;
}

// Fields that can be overridden on a Hyperzod update
export interface HyperzodMerchantOverrides {
  status?: 0 | 1;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  post_code?: string;
  country?: string;
  country_code?: string;
  owner_name?: string;
  commission_percent?: number | null;
}

// Hyperzod expects commission as a per-order-type map. Each entry must carry
// order_type, type, and calculate_on_status (confirmed via their validator).
function buildCommission(percent: number) {
  const entry = (order_type: string) => ({
    order_type,
    type: "percentage",
    calculate_on_status: 5,
    percent_value: percent,
    fixed: 0,
  });
  return {
    delivery: entry("delivery"),
    pickup: entry("pickup"),
    custom_1: entry("custom_1"),
  };
}

function isValidNestedCommission(c: unknown): boolean {
  if (!c || typeof c !== "object" || Array.isArray(c)) return false;
  const values = Object.values(c as Record<string, unknown>);
  return values.length > 0 && values.every(
    (v) => v != null && typeof v === "object" && "order_type" in (v as object)
  );
}

/**
 * Update a merchant on Hyperzod by merging `overrides` onto their current data.
 *
 * Hyperzod's /merchant/update is a full-object replace requiring many fields
 * (incl. slug + owner_phone we don't store), so we fetch the merchant's current
 * object first, apply only the changed fields, and POST the whole object back.
 * Everything we don't touch is echoed back unchanged.
 */
export async function updateHyperzodMerchant(
  merchantId: string,
  overrides: HyperzodMerchantOverrides
): Promise<HyperzodUpdateResult> {
  if (!HYPERZOD_API_KEY || !HYPERZOD_TENANT_ID) return { ok: false, raw: null };

  const current = await fetchHyperzodMerchant(merchantId);
  if (!current) {
    console.error("[hyperzod] update: merchant not found", merchantId);
    return { ok: false, raw: null };
  }

  const pick = <T,>(key: keyof HyperzodMerchantOverrides, fallback: T) =>
    (overrides[key] !== undefined ? overrides[key] : current[key as string] ?? fallback);

  const name = (overrides.name ?? current.name ?? "") as string;

  // Preserve existing locale translations; only update the en "name" entry if name changed.
  let languageTranslation = current.language_translation as
    | { key?: string; value?: string; locale?: string }[]
    | undefined;
  if (Array.isArray(languageTranslation)) {
    if (overrides.name !== undefined) {
      languageTranslation = languageTranslation.map((t) =>
        t.key === "name" && t.locale === "en" ? { ...t, value: name } : t
      );
    }
  } else {
    languageTranslation = [{ key: "name", value: name, locale: "en" }];
  }

  const requestBody: Record<string, unknown> = {
    id: current._id ?? current.merchant_id ?? merchantId,
    slug: current.slug ?? "",
    language_translation: languageTranslation,
    name,
    address: pick("address", ""),
    post_code: pick("post_code", ""),
    country_code: pick("country_code", "GB"),
    country: pick("country", "United Kingdom"),
    state: pick("state", ""),
    city: pick("city", ""),
    phone: pick("phone", ""),
    email: pick("email", ""),
    merchant_category_ids: current.merchant_category_ids ?? [],
    accepted_order_types: current.accepted_order_types ?? ["delivery"],
    status: overrides.status ?? current.status ?? 0,
    delivery_by: current.delivery_by ?? "tenant",
    owner_name: pick("owner_name", ""),
    owner_phone: current.owner_phone ?? "",
    commission:
      typeof overrides.commission_percent === "number"
        ? buildCommission(overrides.commission_percent)
        : isValidNestedCommission(current.commission)
        ? current.commission
        : buildCommission(0),
    tax_method: current.tax_method ?? "inclusive",
    type: current.type ?? "ecommerce",
  };

  try {
    const res = await fetch(`${HYPERZOD_BASE_URL}/merchant/update`, {
      method: "POST",
      headers: HYPERZOD_HEADERS,
      body: JSON.stringify(requestBody),
    });

    const json = await res.json() as Record<string, unknown>;

    if (!res.ok || json.success === false) {
      console.error("[hyperzod] update failed", res.status, json);
      return { ok: false, raw: json };
    }

    return { ok: true, raw: json };
  } catch (err) {
    console.error("[hyperzod] update error", err);
    return { ok: false, raw: null };
  }
}

/** Activate/deactivate a merchant on Hyperzod (status 0 → 1). */
export function updateHyperzodMerchantStatus(
  merchantId: string,
  status: 0 | 1
): Promise<HyperzodUpdateResult> {
  return updateHyperzodMerchant(merchantId, { status });
}

/**
 * Permanently delete a merchant on Hyperzod.
 * Returns { ok: true } when deleted (or already gone), { ok: false } on failure.
 */
export async function deleteHyperzodMerchant(
  merchantId: string
): Promise<HyperzodUpdateResult> {
  if (!HYPERZOD_API_KEY || !HYPERZOD_TENANT_ID) return { ok: false, raw: null };

  try {
    const res = await fetch(`${HYPERZOD_BASE_URL}/merchant/delete`, {
      method: "POST",
      headers: HYPERZOD_HEADERS,
      body: JSON.stringify({ id: merchantId }),
    });

    const json = await res.json() as Record<string, unknown>;

    // Treat "not found" as success — the merchant is gone either way
    const message = String(json.message ?? "").toLowerCase();
    if (res.ok || json.success === true || message.includes("not found")) {
      return { ok: true, raw: json };
    }

    console.error("[hyperzod] delete failed", res.status, json);
    return { ok: false, raw: json };
  } catch (err) {
    console.error("[hyperzod] delete error", err);
    return { ok: false, raw: null };
  }
}
