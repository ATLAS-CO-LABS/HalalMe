"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin, RotateCcw, Truck } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { useMarketplaceQuery } from "@/hooks/useMarketplaceQuery";
import ProductListing from "@/components/marketplace/ProductListing";
import { Notice } from "@/components/marketplace/shared";
import { BG2, BLUE, CREAM, formatPrice } from "@/components/marketplace/theme";
import { SellerLogo } from "@/components/marketplace/SellerLogo";

export default function MarketplaceSellerPage() {
  const { handle } = useParams<{ handle: string }>();

  const { data: seller, loading } = useMarketplaceQuery(`vendor:${handle}`, () => marketplaceService.getVendor(handle));

  if (!loading && !seller) {
    return (
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 py-16">
        <Notice
          title="Seller Not Found"
          message="This store does not exist or is not open at the moment."
          actionHref="/marketplace/sellers"
          actionLabel="All Sellers"
        />
      </div>
    );
  }

  const facts = seller
    ? [
        { icon: MapPin, text: seller.location },
        {
          icon: Truck,
          text: `${seller.deliveryRate === 0 ? "Free UK delivery" : `${formatPrice(seller.deliveryRate)} UK delivery`}${
            seller.freeDeliveryOver !== null && seller.deliveryRate > 0 ? `, free over ${formatPrice(seller.freeDeliveryOver)}` : ""
          }. ${seller.dispatch}.`,
        },
        { icon: RotateCcw, text: `${seller.returnsDays}-day returns` },
      ]
    : [];

  return (
    <>
      <header style={{ backgroundColor: BG2, borderBottom: `1px solid ${BLUE}50` }}>
        {seller?.banner && (
          <div className="h-32 md:h-48 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- seller upload */}
            <img src={seller.banner} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 py-10 md:py-14">
          <Link href="/marketplace/sellers" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 transition-colors hover:text-white" style={{ color: `${CREAM}B3` }}>
            <ArrowLeft className="w-3.5 h-3.5" /> All sellers
          </Link>

          {seller ? (
            <>
              <div className="flex items-center gap-5">
                <SellerLogo seller={seller} size={72} />
                <div className="min-w-0">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.9]" style={{ color: CREAM }}>
                    {seller.name}
                  </h1>
                  {seller.tagline && (
                    <p className="text-sm md:text-base mt-2" style={{ color: BLUE }}>
                      {seller.tagline}
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-6 max-w-2xl text-sm md:text-base leading-relaxed" style={{ color: `${CREAM}CC`, fontFamily: "var(--font-body)" }}>
                {seller.about}
              </p>
              <ul className="flex flex-wrap gap-x-8 gap-y-2 mt-6">
                {facts.map((fact) => (
                  <li key={fact.text} className="flex items-center gap-2 text-xs font-semibold" style={{ color: `${CREAM}B3` }}>
                    <fact.icon className="w-4 h-4 shrink-0" style={{ color: BLUE }} aria-hidden="true" />
                    {fact.text}
                  </li>
                ))}
              </ul>
              {seller.returnsPolicy && (
                <p className="mt-4 max-w-2xl text-xs leading-relaxed" style={{ color: `${CREAM}80` }}>
                  Returns: {seller.returnsPolicy}
                </p>
              )}
            </>
          ) : (
            <div className="animate-pulse space-y-4" aria-busy="true">
              <div className="h-12 w-72" style={{ backgroundColor: `${BLUE}30` }} />
              <div className="h-4 w-96 max-w-full" style={{ backgroundColor: `${BLUE}30` }} />
            </div>
          )}
        </div>
      </header>

      <ProductListing key={handle} vendor={handle} />
    </>
  );
}
