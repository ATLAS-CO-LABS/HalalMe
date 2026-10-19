"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Package, Search, ShoppingBag } from "lucide-react";
import { useMarketplaceCart } from "@/context/MarketplaceCartContext";
import { useMarketplaceSaved } from "@/context/MarketplaceSavedContext";
import { BG, BG2, BLUE, CREAM, DEEP } from "@/components/marketplace/theme";

const LINKS = [
  { href: "/marketplace", label: "Home", exact: true },
  { href: "/marketplace/shop", label: "Shop All", exact: false },
  { href: "/marketplace/sellers", label: "Sellers", exact: false },
  { href: "/marketplace/help", label: "Help", exact: false },
  { href: "/marketplace/sell", label: "Sell", exact: false },
];

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="min-w-5 h-5 px-1.5 flex items-center justify-center text-[10px] font-extrabold tracking-normal text-white tabular-nums"
      style={{ backgroundColor: DEEP }}
    >
      {count}
    </span>
  );
}

/** Section bar pinned under the site header on every Marketplace page. */
export default function MarketplaceNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalQuantity, isReady } = useMarketplaceCart();
  const { saved, isReady: savedReady } = useMarketplaceSaved();
  const [query, setQuery] = useState("");

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    router.push(term ? `/marketplace/shop?q=${encodeURIComponent(term)}` : "/marketplace/shop");
    setQuery("");
  };

  const iconLink = "flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:text-white";
  const tone = (href: string) => ({ color: pathname?.startsWith(href) ? BLUE : CREAM });

  return (
    <nav
      aria-label="Marketplace"
      className="sticky top-16 z-40"
      style={{ backgroundColor: BG2, borderBottom: `1px solid ${BLUE}50` }}
    >
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 h-12 flex items-center gap-4 lg:gap-6">
        <ul className="flex items-center gap-5 lg:gap-7 overflow-x-auto scrollbar-hide flex-1 lg:flex-none">
          {LINKS.map((link) => {
            const active = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
            return (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-colors hover:text-white"
                  style={{ color: active ? BLUE : `${CREAM}B3` }}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <form role="search" onSubmit={search} className="hidden lg:flex flex-1 max-w-md ml-auto">
          <label htmlFor="marketplace-nav-search" className="sr-only">
            Search the marketplace
          </label>
          <div className="flex flex-1 items-center gap-2.5 px-3 h-8" style={{ backgroundColor: BG, border: `1px solid ${BLUE}50` }}>
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: BLUE }} aria-hidden="true" />
            <input
              id="marketplace-nav-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products and sellers"
              className="w-full bg-transparent text-xs outline-none placeholder:text-[#F7E7CE]/50"
              style={{ color: CREAM }}
            />
          </div>
        </form>

        <div className="flex items-center gap-4 sm:gap-5 shrink-0 lg:ml-0 ml-auto">
          <Link href="/marketplace/shop" className={`${iconLink} lg:hidden`} style={{ color: CREAM }} aria-label="Search">
            <Search className="w-4 h-4" />
          </Link>
          <Link href="/marketplace/saved" className={iconLink} style={tone("/marketplace/saved")} aria-label={`Saved items${savedReady ? `, ${saved.length}` : ""}`}>
            <Heart className="w-4 h-4" />
            <span className="hidden xl:inline">Saved</span>
            {savedReady && <CountBadge count={saved.length} />}
          </Link>
          <Link href="/marketplace/orders" className={iconLink} style={tone("/marketplace/orders")} aria-label="Your orders">
            <Package className="w-4 h-4" />
            <span className="hidden xl:inline">Orders</span>
          </Link>
          <Link
            href="/marketplace/cart"
            className={iconLink}
            style={tone("/marketplace/cart")}
            aria-label={isReady ? `Basket, ${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}` : "Basket"}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Basket</span>
            {isReady && <CountBadge count={totalQuantity} />}
          </Link>
        </div>
      </div>
    </nav>
  );
}
