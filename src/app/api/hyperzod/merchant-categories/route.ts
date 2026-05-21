import { NextResponse } from "next/server";

const HYPERZOD_BASE_URL = "https://api.hyperzod.app/admin/v1";
const HYPERZOD_TENANT_ID = process.env.HYPERZOD_TENANT_ID ?? "";
const HYPERZOD_API_KEY = process.env.HYPERZOD_API_KEY ?? "";

export async function GET() {
  if (!HYPERZOD_API_KEY || !HYPERZOD_TENANT_ID) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(`${HYPERZOD_BASE_URL}/merchant/merchant-categories/list`, {
      headers: {
        "accept": "application/json",
        "x-api-key": HYPERZOD_API_KEY,
        "x-tenant": HYPERZOD_TENANT_ID,
      },
      next: { revalidate: 3600 },
    });

    const json = await res.json() as Record<string, unknown>;

    if (!res.ok) {
      console.error("[hyperzod] merchant-categories failed", res.status, json);
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 502 });
    }

    return NextResponse.json(json);
  } catch (err) {
    console.error("[hyperzod] merchant-categories error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
