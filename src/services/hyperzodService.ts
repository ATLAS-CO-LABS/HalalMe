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
