"use client";

import { marketplaceService } from "@/services/marketplaceService";
import { useMarketplaceQuery } from "@/hooks/useMarketplaceQuery";
import { useMarketplaceCart } from "@/context/MarketplaceCartContext";
import type { CartQuote } from "@/types/marketplace";
import { BLUE, CREAM, formatPrice } from "@/components/marketplace/theme";

/** Live pricing for the current basket: per-seller delivery and any discount code. */
export function useCartQuote() {
  const { lines, promoCode, isReady } = useMarketplaceCart();
  const key = `quote:${promoCode ?? ""}:${lines.map((l) => `${l.variantId}x${l.quantity}`).join(",")}`;
  const { data, loading } = useMarketplaceQuery<CartQuote>(key, () => marketplaceService.quoteCart(lines, promoCode));
  return { quote: isReady ? data : null, loading: loading || !isReady };
}

/** Totals block shared by the basket and checkout. */
export function CartTotals({ quote, itemCount }: { quote: CartQuote | null; itemCount: number }) {
  const row = "flex justify-between gap-4";
  const pending = <span className="inline-block w-14 h-4 animate-pulse align-middle" style={{ backgroundColor: `${BLUE}30` }} />;

  return (
    <dl className="space-y-3 text-sm" style={{ color: `${CREAM}CC` }}>
      <div className={row}>
        <dt>
          Items ({itemCount})
        </dt>
        <dd className="font-semibold tabular-nums" style={{ color: CREAM }}>
          {quote ? formatPrice(quote.subtotal) : pending}
        </dd>
      </div>

      {quote && quote.groups.length > 1 ? (
        quote.groups.map((group) => (
          <div key={group.vendor.handle} className={row}>
            <dt className="min-w-0 truncate">Delivery from {group.vendor.name}</dt>
            <dd className="tabular-nums shrink-0" style={{ color: CREAM }}>
              {group.delivery === 0 ? "Free" : formatPrice(group.delivery)}
            </dd>
          </div>
        ))
      ) : (
        <div className={row}>
          <dt>Delivery</dt>
          <dd className="tabular-nums" style={{ color: CREAM }}>
            {quote ? (quote.delivery === 0 ? "Free" : formatPrice(quote.delivery)) : pending}
          </dd>
        </div>
      )}

      {quote && quote.discount > 0 && quote.promo && (
        <div className={row} style={{ color: "#4ADE80" }}>
          <dt className="min-w-0">
            Discount <span className="font-mono font-bold">{quote.promo.code}</span>
          </dt>
          <dd className="tabular-nums shrink-0">−{formatPrice(quote.discount)}</dd>
        </div>
      )}

      <div className={`${row} pt-3 text-base font-extrabold`} style={{ borderTop: `1px solid ${BLUE}50`, color: CREAM }}>
        <dt className="uppercase tracking-tighter">Total</dt>
        <dd className="tabular-nums">{quote ? formatPrice(quote.total) : pending}</dd>
      </div>
    </dl>
  );
}
