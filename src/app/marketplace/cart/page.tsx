"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Tag, Trash2, Truck, X } from "lucide-react";
import { useMarketplaceCart } from "@/context/MarketplaceCartContext";
import type { CartSellerGroup, MarketplaceCartLine } from "@/types/marketplace";
import { ProductImage } from "@/components/marketplace/ProductCard";
import { CartTotals, useCartQuote } from "@/components/marketplace/CartSummary";
import { darkInputClass, Notice, PageHeader, Panel, QuantityStepper } from "@/components/marketplace/shared";
import { BG, BG2, BLUE, CREAM, DEEP, formatPrice } from "@/components/marketplace/theme";

/** One group per seller, used until the priced quote arrives so the basket never flashes empty. */
function groupBySeller(lines: MarketplaceCartLine[]): Pick<CartSellerGroup, "vendor" | "lines">[] {
  const groups = new Map<string, Pick<CartSellerGroup, "vendor" | "lines">>();
  for (const line of lines) {
    const group = groups.get(line.vendor.handle) ?? { vendor: line.vendor, lines: [] };
    group.lines.push(line);
    groups.set(line.vendor.handle, group);
  }
  return [...groups.values()];
}

function PromoCode() {
  const { promoCode, setPromoCode } = useMarketplaceCart();
  const { quote } = useCartQuote();
  const [draft, setDraft] = useState("");

  if (promoCode && quote?.promo) {
    return (
      <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs" style={{ border: "1px solid #4ADE8060", color: "#4ADE80" }}>
        <span className="flex items-center gap-2 min-w-0">
          <Tag className="w-3.5 h-3.5 shrink-0" />
          <span className="min-w-0">
            <span className="font-mono font-bold">{quote.promo.code}</span> applied: {quote.promo.description}
          </span>
        </span>
        <button type="button" onClick={() => setPromoCode(null)} aria-label="Remove discount code" className="shrink-0 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (draft.trim()) setPromoCode(draft.trim().toUpperCase());
      }}
    >
      <label htmlFor="promo-code" className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: `${CREAM}CC` }}>
        Discount code
      </label>
      <div className="flex">
        <input
          id="promo-code"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Enter code"
          autoComplete="off"
          className={`${darkInputClass} h-11 uppercase font-mono`}
          style={{ backgroundColor: BG, color: CREAM, border: `1px solid ${BLUE}50`, borderRight: "none" }}
        />
        <button type="submit" className="px-4 h-11 text-xs font-extrabold uppercase tracking-tighter transition-colors hover:bg-white/10" style={{ color: CREAM, border: `1px solid ${BLUE}50` }}>
          Apply
        </button>
      </div>
      {promoCode && quote?.promoError && (
        <p className="text-xs mt-2 text-red-300" role="alert">
          {quote.promoError}{" "}
          <button type="button" className="underline" onClick={() => setPromoCode(null)}>
            Clear
          </button>
        </p>
      )}
    </form>
  );
}

