"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { useMarketplaceQuery } from "@/hooks/useMarketplaceQuery";
import { formatDate, Notice, PageHeader, ParcelBadge } from "@/components/marketplace/shared";
import { BG, BG2, BG_HOVER, BLUE, CREAM, formatPrice } from "@/components/marketplace/theme";

export default function MarketplaceOrdersPage() {
  const { data: orders, loading, error } = useMarketplaceQuery("my-orders", () => marketplaceService.listMyOrders());

  return (
    <>
      <PageHeader eyebrow="Your orders" title="Your Orders" description="Track each parcel and see what you have bought." />

      <section className="py-10 md:py-14" style={{ backgroundColor: BG }}>
        <div className="max-w-[95vw] mx-auto px-6 md:px-10">
          {error ? (
            <Notice title="Something Went Wrong" message="We could not load your orders. Please refresh and try again." />
          ) : loading ? (
            <div className="space-y-4" aria-busy="true">
              {[0, 1].map((i) => (
                <div key={i} className="h-32 animate-pulse" style={{ backgroundColor: BG2 }} />
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <Notice
              title="No Orders Yet"
              message="When you buy something, it will appear here with tracking for each parcel."
              actionHref="/marketplace/shop"
              actionLabel="Start Shopping"
            />
          ) : (
            <ul className="space-y-4 max-w-4xl">
              {orders.map((order) => {
                const itemCount = order.parcels.reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.quantity, 0), 0);
                return (
                  <li key={order.id}>
                    <Link
                      href={`/marketplace/orders/${order.id}`}
                      className="group block p-5 md:p-6 transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BG_HOVER)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG2)}
                      style={{ backgroundColor: BG2, border: `1px solid ${BLUE}50` }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: `${CREAM}B3` }}>
                            Placed {formatDate(order.placedAt)}
                          </p>
                          <p className="text-lg font-extrabold uppercase tracking-tighter mt-1" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
                            {itemCount} item{itemCount === 1 ? "" : "s"} · {formatPrice(order.total)}
                          </p>
                        </div>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: BLUE }}>
                          View order <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                      <ul className="space-y-2.5">
                        {order.parcels.map((parcel) => (
                          <li key={parcel.orderNumber} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
                            <span className="text-sm min-w-0" style={{ color: `${CREAM}CC` }}>
                              <strong style={{ color: CREAM }}>{parcel.vendor.name}</strong>: {parcel.items.map((i) => `${i.quantity} × ${i.title}`).join(", ")}
                            </span>
                            <ParcelBadge status={parcel.status} />
                          </li>
                        ))}
                      </ul>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
