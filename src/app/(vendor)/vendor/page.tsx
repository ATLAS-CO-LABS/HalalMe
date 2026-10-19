"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Boxes, PackagePlus, PartyPopper, PoundSterling, ShoppingCart, Store, Truck, Wallet } from "lucide-react";
import { ChartCard, TimeSeries } from "@/app/admin/analytics/_charts";
import { vendorService } from "@/services/vendorService";
import { money, ORDER_STATUS, PRODUCT_STATUS } from "@/lib/vendorOnboarding";
import { useVendor, useVendorMutation, vendorKeys } from "@/components/vendor/VendorProvider";
import {
  Button,
  ButtonLink,
  Callout,
  Card,
  EmptyState,
  fmtDate,
  LoadError,
  PageBody,
  PageHeader,
  StatCard,
  StatusBadge,
  TableSkeleton,
} from "@/components/vendor/ui";

export default function VendorOverviewPage() {
  const vendor = useVendor();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: vendorKeys.resource("overview"),
    queryFn: () => vendorService.getOverview(),
  });
  const dismissWelcome = useVendorMutation(() => vendorService.updateVendor({ welcomeSeen: true }));

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Salaam, ${vendor.owner.name.split(" ")[0]}`}
        description={`Here is how ${vendor.store.name} is doing.`}
        actions={
          <ButtonLink href="/vendor/products/new" icon={PackagePlus}>
            Add product
          </ButtonLink>
        }
      />

      <PageBody>
        {!vendor.welcomeSeen && (
          <Callout
            tone="success"
            icon={PartyPopper}
            title="Your store is approved"
            action={
              <Button size="sm" variant="secondary" loading={dismissWelcome.isPending} onClick={() => dismissWelcome.mutate(undefined)}>
                Got it
              </Button>
            }
          >
            Welcome to HalalMe Marketplace. Add your first products and they will go live once our team has checked
            them.
          </Callout>
        )}

        {isError ? (
          <Card>
            <LoadError message="We could not load your overview." onRetry={() => void refetch()} compact />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard label="Sales" value={data ? money(data.sales30) : "—"} sub="Last 30 days" icon={PoundSterling} tone="brand" deltaPct={data?.sales30Delta} />
              <StatCard label="Orders" value={data?.orders30 ?? "—"} sub="Last 30 days" icon={ShoppingCart} tone="accent" deltaPct={data?.orders30Delta} />
              <StatCard label="To fulfil" value={data?.toFulfil ?? "—"} sub="Waiting on you" icon={Truck} tone={data && data.toFulfil > 0 ? "warning" : "success"} />
              <StatCard label="Available balance" value={data ? money(data.available) : "—"} sub="Ready for payout" icon={Wallet} tone="success" />
            </div>

            {data && data.liveProducts === 0 && (
              <Callout
                tone="info"
                icon={Store}
                title="You have no live products yet"
                action={
                  <ButtonLink size="sm" href="/vendor/products/new" icon={PackagePlus}>
                    Add a product
                  </ButtonLink>
                }
              >
                Customers can only find your store once at least one product is live.
              </Callout>
            )}

            <div className="grid lg:grid-cols-3 gap-5 items-start">
              <div className="lg:col-span-2 space-y-5">
                <ChartCard title="Sales" subtitle="Last 30 days, including delivery charges">
                  {isLoading || !data ? <div className="h-50 animate-pulse bg-gray-100" /> : <TimeSeries data={data.salesSeries} format={(n) => `£${Math.round(n)}`} />}
                </ChartCard>

                <Card
                  title="Recent orders"
                  flush
                  action={
                    <Link href="/vendor/orders" className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#102C26] hover:text-[#B45309]">
                      All orders <ArrowRight size={13} />
                    </Link>
                  }
                >
                  {isLoading || !data ? (
                    <TableSkeleton />
                  ) : data.recentOrders.length === 0 ? (
                    <EmptyState icon={ShoppingCart} title="No orders yet" hint="New orders will show here as soon as customers buy from you." />
                  ) : (
                    <ul className="divide-y divide-[#102C26]/8">
                      {data.recentOrders.map((order) => (
                        <li key={order.id}>
                          <Link href={`/vendor/orders/${order.id}`} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-[#102C26]/[0.02] transition-colors">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900">
                                {order.number} <span className="font-normal text-gray-500">· {order.customer.name}</span>
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {order.items.map((i) => `${i.quantity} × ${i.title}`).join(", ")}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="hidden sm:inline text-xs text-gray-500">{fmtDate(order.placedAt)}</span>
                              <span className="text-sm font-semibold tabular-nums text-gray-900">{money(order.total)}</span>
                              <StatusBadge status={order.status} map={ORDER_STATUS} />
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>

              <div className="space-y-5">
                <Card title="Needs attention" flush>
                  {isLoading || !data ? (
                    <div className="p-5 space-y-3 animate-pulse">
                      <div className="h-4 bg-gray-100 w-3/4" />
                      <div className="h-4 bg-gray-100 w-1/2" />
                    </div>
                  ) : data.toFulfil === 0 && data.productsNeedingAction.length === 0 && data.lowStock.length === 0 ? (
                    <p className="px-5 py-8 text-sm text-gray-500 text-center">You are all caught up.</p>
                  ) : (
                    <ul className="divide-y divide-[#102C26]/8">
                      {data.toFulfil > 0 && (
                        <li>
                          <Link href="/vendor/orders" className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-[#102C26]/[0.02]">
                            <Truck size={16} className="text-[#B45309] shrink-0" />
                            <span className="text-sm text-gray-900 flex-1">
                              <strong>{data.toFulfil}</strong> order{data.toFulfil === 1 ? "" : "s"} to fulfil
                            </span>
                            <ArrowRight size={14} className="text-gray-400" />
                          </Link>
                        </li>
                      )}
                      {data.productsNeedingAction.map((product) => (
                        <li key={product.id}>
                          <Link href={`/vendor/products/${product.id}`} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-[#102C26]/[0.02]">
                            <AlertTriangle size={16} className="text-[#B45309] shrink-0" />
                            <span className="text-sm text-gray-900 flex-1 min-w-0 truncate">{product.title}</span>
                            <StatusBadge status={product.status} map={PRODUCT_STATUS} />
                          </Link>
                        </li>
                      ))}
                      {data.lowStock.map(({ product, variant }) => (
                        <li key={variant.id}>
                          <Link href="/vendor/inventory" className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-[#102C26]/[0.02]">
                            <Boxes size={16} className={`shrink-0 ${variant.stock === 0 ? "text-red-500" : "text-[#B45309]"}`} />
                            <span className="text-sm text-gray-900 flex-1 min-w-0 truncate">
                              {product.title}
                              {product.variants.length > 1 && <span className="text-gray-500"> · {variant.name}</span>}
                            </span>
                            <span className={`text-xs font-bold whitespace-nowrap ${variant.stock === 0 ? "text-red-600" : "text-[#B45309]"}`}>
                              {variant.stock === 0 ? "Out of stock" : `${variant.stock} left`}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                <Card title="Your store">
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Live products</dt>
                      <dd className="font-semibold text-gray-900">{data?.liveProducts ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Delivery</dt>
                      <dd className="font-semibold text-gray-900">{money(vendor.delivery.ukRate)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Dispatch</dt>
                      <dd className="font-semibold text-gray-900">
                        {vendor.delivery.dispatchDays} working day{vendor.delivery.dispatchDays === 1 ? "" : "s"}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 pt-4 border-t border-[#102C26]/8">
                    <ButtonLink href="/vendor/store" variant="secondary" block>
                      Edit store
                    </ButtonLink>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </PageBody>
    </>
  );
}
