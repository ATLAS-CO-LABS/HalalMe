"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, CheckCircle2, LifeBuoy, MapPin, Truck, XCircle } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { useMarketplaceQuery } from "@/hooks/useMarketplaceQuery";
import type { CustomerOrder, CustomerParcel, ParcelStatus } from "@/types/marketplace";
import { formatDate, Notice, PageHeader, Panel, PARCEL_STATUS, ParcelBadge } from "@/components/marketplace/shared";
import { BG, BG2, BLUE, CREAM, DEEP, formatPrice } from "@/components/marketplace/theme";

const STEPS: { status: ParcelStatus; label: string }[] = [
  { status: "new", label: "Placed" },
  { status: "accepted", label: "Preparing" },
  { status: "shipped", label: "On its way" },
  { status: "delivered", label: "Delivered" },
];

/** How far along the four customer-facing steps a parcel is. "Packed" still reads as preparing. */
function stepIndex(parcel: CustomerParcel): number {
  const reached = (status: ParcelStatus) => parcel.timeline.some((e) => e.status === status);
  if (reached("delivered")) return 3;
  if (reached("shipped")) return 2;
  if (reached("accepted")) return 1;
  return 0;
}

function ParcelCard({ parcel, index, count }: { parcel: CustomerParcel; index: number; count: number }) {
  const closed = parcel.status === "cancelled" || parcel.status === "refunded";
  const at = stepIndex(parcel);
  const closing = parcel.timeline.find((e) => e.status === parcel.status);

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: `${CREAM}B3` }}>
            {count > 1 ? `Parcel ${index + 1} of ${count}` : "Your parcel"} · {parcel.orderNumber}
          </p>
          <p className="text-lg font-extrabold uppercase tracking-tighter mt-1" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
            Sent by{" "}
            <Link href={`/marketplace/sellers/${parcel.vendor.handle}`} className="hover:text-white" style={{ color: BLUE }}>
              {parcel.vendor.name}
            </Link>
          </p>
        </div>
        <ParcelBadge status={parcel.status} />
      </div>

      {closed ? (
        <div className="flex items-start gap-3 px-4 py-3 text-sm mb-6" style={{ border: "1px solid #F8717180", color: "#FCA5A5" }}>
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            {parcel.status === "cancelled" ? "This parcel was cancelled by the seller" : "This parcel was refunded"}
            {closing?.note ? `: ${closing.note}.` : "."} Any payment for it is returned to your original payment method.
          </p>
        </div>
      ) : (
        <ol className="flex items-start mb-6" aria-label={`Progress: ${PARCEL_STATUS[parcel.status].label}`}>
          {STEPS.map((step, i) => {
            const done = i <= at;
            return (
              <li key={step.status} className="flex-1 flex flex-col items-center text-center min-w-0">
                <div className="flex items-center w-full">
                  <span className="h-0.5 flex-1" style={{ backgroundColor: i === 0 ? "transparent" : done ? BLUE : `${CREAM}25` }} />
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                    style={{ backgroundColor: done ? DEEP : "transparent", border: `2px solid ${done ? DEEP : `${CREAM}40`}`, color: done ? "#fff" : `${CREAM}80` }}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className="h-0.5 flex-1" style={{ backgroundColor: i === STEPS.length - 1 ? "transparent" : i < at ? BLUE : `${CREAM}25` }} />
                </div>
                <span className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-wide" style={{ color: done ? CREAM : `${CREAM}80` }}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {parcel.tracking && !closed && (
        <div className="flex items-start gap-3 px-4 py-3 mb-6" style={{ backgroundColor: BG, border: `1px solid ${BLUE}50` }}>
          <Truck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: BLUE }} />
          <p className="text-sm" style={{ color: `${CREAM}CC` }}>
            Sent with <strong style={{ color: CREAM }}>{parcel.tracking.courier}</strong>. Tracking number{" "}
            <span className="font-mono font-bold" style={{ color: CREAM }}>
              {parcel.tracking.number}
            </span>
            . Use it on the courier&apos;s website to follow your parcel.
          </p>
        </div>
      )}

      <ul style={{ borderTop: `1px solid ${BLUE}30` }}>
        {parcel.items.map((item) => (
          <li key={`${item.productHandle}-${item.variantTitle}`} className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: `1px solid ${BLUE}30` }}>
            <div className="min-w-0">
              <Link href={`/marketplace/p/${item.productHandle}`} className="text-sm font-bold hover:text-white" style={{ color: CREAM }}>
                {item.title}
              </Link>
              <p className="text-xs mt-0.5" style={{ color: `${CREAM}B3` }}>
                {item.variantTitle ? `${item.variantTitle} · ` : ""}Qty {item.quantity}
              </p>
            </div>
            <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: CREAM }}>
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <p className="flex justify-between text-xs mt-3" style={{ color: `${CREAM}B3` }}>
        <span>Delivery for this parcel</span>
        <span className="tabular-nums">{parcel.delivery === 0 ? "Free" : formatPrice(parcel.delivery)}</span>
      </p>
    </Panel>
  );
}

