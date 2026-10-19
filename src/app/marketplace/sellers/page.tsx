"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Truck } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { useMarketplaceQuery } from "@/hooks/useMarketplaceQuery";
import { SellerLogo } from "@/components/marketplace/SellerLogo";
import { Notice, PageHeader } from "@/components/marketplace/shared";
import { BG, BG2, BG_HOVER, BLUE, CREAM } from "@/components/marketplace/theme";

export default function MarketplaceSellersPage() {
  const { data: sellers, loading, error } = useMarketplaceQuery("vendors", () => marketplaceService.listVendors());

  return (
    <>
      <PageHeader
        eyebrow="Sellers"
        title="Meet the Sellers"
        description="Every store here is an independent business that HalalMe has verified. Buy from as many as you like in one basket."
      />

      <section className="py-10 md:py-14" style={{ backgroundColor: BG }}>
        <div className="max-w-[95vw] mx-auto px-6 md:px-10">
          {error ? (
            <Notice title="Something Went Wrong" message="We could not load the sellers. Please refresh and try again." />
          ) : loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "1px", backgroundColor: `${BLUE}50` }} aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-56 animate-pulse" style={{ backgroundColor: BG2 }} />
              ))}
            </div>
          ) : !sellers || sellers.length === 0 ? (
            <Notice title="No Sellers Yet" message="Stores will appear here as soon as they open." actionHref="/marketplace/sell" actionLabel="Sell on HalalMe" />
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "1px", backgroundColor: `${BLUE}50` }}>
              {sellers.map((seller) => (
                <li key={seller.handle}>
                  <Link
                    href={`/marketplace/sellers/${seller.handle}`}
                    className="group flex flex-col h-full p-6 md:p-8 transition-colors duration-300"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BG_HOVER)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG2)}
                    style={{ backgroundColor: BG2, border: `1px solid ${BLUE}50` }}
                  >
                    <div className="flex items-center gap-4 mb-5">
                      <SellerLogo seller={seller} />
                      <div className="min-w-0">
                        <h2 className="text-xl font-extrabold uppercase tracking-tighter truncate" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
                          {seller.name}
                        </h2>
                        <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: `${CREAM}B3` }}>
                          <MapPin className="w-3 h-3" /> {seller.location}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed flex-1 line-clamp-3" style={{ color: `${CREAM}CC`, fontFamily: "var(--font-body)" }}>
                      {seller.tagline || seller.about}
                    </p>
                    <div className="flex items-center justify-between gap-3 mt-6 pt-4" style={{ borderTop: `1px solid ${BLUE}30` }}>
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: `${CREAM}B3` }}>
                        <Truck className="w-3.5 h-3.5" style={{ color: BLUE }} />
                        {seller.productCount} product{seller.productCount === 1 ? "" : "s"}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: BLUE }}>
                        Visit store <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
