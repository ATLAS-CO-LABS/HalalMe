import type { Metadata } from "next";
import { cldUrl } from "@/lib/cldUrl";

// Open Graph image size convention (1.91:1).
const OG_IMG = "f_auto,q_auto,c_fill,w_1200,h_630";

// Server-rendered metadata so each cause gets its own title, description and
// canonical instead of silently inheriting /charity's (every cause page was
// reporting itself as a duplicate of the charity listing — see WA indexing
// audit). The page itself is a client component and can't emit these tags.
// [charityId] is matched by slug first, then id — same lookup order as the
// client page.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ charityId: string }>;
}): Promise<Metadata> {
  const { charityId } = await params;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const fallback: Metadata = {
    title: "Cause · HalalMe Charity",
    alternates: { canonical: `/charity/causes/${charityId}` },
  };
  if (!base || !key) return fallback;

  try {
    const headers = { apikey: key, Authorization: `Bearer ${key}` };
    const fetchOpts = { headers, next: { revalidate: 300 } };
    const fields = "name,description,image_url";

    let res = await fetch(
      `${base}/rest/v1/charities?slug=eq.${charityId}&select=${fields}&limit=1`,
      fetchOpts,
    );
    let rows = res.ok ? ((await res.json()) as Array<{ name?: string; description?: string | null; image_url?: string | null }>) : [];

    if (!rows?.[0]) {
      res = await fetch(
        `${base}/rest/v1/charities?id=eq.${charityId}&select=${fields}&limit=1`,
        fetchOpts,
      );
      rows = res.ok ? await res.json() : [];
    }

    const charity = rows?.[0];
    if (!charity?.name) return fallback;

    const title = `${charity.name} · HalalMe Charity`;
    const description =
      charity.description?.trim() || "Give sadaqah and zakat through HalalMe Charity.";
    const image = charity.image_url ? cldUrl(charity.image_url, OG_IMG) : undefined;

    return {
      title,
      description,
      alternates: { canonical: `/charity/causes/${charityId}` },
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "HalalMe",
        images: image
          ? [{ url: image, width: 1200, height: 630, alt: charity.name }]
          : undefined,
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return fallback;
  }
}

export default function CharityCauseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
