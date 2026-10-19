"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Check, CheckCircle2, MapPin, MessageSquare, PackageCheck, Printer, ShoppingCart, Truck, XCircle } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { COURIERS, FULFILMENT_FLOW, money, ORDER_STATUS } from "@/lib/vendorOnboarding";
import type { OrderAction, VendorOrder } from "@/types/marketplaceVendor";
import { useVendor, useVendorMutation, vendorKeys } from "@/components/vendor/VendorProvider";
import {
  Button,
  ButtonLink,
  Callout,
  Card,
  ConfirmDialog,
  DetailList,
  EmptyState,
  Field,
  fmtDateTime,
  Input,
  LoadError,
  Modal,
  PageBody,
  PageHeader,
  Select,
  StatusBadge,
  TableSkeleton,
  ToastView,
  useToast,
  display,
} from "@/components/vendor/ui";

export default function VendorOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: vendorKeys.resource("order", id),
    queryFn: () => vendorService.getOrder(id),
  });

  if (order) return <OrderDetail order={order} />;

  return (
    <>
      <PageHeader eyebrow="Orders" title={isLoading ? "Loading order" : "Order not found"} />
      <PageBody>
        <Card flush>
          {isError ? (
            <LoadError message="We could not load this order." onRetry={() => void refetch()} compact />
          ) : isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="pb-8">
              <EmptyState icon={ShoppingCart} title="Order not found" hint="Check the link, or find it in your orders list." />
              <div className="flex justify-center">
                <ButtonLink href="/vendor/orders">Back to orders</ButtonLink>
              </div>
            </div>
          )}
        </Card>
      </PageBody>
    </>
  );
}

function FulfilmentSteps({ order }: { order: VendorOrder }) {
  const closed = order.status === "cancelled" || order.status === "refunded";
  // A closed order shows the steps it got through before it was closed.
  const reached = closed
    ? Math.max(...FULFILMENT_FLOW.map((status, i) => (order.timeline.some((e) => e.status === status) ? i : -1)))
    : FULFILMENT_FLOW.indexOf(order.status);

  return (
    <ol className="flex items-start">
      {FULFILMENT_FLOW.map((status, i) => {
        const done = i <= reached;
        const current = !closed && i === reached;
        const at = order.timeline.find((e) => e.status === status)?.at;
        return (
          <li key={status} className="flex-1 flex flex-col items-center text-center min-w-0">
            <div className="flex items-center w-full">
              <span className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done ? "bg-green-600" : "bg-gray-200"}`} />
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 text-[11px] font-bold ${
                  current ? "border-[#F59E0B] bg-[#F59E0B] text-white" : done ? "border-green-600 bg-green-600 text-white" : "border-gray-300 text-gray-400 bg-white"
                }`}
              >
                {done && !current ? <Check size={13} /> : i + 1}
              </span>
              <span className={`h-0.5 flex-1 ${i === FULFILMENT_FLOW.length - 1 ? "opacity-0" : done && i < reached ? "bg-green-600" : "bg-gray-200"}`} />
            </div>
            <span className={`mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-wide ${done ? "text-[#102C26]" : "text-gray-400"}`}>
              {ORDER_STATUS[status].label}
            </span>
            {at && <span className="hidden sm:block text-[10px] text-gray-500 mt-0.5">{fmtDateTime(at)}</span>}
          </li>
        );
      })}
    </ol>
  );
}

