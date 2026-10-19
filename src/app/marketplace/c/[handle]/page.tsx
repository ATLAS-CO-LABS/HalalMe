"use client";

import { useParams } from "next/navigation";
import { marketplaceService } from "@/services/marketplaceService";
import { useMarketplaceQuery } from "@/hooks/useMarketplaceQuery";
import ProductListing from "@/components/marketplace/ProductListing";
import { Notice, PageHeader } from "@/components/marketplace/shared";

export default function MarketplaceCategoryPage() {
  const { handle } = useParams<{ handle: string }>();

  const { data: category, loading } = useMarketplaceQuery(`category:${handle}`, () =>
    marketplaceService.getCategory(handle),
  );

  if (!loading && !category) {
    return (
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 py-16">
        <Notice
          title="Category Not Found"
          message="This category does not exist or has been moved."
          actionHref="/marketplace/shop"
          actionLabel="Shop All"
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={category?.title ?? "Loading"}
        description={category?.description}
      />
      <ProductListing key={handle} category={handle} />
    </>
  );
}
