"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { useMarketplaceQuery } from "@/hooks/useMarketplaceQuery";
import type { MarketplaceSort } from "@/types/marketplace";
import { ProductGrid } from "@/components/marketplace/ProductCard";
import { Notice } from "@/components/marketplace/shared";
import { BG, BG2, BLUE, CREAM, DEEP } from "@/components/marketplace/theme";

const SORT_OPTIONS: { value: MarketplaceSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "title", label: "Name: A to Z" },
];

/**
 * Searchable, sortable product grid. Pass `category` or `vendor` to lock the
 * listing to one of them; with neither, category chips are shown instead.
 */
export default function ProductListing({
  category,
  vendor,
  initialQuery = "",
}: {
  category?: string;
  vendor?: string;
  initialQuery?: string;
}) {
  const [draft, setDraft] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<MarketplaceSort>("featured");

  const { data: products, error, loading } = useMarketplaceQuery(
    `products:${category ?? ""}:${vendor ?? ""}:${query}:${sort}`,
    () => marketplaceService.listProducts({ category, vendor, query, sort }),
  );

  const showCategoryChips = !category && !vendor;
  const { data: categories } = useMarketplaceQuery("categories", () => marketplaceService.listCategories());

  const clearSearch = () => {
    setDraft("");
    setQuery("");
  };

  return (
    <section className="py-10 md:py-14" style={{ backgroundColor: BG }}>
      <div className="max-w-[95vw] mx-auto px-6 md:px-10">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
          <form
            role="search"
            className="flex flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(draft.trim());
            }}
          >
            <label htmlFor="marketplace-search" className="sr-only">
              Search products
            </label>
            <div
              className="flex flex-1 items-center gap-3 px-4"
              style={{ backgroundColor: BG2, border: `1px solid ${BLUE}50`, borderRight: "none" }}
            >
              <Search className="w-4 h-4 shrink-0" style={{ color: BLUE }} aria-hidden="true" />
              <input
                id="marketplace-search"
                type="search"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Search products and sellers"
                className="w-full h-12 bg-transparent text-sm outline-none placeholder:text-[#F7E7CE]/50"
                style={{ color: CREAM }}
              />
            </div>
            <button
              type="submit"
              className="px-6 h-12 font-extrabold uppercase tracking-tighter text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: DEEP, border: `1px solid ${DEEP}` }}
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3">
            <label
              htmlFor="marketplace-sort"
              className="text-[10px] font-bold uppercase tracking-[0.2em] shrink-0"
              style={{ color: `${CREAM}75` }}
            >
              Sort
            </label>
            <select
              id="marketplace-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as MarketplaceSort)}
              className="h-12 px-4 text-sm font-semibold outline-none cursor-pointer flex-1 md:flex-none"
              style={{ backgroundColor: BG2, color: CREAM, border: `1px solid ${BLUE}50` }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category chips */}
        {showCategoryChips && categories && (
          <ul className="flex flex-wrap gap-2 mb-8">
            {categories.map((c) => (
              <li key={c.handle}>
                <Link
                  href={`/marketplace/c/${c.handle}`}
                  className="block text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-2 transition-colors hover:text-white hover:bg-white/5"
                  style={{ color: `${CREAM}75`, border: `1px solid ${BLUE}50` }}
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Result line */}
        <div
          className="flex items-center gap-4 mb-4 min-h-6 text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: `${CREAM}75` }}
          aria-live="polite"
        >
          {!loading && products && (
            <span>
              {products.length} {products.length === 1 ? "product" : "products"}
              {query && ` for "${query}"`}
            </span>
          )}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="flex items-center gap-1.5 uppercase tracking-[0.2em] transition-colors hover:text-white"
              style={{ color: BLUE }}
            >
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>

        {/* Grid */}
        {error ? (
          <Notice title="Something Went Wrong" message="We could not load products. Please refresh and try again." />
        ) : !loading && products && products.length === 0 ? (
          <Notice
            title="Nothing Here Yet"
            message={
              query
                ? "No products match that search. Try a different word or clear the search."
                : "There are no products in this section yet. Check back soon."
            }
            actionHref={query ? undefined : "/marketplace/shop"}
            actionLabel={query ? undefined : "Shop All"}
          />
        ) : (
          <ProductGrid products={loading ? null : products} />
        )}
      </div>
    </section>
  );
}
