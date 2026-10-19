"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Banknote, ClipboardList, Coins, Hourglass, PackageSearch, PoundSterling, ShoppingCart, Store } from "lucide-react";
import { BarList, ChartCard, Funnel, TimeSeries } from "../analytics/_charts";
import { marketplaceAdminService } from "@/services/marketplaceAdminService";
import { money, VENDOR_STATUS } from "@/lib/vendorOnboarding";
import type { AdminMarketplaceOverview, VendorStatus } from "@/types/marketplaceVendor";
import { Badge, Card, LoadError, StatCard } from "@/components/vendor/ui";
import { marketplaceKey } from "./_shared";

const ATTENTION_ICON: Record<AdminMarketplaceOverview["attention"][number]["kind"], React.ElementType> = {
  application: ClipboardList,
  product: PackageSearch,
  payout: Banknote,
  stalled: Hourglass,
};

const STATUS_ORDER: VendorStatus[] = ["active", "submitted", "changes_requested", "draft", "suspended", "rejected"];

function Skeleton() {
  return <div className="h-50 animate-pulse bg-gray-100" />;
}

export default function OverviewTab({ onOpenTab }: { onOpenTab: (tab: "vendors" | "products" | "payouts") => void }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: marketplaceKey("overview"),
    queryFn: () => marketplaceAdminService.getOverview(),
  });

  if (isError) {
    return (
      <Card>
        <LoadError message="Could not load the marketplace overview." onRetry={() => void refetch()} compact />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Sales" value={data ? money(data.gmv30) : "—"} sub="Last 30 days" icon={PoundSterling} tone="brand" deltaPct={data?.gmv30Delta} />
        <StatCard label="Commission" value={data ? money(data.commission30) : "—"} sub="Our revenue, 30 days" icon={Coins} tone="accent" />
        <StatCard label="Orders" value={data?.orders30 ?? "—"} sub="Last 30 days" icon={ShoppingCart} tone="brand" />
        <StatCard label="Applications" value={data?.applicationsWaiting ?? "—"} sub="Waiting for review" icon={ClipboardList} tone={data?.applicationsWaiting ? "warning" : "success"} onClick={() => onOpenTab("vendors")} />
        <StatCard label="Products" value={data?.productsWaiting ?? "—"} sub="Waiting for approval" icon={PackageSearch} tone={data?.productsWaiting ? "warning" : "success"} onClick={() => onOpenTab("products")} />
        <StatCard label="Payouts due" value={data ? money(data.payoutsDue) : "—"} sub="Owed to vendors" icon={Banknote} tone="success" onClick={() => onOpenTab("payouts")} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <ChartCard title="Marketplace sales" subtitle="Last 30 days, all vendors">
            {isLoading || !data ? <Skeleton /> : <TimeSeries data={data.gmvSeries} format={(n) => `£${Math.round(n)}`} />}
          </ChartCard>

          <div className="grid md:grid-cols-2 gap-5">
            <ChartCard title="Top vendors" subtitle="By sales, last 30 days">
              {isLoading || !data ? <Skeleton /> : <BarList data={data.topVendors} format={(n) => money(n)} />}
            </ChartCard>
            <ChartCard title="Onboarding funnel" subtitle="How far vendors get">
              {isLoading || !data ? <Skeleton /> : <Funnel stages={data.funnel} />}
            </ChartCard>
          </div>
        </div>

        <div className="space-y-5">
          <Card title="Needs attention" flush>
            {isLoading || !data ? (
              <div className="p-5 space-y-3 animate-pulse">
                <div className="h-4 bg-gray-100 w-3/4" />
                <div className="h-4 bg-gray-100 w-1/2" />
              </div>
            ) : data.attention.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-500 text-center">Nothing is waiting on the team.</p>
            ) : (
              <ul className="divide-y divide-[#102C26]/8">
                {data.attention.map((item) => {
                  const Icon = ATTENTION_ICON[item.kind];
                  return (
                    <li key={item.id}>
                      <Link href={item.href} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-[#102C26]/[0.02] transition-colors">
                        <Icon size={16} className="text-[#B45309] shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-gray-900 truncate">{item.title}</span>
                          <span className="block text-xs text-gray-500">{item.detail}</span>
                        </span>
                        <ArrowRight size={14} className="text-gray-400 shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card
            title="Vendors"
            action={
              <button onClick={() => onOpenTab("vendors")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#102C26] hover:text-[#B45309]">
                View all <ArrowRight size={13} />
              </button>
            }
          >
            <ul className="space-y-2.5">
              {STATUS_ORDER.map((status) => (
                <li key={status} className="flex items-center justify-between gap-3">
                  <Badge label={VENDOR_STATUS[status].label} tone={VENDOR_STATUS[status].tone} />
                  <span className="text-sm font-semibold tabular-nums text-gray-900">{data?.vendorsByStatus[status] ?? "—"}</span>
                </li>
              ))}
            </ul>
            <p className="flex items-center gap-2 text-xs text-gray-500 mt-4 pt-3 border-t border-[#102C26]/8">
              <Store size={13} /> {data ? Object.values(data.vendorsByStatus).reduce((a, b) => a + b, 0) : "—"} vendors in total
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