function OrderView({ order, justPlaced }: { order: CustomerOrder; justPlaced: boolean }) {
  return (
    <section className="py-10 md:py-14" style={{ backgroundColor: BG }}>
      <div className="max-w-[95vw] mx-auto px-6 md:px-10">
        {justPlaced && (
          <div className="flex items-start gap-4 p-5 md:p-6 mb-8" style={{ backgroundColor: BG2, border: "1px solid #4ADE8080" }} role="status">
            <CheckCircle2 className="w-7 h-7 shrink-0" style={{ color: "#4ADE80" }} />
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
                Thank you, {order.contact.name.split(" ")[0]}. Your order is placed.
              </h2>
              <p className="text-sm mt-1.5" style={{ color: `${CREAM}CC` }}>
                A confirmation is on its way to {order.contact.email}.{" "}
                {order.parcels.length > 1
                  ? `Your order is coming from ${order.parcels.length} sellers, so it will arrive in ${order.parcels.length} parcels. We will email you as each one ships.`
                  : "We will email you when it ships."}
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-2 space-y-6">
            {order.parcels.map((parcel, i) => (
              <ParcelCard key={parcel.orderNumber} parcel={parcel} index={i} count={order.parcels.length} />
            ))}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-32">
            <Panel title="Summary">
              <dl className="space-y-3 text-sm" style={{ color: `${CREAM}CC` }}>
                <div className="flex justify-between gap-4">
                  <dt>Items</dt>
                  <dd className="tabular-nums" style={{ color: CREAM }}>{formatPrice(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Delivery</dt>
                  <dd className="tabular-nums" style={{ color: CREAM }}>{order.delivery === 0 ? "Free" : formatPrice(order.delivery)}</dd>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between gap-4" style={{ color: "#4ADE80" }}>
                    <dt>Discount</dt>
                    <dd className="tabular-nums">−{formatPrice(order.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 pt-3 text-base font-extrabold" style={{ borderTop: `1px solid ${BLUE}50`, color: CREAM }}>
                  <dt className="uppercase tracking-tighter">Total</dt>
                  <dd className="tabular-nums">{formatPrice(order.total)}</dd>
                </div>
              </dl>
            </Panel>

            <Panel title="Delivering to">
              <div className="flex gap-3">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: BLUE }} />
                <address className="not-italic text-sm leading-relaxed" style={{ color: `${CREAM}CC` }}>
                  <strong style={{ color: CREAM }}>{order.contact.name}</strong>
                  <br />
                  {order.address.line1}
                  <br />
                  {order.address.city}
                  <br />
                  {order.address.postCode}
                </address>
              </div>
            </Panel>

            <Panel title="Need help?">
              <p className="text-sm leading-relaxed" style={{ color: `${CREAM}CC` }}>
                Something not right, or want to return an item? Contact HalalMe and quote the parcel number. We deal
                with the seller for you.
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <Link href="/contact" className="flex items-center justify-center gap-2 py-3 text-xs font-extrabold uppercase tracking-tighter text-white hover:opacity-90" style={{ backgroundColor: DEEP }}>
                  <LifeBuoy className="w-4 h-4" /> Contact support
                </Link>
                <Link href="/marketplace/help" className="text-center py-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white" style={{ color: `${CREAM}B3` }}>
                  Delivery and returns
                </Link>
              </div>
            </Panel>
          </aside>
        </div>
      </div>
    </section>
  );
}

function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const justPlaced = useSearchParams().get("placed") === "1";
  const { data: order, loading, error } = useMarketplaceQuery(`my-order:${id}`, () => marketplaceService.getMyOrder(id));

  return (
    <>
      <PageHeader
        eyebrow={justPlaced ? "Order confirmed" : "Your orders"}
        title={order ? `Order placed ${formatDate(order.placedAt)}` : loading ? "Loading order" : "Order Not Found"}
      />
      {order ? (
        <>
          <div className="max-w-[95vw] mx-auto px-6 md:px-10 pt-6">
            <Link href="/marketplace/orders" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-white" style={{ color: `${CREAM}B3` }}>
              <ArrowLeft className="w-3.5 h-3.5" /> All orders
            </Link>
          </div>
          <OrderView order={order} justPlaced={justPlaced} />
        </>
      ) : (
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 py-12">
          {loading ? (
            <div className="h-64 animate-pulse" style={{ backgroundColor: BG2 }} aria-busy="true" />
          ) : (
            <Notice
              title={error ? "Something Went Wrong" : "Order Not Found"}
              message={error ? "We could not load this order. Please refresh and try again." : "We could not find that order on this device."}
              actionHref="/marketplace/orders"
              actionLabel="Your Orders"
            />
          )}
        </div>
      )}
    </>
  );
}

export default function MarketplaceOrderPage() {
  return (
    <Suspense fallback={null}>
      <OrderPage />
    </Suspense>
  );
}
