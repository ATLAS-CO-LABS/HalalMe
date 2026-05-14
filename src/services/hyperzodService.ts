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
