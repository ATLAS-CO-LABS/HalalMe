"use client";

import { marketplaceService } from "@/services/marketplaceService";
import { useMarketplaceQuery } from "@/hooks/useMarketplaceQuery";
import { useMarketplaceSaved } from "@/context/MarketplaceSavedContext";
import { ProductGrid } from "@/components/marketplace/ProductCard";
import { Notice, PageHeader } from "@/components/marketplace/shared";
import { BG, CREAM } from "@/components/marketplace/theme";

export default function MarketplaceSavedPage() {
  const { saved, isReady } = useMarketplaceSaved();
  // Keyed on the list itself, so un-saving a card drops it from the grid.
  const { data: products, loading } = useMarketplaceQuery(`saved:${isReady ? saved.join(",") : "pending"}`, () =>
    isReady ? marketplaceService.getProducts(saved) : Promise.resolve(null),
  );

  const unavailable = isReady && products ? saved.length - products.length : 0;

  return (
    <>
      <PageHeader eyebrow="Saved" title="Saved Items" description="Products you have saved for later. Tap the heart on any product to add it here." />

      <section className="py-10 md:py-14" style={{ backgroundColor: BG }}>
        <div className="max-w-[95vw] mx-auto px-6 md:px-10">
          {isReady && saved.length === 0 ? (
            <Notice
              title="Nothing Saved Yet"
              message="Tap the heart on a product to keep it here for later."
              actionHref="/marketplace/shop"
              actionLabel="Start Shopping"
            />
          ) : (
            <>
              <ProductGrid products={loading || !products ? null : products} skeletonCount={4} />
              {unavailable > 0 && (
                <p className="text-xs mt-4" style={{ color: `${CREAM}B3` }}>
                  {unavailable} saved item{unavailable === 1 ? " is" : "s are"} no longer available.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
