"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useMarketplaceSaved } from "@/context/MarketplaceSavedContext";
import type { MarketplaceImage, MarketplaceProduct } from "@/types/marketplace";
import { BG, BG2, BG_HOVER, BLUE, CREAM, CategoryIcon, formatPrice } from "@/components/marketplace/theme";

/** Product photo, or a category-icon tile when the seller has not added one. */
export function ProductImage({
  image,
  categoryHandle,
  className = "",
}: {
  image: MarketplaceImage | null;
  categoryHandle: string;
  className?: string;
}) {
  if (!image) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: BG2 }}>
        <CategoryIcon
          handle={categoryHandle}
          className="w-1/4 h-1/4 max-w-16 max-h-16"
          style={{ color: `${BLUE}70` }}
          aria-hidden="true"
        />
      </div>
    );
  }

  // Seller photos are uploads (data URLs today, a storage or Shopify CDN URL
  // later), so they are rendered as plain images rather than through next/image.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={image.url} alt={image.alt} loading="lazy" className={`absolute inset-0 w-full h-full object-cover ${className}`} />;
}

export function SaveButton({ handle, title, className = "" }: { handle: string; title: string; className?: string }) {
  const { isSaved, toggle, isReady } = useMarketplaceSaved();
  const saved = isReady && isSaved(handle);
  return (
    <button
      type="button"
      onClick={() => toggle(handle)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved items` : `Save ${title} for later`}
      className={`w-9 h-9 flex items-center justify-center transition-colors hover:text-white ${className}`}
      style={{ backgroundColor: `${BG}E6`, border: `1px solid ${saved ? BLUE : `${CREAM}40`}`, color: saved ? BLUE : CREAM }}
    >
      <Heart className="w-4 h-4" fill={saved ? BLUE : "none"} />
    </button>
  );
}

export function ProductCard({ product }: { product: MarketplaceProduct }) {
  const soldOut = product.variants.every((v) => !v.available);
  const hasPriceRange = product.variants.some((v) => v.price !== product.price);
  const wasPrice = product.variants[0]?.compareAtPrice ?? null;

  return (
    <div
      className="group relative flex flex-col h-full transition-colors duration-300"
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BG_HOVER)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG)}
      style={{ backgroundColor: BG, border: `1px solid ${BLUE}50` }}
    >
      {/* The save button sits outside the link so the two controls do not nest. */}
      <SaveButton handle={product.handle} title={product.title} className="absolute top-3 right-3 z-10" />

      <Link href={`/marketplace/p/${product.handle}`} className="flex flex-col flex-1">
        <div className="relative aspect-[4/5] overflow-hidden">
          <ProductImage
            image={product.images[0] ?? null}
            categoryHandle={product.category.handle}
            className="transition-transform duration-700 group-hover:scale-105"
          />
          {soldOut && (
            <span
              className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-1"
              style={{ backgroundColor: BG, color: CREAM, border: `1px solid ${CREAM}40` }}
            >
              Sold out
            </span>
          )}
        </div>
        <div className="p-4 md:p-6 flex flex-col flex-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: BLUE }}>
            {product.vendor.name}
          </span>
          <h3
            className="text-sm md:text-lg font-extrabold uppercase tracking-tighter mb-4 flex-1 transition-colors duration-300 group-hover:text-white"
            style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
          >
            {product.title}
          </h3>
          <span className="flex flex-wrap items-baseline gap-x-2 text-base md:text-lg font-extrabold tracking-tighter" style={{ color: CREAM }}>
            {hasPriceRange && (
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: `${CREAM}B3` }}>
                From
              </span>
            )}
            {formatPrice(product.price)}
            {wasPrice !== null && wasPrice > product.price && (
              <span className="text-xs font-semibold line-through" style={{ color: `${CREAM}80` }}>
                {formatPrice(wasPrice)}
              </span>
            )}
          </span>
        </div>
      </Link>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="h-full animate-pulse" style={{ backgroundColor: BG, border: `1px solid ${BLUE}50` }}>
      <div className="aspect-[4/5]" style={{ backgroundColor: BG2 }} />
      <div className="p-5 md:p-6 space-y-3">
        <div className="h-2.5 w-1/3" style={{ backgroundColor: BG2 }} />
        <div className="h-4 w-4/5" style={{ backgroundColor: BG2 }} />
        <div className="h-4 w-1/4" style={{ backgroundColor: BG2 }} />
      </div>
    </div>
  );
}

/** The 1px-ruled product grid. Pass `products={null}` while loading. */
export function ProductGrid({
  products,
  skeletonCount = 8,
}: {
  products: MarketplaceProduct[] | null;
  skeletonCount?: number;
}) {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4"
      style={{ gap: "1px", backgroundColor: `${BLUE}50` }}
      aria-busy={products === null}
    >
      {products === null
        ? Array.from({ length: skeletonCount }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
