// Server-side only — never import this in client components


const HYPERZOD_BASE_URL = "https://api.hyperzod.app/admin/v1";
const HYPERZOD_TENANT_ID = process.env.HYPERZOD_TENANT_ID ?? "";
const HYPERZOD_API_KEY = process.env.HYPERZOD_API_KEY ?? "";

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

  const [country_code, rawMobile] = params.phone.split(":");
  if (!country_code || !rawMobile) return null;
  // Strip leading zeros — Hyperzod expects national number without prefix (e.g. 7911123456 not 07911123456)
  const mobile = rawMobile.replace(/^0+/, "");

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

const HYPERZOD_HEADERS = {
  "Content-Type": "application/json",
  "accept": "application/json",
  "x-api-key": HYPERZOD_API_KEY,
  "x-tenant": HYPERZOD_TENANT_ID,
};

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