export default function MarketplaceCartPage() {
  const { lines, isReady, updateQuantity, removeLine, totalQuantity } = useMarketplaceCart();
  const { quote } = useCartQuote();

  const groups = quote?.groups ?? groupBySeller(lines);
  const priced = (handle: string) => quote?.groups.find((g) => g.vendor.handle === handle);

  return (
    <>
      <PageHeader eyebrow="Basket" title="Your Basket" />

      <section className="py-10 md:py-14" style={{ backgroundColor: BG }}>
        <div className="max-w-[95vw] mx-auto px-6 md:px-10">
          {!isReady ? (
            <div className="h-64 animate-pulse" style={{ backgroundColor: BG2 }} aria-busy="true" />
          ) : lines.length === 0 ? (
            <Notice
              title="Your Basket Is Empty"
              message="Anything you add will be saved here, ready for when you check out."
              actionHref="/marketplace/shop"
              actionLabel="Start Shopping"
            />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
              {/* Lines, grouped by seller */}
              <div className="lg:col-span-2 space-y-6">
                {groups.map((group) => {
                  const pricing = priced(group.vendor.handle);
                  return (
                    <div key={group.vendor.handle} style={{ border: `1px solid ${BLUE}50` }}>
                      <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1" style={{ backgroundColor: BG2, borderBottom: `1px solid ${BLUE}50` }}>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: `${CREAM}B3` }}>
                          Sent by{" "}
                          <Link href={`/marketplace/sellers/${group.vendor.handle}`} className="transition-colors hover:text-white" style={{ color: BLUE }}>
                            {group.vendor.name}
                          </Link>
                        </span>
                        {pricing && (
                          <span className="flex items-center gap-1.5 text-xs" style={{ color: `${CREAM}B3` }}>
                            <Truck className="w-3.5 h-3.5" style={{ color: BLUE }} />
                            {pricing.delivery === 0 ? "Free delivery" : `${formatPrice(pricing.delivery)} delivery`}
                          </span>
                        )}
                      </div>

                      <ul>
                        {group.lines.map((line, i) => (
                          <li key={line.variantId} className="flex gap-4 p-4 md:p-5" style={{ borderTop: i > 0 ? `1px solid ${BLUE}30` : undefined }}>
                            <Link
                              href={`/marketplace/p/${line.productHandle}`}
                              className="relative w-20 h-24 md:w-24 md:h-28 shrink-0 overflow-hidden"
                              style={{ border: `1px solid ${BLUE}30` }}
                              aria-label={line.title}
                            >
                              <ProductImage image={line.image} categoryHandle="" />
                            </Link>
                            <div className="flex-1 min-w-0 flex flex-col">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <Link
                                    href={`/marketplace/p/${line.productHandle}`}
                                    className="block text-sm md:text-base font-extrabold uppercase tracking-tighter transition-colors hover:text-white"
                                    style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                                  >
                                    {line.title}
                                  </Link>
                                  <p className="text-xs mt-1" style={{ color: `${CREAM}B3` }}>
                                    {line.variantTitle ? `${line.variantTitle} · ` : ""}
                                    {formatPrice(line.price)} each
                                  </p>
                                </div>
                                <span className="text-sm md:text-base font-extrabold tracking-tighter shrink-0 tabular-nums" style={{ color: CREAM }}>
                                  {formatPrice(line.price * line.quantity)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3 mt-auto pt-3">
                                <QuantityStepper quantity={line.quantity} onChange={(q) => updateQuantity(line.variantId, q)} label={line.title} />
                                <button
                                  type="button"
                                  onClick={() => removeLine(line.variantId)}
                                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:text-white"
                                  style={{ color: `${CREAM}B3` }}
                                  aria-label={`Remove ${line.title} from basket`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>

                      {pricing && (pricing.toFreeDelivery !== null || pricing.dispatch) && (
                        <p className="px-5 py-3 text-xs" style={{ color: `${CREAM}B3`, borderTop: `1px solid ${BLUE}30` }}>
                          {pricing.toFreeDelivery !== null && (
                            <>
                              Spend <strong style={{ color: CREAM }}>{formatPrice(pricing.toFreeDelivery)}</strong> more with {group.vendor.name} for free delivery.{" "}
                            </>
                          )}
                          {pricing.dispatch}.
                        </p>
                      )}
                    </div>
                  );
                })}

                {groups.length > 1 && (
                  <p className="text-xs" style={{ color: `${CREAM}B3` }}>
                    Your basket has items from {groups.length} sellers. Each seller sends their own parcel, so your order
                    will arrive in {groups.length} deliveries.
                  </p>
                )}
              </div>

              {/* Summary */}
              <aside className="lg:sticky lg:top-32 space-y-4" aria-label="Order summary">
                <Panel title="Summary">
                  <CartTotals quote={quote} itemCount={totalQuantity} />

                  <div className="mt-6">
                    <PromoCode />
                  </div>

                  <Link
                    href="/marketplace/checkout"
                    className="w-full mt-6 py-4 flex items-center justify-center gap-3 font-extrabold uppercase tracking-tighter text-sm text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: DEEP }}
                  >
                    <Lock className="w-4 h-4" /> Checkout <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/marketplace/shop"
                    className="block mt-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-white"
                    style={{ color: `${CREAM}B3` }}
                  >
                    Continue shopping
                  </Link>
                </Panel>
                <p className="text-xs leading-relaxed" style={{ color: `${CREAM}80` }}>
                  Delivery is charged per seller. See{" "}
                  <Link href="/marketplace/help" className="underline hover:text-white">
                    delivery and returns
                  </Link>{" "}
                  for details.
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
