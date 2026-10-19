"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductListing from "@/components/marketplace/ProductListing";
import { PageHeader } from "@/components/marketplace/shared";

function ShopListing() {
  const initialQuery = useSearchParams().get("q") ?? "";
  // Keyed so arriving with a different ?q= resets the search box
  return <ProductListing key={initialQuery} initialQuery={initialQuery} />;
}

export default function MarketplaceShopPage() {
  return (
    <>
      <PageHeader
        eyebrow="Shop All"
        title="Everything on the Shelves"
        description="Every product from every seller we stock. Search, sort, or jump into a category."
      />
      <Suspense fallback={null}>
        <ShopListing />
      </Suspense>
    </>
  );
}