function OrderDetail({ order }: { order: VendorOrder }) {
  const vendor = useVendor();
  const { toast, flash } = useToast();
  const [shipOpen, setShipOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [courier, setCourier] = useState(vendor.delivery.couriers[0] ?? COURIERS[0]);
  const [tracking, setTracking] = useState("");

  const update = useVendorMutation((action: OrderAction) => vendorService.updateOrder(order.id, action), {
    onSuccess: (_o, action) => {
      setShipOpen(false);
      setCancelOpen(false);
      const messages = { accept: "Order accepted", pack: "Marked as packed", ship: "Marked as shipped. The customer has been emailed.", deliver: "Marked as delivered", cancel: "Order cancelled" };
      flash("ok", messages[action.type]);
    },
    onError: (message) => flash("err", message),
  });
  const busy = (type: OrderAction["type"]) => update.isPending && update.variables?.type === type;
  const canCancel = ["new", "accepted", "packed"].includes(order.status);

  // The one thing the vendor should do next, by status.
  const next = {
    new: { title: "Accept this order", body: "Confirm you have the items and can send them on time.", action: <Button icon={CheckCircle2} loading={busy("accept")} onClick={() => update.mutate({ type: "accept" })}>Accept order</Button> },
    accepted: { title: "Pack the order", body: "Pack the items and print the packing slip to go in the parcel.", action: <Button icon={PackageCheck} loading={busy("pack")} onClick={() => update.mutate({ type: "pack" })}>Mark as packed</Button> },
    packed: { title: "Post it and add tracking", body: `Send it with your courier within ${vendor.delivery.dispatchDays} working day${vendor.delivery.dispatchDays === 1 ? "" : "s"} of the order.`, action: <Button icon={Truck} onClick={() => setShipOpen(true)}>Mark as shipped</Button> },
    shipped: { title: "On its way", body: "Mark it delivered once the courier confirms, so the payment is released to your balance.", action: <Button variant="secondary" icon={CheckCircle2} loading={busy("deliver")} onClick={() => update.mutate({ type: "deliver" })}>Mark as delivered</Button> },
    delivered: null,
    cancelled: null,
    refunded: null,
  }[order.status];

  const closingEvent = order.timeline.find((e) => e.status === order.status);

  return (
    <>
      <ToastView toast={toast} />
      <PageHeader
        eyebrow="Orders"
        title={`Order ${order.number}`}
        description={`Placed ${fmtDateTime(order.placedAt)}`}
        actions={
          <>
            <ButtonLink href="/vendor/orders" variant="ghost" icon={ArrowLeft}>
              All orders
            </ButtonLink>
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
              Packing slip
            </Button>
          </>
        }
      />

      <PageBody>
        <Card>
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className={`${display.className} text-sm font-bold uppercase tracking-tight text-[#102C26]`}>Fulfilment</h2>
            <StatusBadge status={order.status} map={ORDER_STATUS} />
          </div>
          <FulfilmentSteps order={order} />

          {next && (
            <div className="mt-6">
              <Callout tone="info" title={next.title} action={next.action}>
                {next.body}
              </Callout>
            </div>
          )}
          {order.status === "delivered" && (
            <div className="mt-6">
              <Callout tone="success" icon={CheckCircle2} title="Delivered">
                {order.payoutId ? "This order has been included in a payout." : `${money(order.vendorNet)} has been added to your available balance.`}
              </Callout>
            </div>
          )}
          {(order.status === "cancelled" || order.status === "refunded") && (
            <div className="mt-6">
              <Callout tone="danger" icon={XCircle} title={order.status === "cancelled" ? "This order was cancelled" : "This order was refunded"}>
                {closingEvent?.note ?? "No reason was recorded."} You are not paid for this order.
              </Callout>
            </div>
          )}
        </Card>

        <div className="grid lg:grid-cols-3 gap-5 items-start">
          <div className="lg:col-span-2 space-y-5">
            <Card title="Items" flush>
              <ul className="divide-y divide-[#102C26]/8">
                {order.items.map((item) => (
                  <li key={`${item.productId}-${item.sku}`} className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.variantName && `${item.variantName} · `}
                        <span className="font-mono">{item.sku}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900 tabular-nums">{money(item.unitPrice * item.quantity)}</p>
                      <p className="text-xs text-gray-500 tabular-nums">
                        {item.quantity} × {money(item.unitPrice)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="px-4 sm:px-5 py-4 border-t border-[#102C26]/12 bg-gray-50/60 space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-gray-600">Items</dt><dd className="tabular-nums text-gray-900">{money(order.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-600">Delivery</dt><dd className="tabular-nums text-gray-900">{order.shipping === 0 ? "Free" : money(order.shipping)}</dd></div>
                {order.discount ? <div className="flex justify-between"><dt className="text-gray-600">Your promotion</dt><dd className="tabular-nums text-gray-900">−{money(order.discount)}</dd></div> : null}
                <div className="flex justify-between font-semibold"><dt className="text-gray-900">Customer paid</dt><dd className="tabular-nums text-gray-900">{money(order.total)}</dd></div>
                <div className="flex justify-between pt-1.5 border-t border-[#102C26]/8"><dt className="text-gray-600">HalalMe commission ({order.commissionRate}%)</dt><dd className="tabular-nums text-gray-900">−{money(order.commissionAmount)}</dd></div>
                <div className="flex justify-between font-bold text-[#102C26]"><dt>You earn</dt><dd className="tabular-nums">{money(order.vendorNet)}</dd></div>
              </dl>
            </Card>

            <Card title="History">
              <ol className="space-y-4">
                {[...order.timeline].reverse().map((event, i) => (
                  <li key={`${event.status}-${event.at}`} className="flex gap-3">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 0 ? "bg-[#F59E0B]" : "bg-gray-300"}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{ORDER_STATUS[event.status].label}</p>
                      <p className="text-xs text-gray-500">
                        {fmtDateTime(event.at)}
                        {event.note && ` · ${event.note}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <div className="space-y-5">
            <Card title="Deliver to">
              <div className="flex gap-3">
                <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <address className="not-italic text-sm text-gray-900 leading-relaxed">
                  <strong>{order.customer.name}</strong>
                  <br />
                  {order.shippingAddress.line1}
                  <br />
                  {order.shippingAddress.city}
                  <br />
                  {order.shippingAddress.postCode}
                </address>
              </div>
              {order.customerNote && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-[#102C26]/8">
                  <MessageSquare size={16} className="text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{order.customerNote}</p>
                </div>
              )}
            </Card>

            <Card title="Customer" subtitle="Only use these details to deliver this order.">
              <DetailList
                rows={[
                  { label: "Email", value: order.customer.email },
                  { label: "Phone", value: order.customer.phone },
                ]}
              />
            </Card>

            {order.tracking && (
              <Card title="Tracking">
                <DetailList
                  rows={[
                    { label: "Courier", value: order.tracking.courier },
                    { label: "Number", value: <span className="font-mono">{order.tracking.number}</span> },
                  ]}
                />
              </Card>
            )}

            {canCancel && (
              <Button block variant="ghost" icon={XCircle} onClick={() => setCancelOpen(true)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Cancel order
              </Button>
            )}
          </div>
        </div>
      </PageBody>

      <Modal open={shipOpen} onClose={() => setShipOpen(false)} busy={busy("ship")} labelledBy="ship-title">
        <form
          className="p-5 sm:p-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate({ type: "ship", courier, trackingNumber: tracking });
          }}
        >
          <h2 id="ship-title" className={`${display.className} text-base font-bold uppercase tracking-tight text-[#102C26]`}>
            Mark as shipped
          </h2>
          <p className="text-sm text-gray-600">The customer is emailed a tracking link as soon as you confirm.</p>
          <Field label="Courier">
            <Select value={courier} onChange={(e) => setCourier(e.target.value)} options={COURIERS.map((c) => ({ value: c, label: c }))} />
          </Field>
          <Field label="Tracking number">
            <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. RM123456789GB" autoComplete="off" />
          </Field>
          {update.isError && (
            <Callout tone="danger" icon={AlertCircle}>
              {update.error instanceof Error ? update.error.message : "Could not update the order."}
            </Callout>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setShipOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={Truck} loading={busy("ship")} disabled={!tracking.trim()}>
              Confirm shipped
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={(reason) => update.mutate({ type: "cancel", reason })}
        busy={busy("cancel")}
        danger
        title="Cancel this order?"
        body="The customer is refunded in full and told why. Cancelling often can affect your store's standing."
        confirmLabel="Cancel order"
        noteLabel="Reason shown to the customer"
        notePlaceholder="e.g. Item is out of stock"
        noteRequired
      />
    </>
  );
}
